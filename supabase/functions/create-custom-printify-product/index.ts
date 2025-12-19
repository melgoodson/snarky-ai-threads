import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Product-specific print placement configurations for realistic integration
const PRINT_PLACEMENT_CONFIG: Record<string, { 
  scale: number; 
  x: number; 
  y: number; 
  maxScalePercent: number;
  position: string;
}> = {
  // T-shirts: Design centered on chest area, typically 10-12" wide
  'tee': { scale: 0.85, x: 0.5, y: 0.42, maxScalePercent: 80, position: 'front' },
  't-shirt': { scale: 0.85, x: 0.5, y: 0.42, maxScalePercent: 80, position: 'front' },
  'shirt': { scale: 0.85, x: 0.5, y: 0.42, maxScalePercent: 80, position: 'front' },
  
  // Hoodies: Slightly smaller print area due to fabric thickness
  'hoodie': { scale: 0.75, x: 0.5, y: 0.40, maxScalePercent: 70, position: 'front' },
  'sweatshirt': { scale: 0.75, x: 0.5, y: 0.40, maxScalePercent: 70, position: 'front' },
  
  // Mugs: Full wrap design
  'mug': { scale: 0.95, x: 0.5, y: 0.5, maxScalePercent: 90, position: 'front' },
  
  // Tote bags: Centered on front panel
  'tote': { scale: 0.80, x: 0.5, y: 0.45, maxScalePercent: 75, position: 'front' },
  'bag': { scale: 0.80, x: 0.5, y: 0.45, maxScalePercent: 75, position: 'front' },
  
  // Greeting cards: Full bleed design
  'card': { scale: 0.95, x: 0.5, y: 0.5, maxScalePercent: 95, position: 'front' },
  'greeting': { scale: 0.95, x: 0.5, y: 0.5, maxScalePercent: 95, position: 'front' },
  
  // Candles: Wrapped design
  'candle': { scale: 0.90, x: 0.5, y: 0.5, maxScalePercent: 85, position: 'front' },
  
  // Default: Standard centered placement
  'default': { scale: 0.85, x: 0.5, y: 0.45, maxScalePercent: 80, position: 'front' },
};

// Get optimal print placement based on product type
function getPlacementConfig(productTitle: string) {
  const titleLower = productTitle.toLowerCase();
  
  for (const [key, config] of Object.entries(PRINT_PLACEMENT_CONFIG)) {
    if (key !== 'default' && titleLower.includes(key)) {
      return config;
    }
  }
  
  return PRINT_PLACEMENT_CONFIG.default;
}

