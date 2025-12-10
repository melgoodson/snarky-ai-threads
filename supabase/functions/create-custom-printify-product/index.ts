import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const printifyApiToken = Deno.env.get('PRINTIFY_API_TOKEN');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!printifyApiToken) {
      throw new Error('PRINTIFY_API_TOKEN not configured');
    }

    const { 
      designImageUrl,
      baseProductId,
      variantId,
      customTitle,
    } = await req.json();

    console.log('Creating custom Printify product:', { designImageUrl, baseProductId, variantId, customTitle });

    if (!designImageUrl || !baseProductId) {
      throw new Error('designImageUrl and baseProductId are required');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch base product details from database
    const { data: baseProduct, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', baseProductId)
      .single();

    if (productError || !baseProduct) {
      throw new Error(`Base product not found: ${baseProductId}`);
    }

    console.log('Base product:', baseProduct.title, 'Printify ID:', baseProduct.printify_product_id);

    // Get shop ID from Printify
    const shopsResponse = await fetch('https://api.printify.com/v1/shops.json', {
      headers: {
        'Authorization': `Bearer ${printifyApiToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!shopsResponse.ok) {
      throw new Error(`Failed to fetch shops: ${shopsResponse.statusText}`);
    }

    const shops = await shopsResponse.json();
    if (!shops || shops.length === 0) {
      throw new Error('No Printify shops found');
    }

    const shopId = shops[0].id;
    console.log('Using shop ID:', shopId);

    // Step 1: Upload design image to Printify
    console.log('Uploading design image to Printify...');
    
    let imageData: string;
    
    // Check if the design image is a URL or base64
    if (designImageUrl.startsWith('http')) {
      // Fetch the image and convert to base64
      const imageResponse = await fetch(designImageUrl);
      if (!imageResponse.ok) {
        throw new Error(`Failed to fetch design image: ${imageResponse.statusText}`);
      }
      const imageBuffer = await imageResponse.arrayBuffer();
      imageData = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));
    } else if (designImageUrl.startsWith('data:')) {
      // Extract base64 from data URL
      imageData = designImageUrl.split(',')[1];
    } else {
      throw new Error('Invalid design image URL format');
    }

    const uploadResponse = await fetch('https://api.printify.com/v1/uploads/images.json', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${printifyApiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file_name: `custom-design-${Date.now()}.png`,
        contents: imageData,
      }),
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('Printify image upload failed:', errorText);
      throw new Error(`Failed to upload image to Printify: ${errorText}`);
    }

    const uploadedImage = await uploadResponse.json();
    console.log('Image uploaded to Printify:', uploadedImage.id, uploadedImage.preview_url);

    // Step 2: Fetch the original product from Printify to get blueprint and print provider
    const originalProductResponse = await fetch(
      `https://api.printify.com/v1/shops/${shopId}/products/${baseProduct.printify_product_id}.json`,
      {
        headers: {
          'Authorization': `Bearer ${printifyApiToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!originalProductResponse.ok) {
      const errorText = await originalProductResponse.text();
      console.error('Failed to fetch original product:', errorText);
      throw new Error(`Failed to fetch original Printify product: ${errorText}`);
    }

    const originalProduct = await originalProductResponse.json();
    console.log('Original product blueprint:', originalProduct.blueprint_id, 'Print provider:', originalProduct.print_provider_id);

    // Step 3: Get print areas structure from original product
    const originalPrintAreas = originalProduct.print_areas || [];
    
    // Build new print areas with our uploaded image
    const newPrintAreas = originalPrintAreas.map((area: any) => ({
      variant_ids: area.variant_ids,
      placeholders: [{
        position: "front",
        images: [{
          id: uploadedImage.id,
          x: 0.5,
          y: 0.5,
          scale: 1,
          angle: 0,
        }],
      }],
    }));

    // If no print areas found, create default one
    if (newPrintAreas.length === 0) {
      const variantIds = originalProduct.variants?.map((v: any) => v.id) || [];
      newPrintAreas.push({
        variant_ids: variantIds,
        placeholders: [{
          position: "front",
          images: [{
            id: uploadedImage.id,
            x: 0.5,
            y: 0.5,
            scale: 1,
            angle: 0,
          }],
        }],
      });
    }

    // Step 4: Create new product in Printify with custom design
    const productTitle = customTitle || `Custom ${baseProduct.title} - ${Date.now()}`;
    
    const productData = {
      title: productTitle,
      description: `Custom design product based on ${baseProduct.title}`,
      blueprint_id: originalProduct.blueprint_id,
      print_provider_id: originalProduct.print_provider_id,
      variants: originalProduct.variants.map((v: any) => ({
        id: v.id,
        price: v.price,
        is_enabled: variantId ? v.id === Number(variantId) : v.is_enabled,
      })),
      print_areas: newPrintAreas,
    };

    console.log('Creating custom product with data:', JSON.stringify(productData, null, 2));

    const createResponse = await fetch(
      `https://api.printify.com/v1/shops/${shopId}/products.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${printifyApiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      }
    );

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error('Printify product creation failed:', errorText);
      throw new Error(`Failed to create custom product in Printify: ${errorText}`);
    }

    const customProduct = await createResponse.json();
    console.log('Custom product created in Printify:', customProduct.id);

    // Step 5: Publish the product to get mockups generated
    const publishResponse = await fetch(
      `https://api.printify.com/v1/shops/${shopId}/products/${customProduct.id}/publish.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${printifyApiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: true,
          description: true,
          images: true,
          variants: true,
          tags: true,
        }),
      }
    );

    if (!publishResponse.ok) {
      console.warn('Product publish failed, continuing anyway:', await publishResponse.text());
    } else {
      console.log('Product published for mockup generation');
    }

    // Step 6: Fetch the created product to get mockup images
    const fetchProductResponse = await fetch(
      `https://api.printify.com/v1/shops/${shopId}/products/${customProduct.id}.json`,
      {
        headers: {
          'Authorization': `Bearer ${printifyApiToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const finalProduct = await fetchProductResponse.json();
    console.log('Final product images:', finalProduct.images);

    // Get the mockup image URL (first image from the product)
    const mockupImageUrl = finalProduct.images?.[0]?.src || uploadedImage.preview_url;

    return new Response(
      JSON.stringify({
        success: true,
        printifyProductId: customProduct.id,
        mockupImageUrl: mockupImageUrl,
        uploadedImageId: uploadedImage.id,
        uploadedImagePreview: uploadedImage.preview_url,
        title: productTitle,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in create-custom-printify-product:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
