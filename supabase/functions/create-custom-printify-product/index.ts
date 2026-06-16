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

  // Journals / Notebooks / Hardcover: Design must fit within the cover area
  // Use a smaller scale and center it on the front cover (right half of full wrap-around cover)
  'journal': { scale: 0.65, x: 0.75, y: 0.5, maxScalePercent: 60, position: 'front' },
  'notebook': { scale: 0.65, x: 0.75, y: 0.5, maxScalePercent: 60, position: 'front' },
  'hardcover': { scale: 0.65, x: 0.75, y: 0.5, maxScalePercent: 60, position: 'front' },

  // Candles: Wrapped design
  'candle': { scale: 0.90, x: 0.5, y: 0.5, maxScalePercent: 85, position: 'front' },

  // Default: Standard centered placement
  'default': { scale: 0.75, x: 0.5, y: 0.45, maxScalePercent: 70, position: 'front' },
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

    // Get all shops from Printify
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

    // Use first shop as default — will be overridden below if product is from a different shop
    let shopId = shops[0].id;
    console.log('Available shops:', shops.map((s: any) => `${s.id} (${s.title})`).join(', '));

    // Step 1: Upload design image to Printify
    console.log('Uploading design image to Printify...');

    // Prefer URL-based upload: Printify fetches the image directly from the URL.
    // This avoids sending a large base64 payload through the edge function,
    // which was causing error 10300 ("Failed to upload image").
    // Only fall back to base64 for data: URLs (browser-generated, no public URL).
    let uploadBody: Record<string, string>;
    const fileName = `custom-design-${Date.now()}.png`;

    if (designImageUrl.startsWith('http')) {
      console.log('Using URL-based Printify upload:', designImageUrl.substring(0, 100));
      uploadBody = {
        file_name: fileName,
        url: designImageUrl,
      };
    } else if (designImageUrl.startsWith('data:')) {
      console.log('Using base64 Printify upload (data: URL)');
      const imageData = designImageUrl.split(',')[1];
      uploadBody = {
        file_name: fileName,
        contents: imageData,
      };
    } else {
      throw new Error('Invalid design image URL format — must be http(s) or data:');
    }

    const uploadResponse = await fetch('https://api.printify.com/v1/uploads/images.json', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${printifyApiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(uploadBody),
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

    // Step 2: Determine if printify_product_id is a blueprint ID or a real shop product ID
    const printifyId = baseProduct.printify_product_id;
    const isBlueprint = /^\d{1,5}$/.test(String(printifyId)); // Blueprint IDs are short numbers like 12, 77, 425

    let blueprintId: number;
    let printProviderId: number;
    let productVariants: any[];
    let originalProduct: any = null;

    if (isBlueprint) {
      // It's a blueprint ID — look up print providers dynamically from catalog
      blueprintId = Number(printifyId);

      console.log(`Looking up print providers for blueprint: ${blueprintId}`);

      // Fetch available print providers for this blueprint
      const providersResponse = await fetch(
        `https://api.printify.com/v1/catalog/blueprints/${blueprintId}/print_providers.json`,
        {
          headers: {
            'Authorization': `Bearer ${printifyApiToken}`,
          },
        }
      );

      if (!providersResponse.ok) {
        const errText = await providersResponse.text();
        console.error('Failed to fetch print providers:', errText);
        throw new Error(`Failed to fetch print providers for blueprint ${blueprintId}: ${errText}`);
      }

      const providers = await providersResponse.json();
      if (!providers || providers.length === 0) {
        throw new Error(`No print providers available for blueprint ${blueprintId}`);
      }

      // Use the first available print provider
      printProviderId = providers[0].id;
      console.log(`Using print provider: ${printProviderId} (${providers[0].title}) for blueprint ${blueprintId}`);

      // Fetch print provider variants for this blueprint
      const variantsResponse = await fetch(
        `https://api.printify.com/v1/catalog/blueprints/${blueprintId}/print_providers/${printProviderId}/variants.json`,
        {
          headers: {
            'Authorization': `Bearer ${printifyApiToken}`,
          },
        }
      );

      if (!variantsResponse.ok) {
        const errText = await variantsResponse.text();
        console.error('Failed to fetch catalog variants:', errText);
        throw new Error(`Failed to fetch variants for blueprint ${blueprintId}: ${errText}`);
      }

      const catalogData = await variantsResponse.json();
      productVariants = catalogData.variants || [];
      console.log(`Found ${productVariants.length} variants for blueprint ${blueprintId}`);
    } else {
      // It's a real shop product ID — search across ALL shops to find which one owns it
      console.log(`Fetching shop product: ${printifyId} — searching all shops`);

      for (const shop of shops) {
        console.log(`Trying shop ${shop.id} (${shop.title})...`);
        const resp = await fetch(
          `https://api.printify.com/v1/shops/${shop.id}/products/${printifyId}.json`,
          {
            headers: {
              'Authorization': `Bearer ${printifyApiToken}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (resp.ok) {
          originalProduct = await resp.json();
          shopId = shop.id; // Use the correct shop for subsequent API calls
          console.log(`Found product in shop ${shop.id} (${shop.title})`);
          break;
        } else {
          const errText = await resp.text();
          console.log(`Product not in shop ${shop.id}: ${errText.substring(0, 100)}`);
        }
      }

      if (!originalProduct) {
        throw new Error(`Failed to fetch Printify product ${printifyId}: not found in any of the ${shops.length} configured shop(s)`);
      }

      blueprintId = originalProduct.blueprint_id;
      printProviderId = originalProduct.print_provider_id;
      productVariants = originalProduct.variants || [];
      console.log('Found shop product:', blueprintId, printProviderId, productVariants.length, 'variants');
      console.log('Original product print areas:', JSON.stringify(originalProduct.print_areas));
    }

    // Step 3: Build print areas with optimized placement
    // For blueprint-based creation, build a simple print area using the variant ID
    const targetVariantId = Number(variantId);
    const matchingVariant = productVariants.find((v: any) => v.id === targetVariantId);

    if (!matchingVariant && productVariants.length === 0) {
      throw new Error('No variants available for this product');
    }

    // Use the matching variant or default to all variants
    const variantIdsForPrint = matchingVariant
      ? [targetVariantId]
      : productVariants.map((v: any) => v.id);

    const newPrintAreas = [{
      variant_ids: variantIdsForPrint,
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
    }];

    console.log('Configured print areas with optimized placement:', JSON.stringify(newPrintAreas, null, 2));

    // Step 4: Create new product in Printify with custom design
    const productTitle = customTitle || `Custom ${baseProduct.title} - ${Date.now()}`;

    // Printify expects prices in cents. Use baseProduct price from Supabase.
    // Catalog variants don't include prices, so we must set them ourselves.
    const priceInCents = Math.round((Number(baseProduct.retail_price) || Number(baseProduct.price) || 29.99) * 100);
    console.log('Using price per variant (cents):', priceInCents);

    const productData = {
      title: productTitle,
      description: `Custom design product based on ${baseProduct.title}. Design professionally integrated with product-specific placement and scaling.`,
      blueprint_id: blueprintId,
      print_provider_id: printProviderId,
      variants: productVariants.map((v: any) => ({
        id: v.id,
        price: v.price > 0 ? v.price : priceInCents,
        is_enabled: variantId ? v.id === Number(variantId) : true,
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