// Calculate optimal scale based on design and print area dimensions
function calculateOptimalScale(
  designWidth: number | undefined,
  designHeight: number | undefined,
  printAreaWidth: number,
  printAreaHeight: number,
  maxScalePercent: number
): number {
  if (!designWidth || !designHeight) {
    return maxScalePercent / 100;
  }
  
  // Calculate aspect ratios
  const designAspect = designWidth / designHeight;
  const printAreaAspect = printAreaWidth / printAreaHeight;
  
  // Scale to fit within print area while maintaining aspect ratio
  let optimalScale: number;
  if (designAspect > printAreaAspect) {
    // Design is wider - scale based on width
    optimalScale = printAreaWidth / designWidth;
  } else {
    // Design is taller - scale based on height
    optimalScale = printAreaHeight / designHeight;
  }
  
  // Apply max scale limit and ensure reasonable minimum
  const maxScale = maxScalePercent / 100;
  return Math.min(Math.max(optimalScale * 0.85, 0.5), maxScale);
}

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
      productColor,
      designWidth,
      designHeight,
    } = await req.json();

    console.log('Creating custom Printify product:', { 
      designImageUrl, 
      baseProductId, 
      variantId, 
      customTitle, 
      productColor,
      designDimensions: { width: designWidth, height: designHeight }
    });

    if (!designImageUrl || !baseProductId) {
      throw new Error('designImageUrl and baseProductId are required');
    }

    if (!variantId) {
      throw new Error('variantId is required - please select a color and size');
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
    
    // Get print area dimensions from database
    const printAreaDimensions = baseProduct.print_area_dimensions || { width: 3000, height: 3500 };
    console.log('Print area dimensions:', printAreaDimensions);

    // Get product-specific placement configuration
    const placementConfig = getPlacementConfig(baseProduct.title);
    console.log('Using placement config for product:', placementConfig);

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
    console.log('Image uploaded to Printify:', {
      id: uploadedImage.id, 
      preview_url: uploadedImage.preview_url,
      width: uploadedImage.width,
      height: uploadedImage.height
    });

    // Use uploaded image dimensions for scaling calculation
    const actualDesignWidth = designWidth || uploadedImage.width || 2000;
    const actualDesignHeight = designHeight || uploadedImage.height || 2000;

    // Calculate optimal scale based on design vs print area dimensions
    const optimalScale = calculateOptimalScale(
      actualDesignWidth,
      actualDesignHeight,
      printAreaDimensions.width || 3000,
      printAreaDimensions.height || 3500,
      placementConfig.maxScalePercent
    );

    console.log('Calculated optimal scale:', optimalScale, 'for design:', {
      width: actualDesignWidth,
      height: actualDesignHeight
    });

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

    // Step 3: Get print areas structure from original product and build optimized placement
    const originalPrintAreas = originalProduct.print_areas || [];
    
    // Build new print areas with optimized placement for realistic integration
    const newPrintAreas = originalPrintAreas.map((area: any) => {
      // Get the original placeholder positions to maintain proper print zones
      const originalPlaceholders = area.placeholders || [];
      const frontPlaceholder = originalPlaceholders.find((p: any) => p.position === 'front') || originalPlaceholders[0];
      
      return {
        variant_ids: area.variant_ids,
        placeholders: [{
          position: placementConfig.position,
          images: [{
            id: uploadedImage.id,
            // Use product-specific placement with calculated scale
            x: placementConfig.x,
            y: placementConfig.y,
            scale: optimalScale,
            angle: 0,
          }],
        }],
      };
    });

    // If no print areas found, create default one with optimized placement
    if (newPrintAreas.length === 0) {
      const variantIds = originalProduct.variants?.map((v: any) => v.id) || [];
      newPrintAreas.push({
        variant_ids: variantIds,
        placeholders: [{
          position: placementConfig.position,
          images: [{
            id: uploadedImage.id,
            x: placementConfig.x,
            y: placementConfig.y,
            scale: optimalScale,
            angle: 0,
          }],
        }],
      });
    }

    console.log('Configured print areas with optimized placement:', JSON.stringify(newPrintAreas, null, 2));

    // Step 4: Create new product in Printify with custom design
    const productTitle = customTitle || `Custom ${baseProduct.title} - ${Date.now()}`;
    
    const productData = {
      title: productTitle,
      description: `Custom design product based on ${baseProduct.title}. Design professionally integrated with product-specific placement and scaling.`,
      blueprint_id: originalProduct.blueprint_id,
      print_provider_id: originalProduct.print_provider_id,
      variants: originalProduct.variants.map((v: any) => ({
        id: v.id,
        price: v.price,
        is_enabled: variantId ? v.id === Number(variantId) : v.is_enabled,
      })),
      print_areas: newPrintAreas,
    };

    console.log('Creating custom product with optimized data:', JSON.stringify(productData, null, 2));

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

    // Step 6: Wait briefly for mockups to generate, then fetch the product
    await new Promise(resolve => setTimeout(resolve, 2000));

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
    console.log('Final product images count:', finalProduct.images?.length);

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
        placementConfig: {
          scale: optimalScale,
          x: placementConfig.x,
          y: placementConfig.y,
          position: placementConfig.position,
        },
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
