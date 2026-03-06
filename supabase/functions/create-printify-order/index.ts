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
    const { orderId } = await req.json();

    if (!orderId) {
      throw new Error('Order ID is required');
    }

    const printifyApiToken = Deno.env.get('PRINTIFY_API_TOKEN');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!printifyApiToken) {
      throw new Error('PRINTIFY_API_TOKEN not configured');
    }

    console.log('Creating Printify order for order:', orderId);

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      throw new Error('Order not found');
    }

    console.log('Order details:', order);

    // Get shop ID
    const shopsResponse = await fetch('https://api.printify.com/v1/shops.json', {
      headers: {
        'Authorization': `Bearer ${printifyApiToken}`,
        'Content-Type': 'application/json',
      },
    });

    const shops = await shopsResponse.json();
    const shopId = shops[0]?.id;

    if (!shopId) {
      throw new Error('No Printify shop found');
    }

    // Helper: check if a string looks like a Printify product ID (long alphanumeric)
    const isPrintifyId = (id: string) => /^[a-f0-9]{24}$/.test(id);
    const isNumericId = (id: string) => /^\d+$/.test(id);

    // Blueprint mapping for auto-creating products from hardcoded pages
    // Blueprint 6 = Gildan 5000 (Unisex Heavy Cotton Tee) — most common for t-shirts
    // Blueprint 522 = Velveteen Plush Blanket
    const PRODUCT_TYPE_BLUEPRINTS: Record<string, number> = {
      'tee': 6,
      'shirt': 6,
      't-shirt': 6,
      'blanket': 522,
      'hoodie': 77,
      'sweatshirt': 77,
      'mug': 175,
      'tote': 83,
      'default': 6, // Default to Gildan 5000 tee
    };

    // Slug-to-product-type mapping for hardcoded pages
    const SLUG_PRODUCT_TYPE: Record<string, string> = {
      'personalization-blanket': 'blanket',
      'rbf-champion': 'shirt',
      'snarky-humans': 'shirt',
      'free-hugs': 'shirt',
      'abduct-me': 'shirt',
      'sasquatches': 'shirt',
      'white-idol-morning': 'shirt',
      'fathers': 'shirt',
      'dark': 'shirt',
    };

    // Helper: upload an image to Printify and return the uploaded image object
    async function uploadImageToPrintify(imageUrl: string, token: string): Promise<any> {
      console.log('Uploading design image to Printify from:', imageUrl.substring(0, 100));

      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error(`Failed to fetch design image (${imageResponse.status}): ${imageUrl.substring(0, 100)}`);
      }

      const imageBuffer = await imageResponse.arrayBuffer();
      const bytes = new Uint8Array(imageBuffer);
      let binary = '';
      const chunkSize = 8192;
      for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.subarray(i, i + chunkSize);
        binary += String.fromCharCode(...chunk);
      }
      const imageData = btoa(binary);

      const uploadResponse = await fetch('https://api.printify.com/v1/uploads/images.json', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file_name: `design-${Date.now()}.png`,
          contents: imageData,
        }),
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(`Failed to upload image to Printify: ${errorText}`);
      }

      return await uploadResponse.json();
    }

    // Helper: auto-create a product in Printify from a design image
    async function autoCreateProduct(
      designImageUrl: string,
      productTitle: string,
      productType: string,
      token: string,
      sid: string,
      sizeHint?: string,
    ): Promise<{ printifyProductId: string; variants: any[] }> {
      console.log(`Auto-creating Printify product: "${productTitle}" (type: ${productType}, size: ${sizeHint || 'any'})`);

      // 1. Upload the design image
      const uploadedImage = await uploadImageToPrintify(designImageUrl, token);
      console.log('Image uploaded:', uploadedImage.id);

      // 2. Determine blueprint
      const typeLower = productType.toLowerCase();
      let blueprintId = PRODUCT_TYPE_BLUEPRINTS['default'];
      for (const [key, bid] of Object.entries(PRODUCT_TYPE_BLUEPRINTS)) {
        if (key !== 'default' && typeLower.includes(key)) {
          blueprintId = bid;
          break;
        }
      }
      console.log(`Using blueprint: ${blueprintId} for product type: "${productType}"`);

      // 3. Get print providers for this blueprint
      const providersRes = await fetch(
        `https://api.printify.com/v1/catalog/blueprints/${blueprintId}/print_providers.json`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (!providersRes.ok) throw new Error(`Failed to fetch print providers for blueprint ${blueprintId}`);
      const providers = await providersRes.json();
      if (!providers?.length) throw new Error(`No print providers for blueprint ${blueprintId}`);
      const printProviderId = providers[0].id;
      console.log(`Using print provider: ${printProviderId}`);

      // 4. Get variants for this blueprint + provider
      const variantsRes = await fetch(
        `https://api.printify.com/v1/catalog/blueprints/${blueprintId}/print_providers/${printProviderId}/variants.json`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (!variantsRes.ok) throw new Error(`Failed to fetch variants for blueprint ${blueprintId}`);
      const catalogData = await variantsRes.json();
      let catalogVariants: any[] = catalogData.variants || [];
      console.log(`Found ${catalogVariants.length} total catalog variants`);

      // 5. Filter variants to stay under Printify's 100 limit
      // If we have a size hint, only include variants matching that size
      let enabledVariants = catalogVariants;
      if (sizeHint && catalogVariants.length > 100) {
        const sizeLower = sizeHint.toLowerCase().trim();
        const sizeFiltered = catalogVariants.filter((v: any) => {
          const title = (v.title || '').toLowerCase();
          return title.split(/[\s\/]+/).some((part: string) => part.trim() === sizeLower);
        });
        if (sizeFiltered.length > 0) {
          enabledVariants = sizeFiltered;
          console.log(`Filtered to ${enabledVariants.length} variants matching size "${sizeHint}"`);
        }
      }
      // Final cap at 100 variants
      if (enabledVariants.length > 100) {
        enabledVariants = enabledVariants.slice(0, 100);
        console.log(`Capped to 100 variants`);
      }

      // 6. Create the product in Printify — only include filtered variants
      const priceInCents = 2999; // Default $29.99
      console.log(`Creating product with ${enabledVariants.length} variants (filtered from ${catalogVariants.length})`);
      const productData = {
        title: productTitle,
        description: `Snarky A$$ Humans - ${productTitle}`,
        blueprint_id: blueprintId,
        print_provider_id: printProviderId,
        variants: enabledVariants.map((v: any) => ({
          id: v.id,
          price: priceInCents,
          is_enabled: true,
        })),
        print_areas: [{
          variant_ids: enabledVariants.map((v: any) => v.id),
          placeholders: [{
            position: 'front',
            images: [{
              id: uploadedImage.id,
              x: 0.5,
              y: 0.5,
              scale: 1,
              angle: 0,
            }],
          }],
        }],
      };

      const createRes = await fetch(
        `https://api.printify.com/v1/shops/${sid}/products.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(productData),
        }
      );

      if (!createRes.ok) {
        const errorText = await createRes.text();
        throw new Error(`Failed to create Printify product: ${errorText}`);
      }

      const createdProduct = await createRes.json();
      console.log(`Auto-created Printify product: ${createdProduct.id}`);

      return {
        printifyProductId: createdProduct.id,
        variants: catalogVariants,
      };
    }

    // Build line items with valid variant IDs and print areas
    const lineItems = [];

    for (const item of order.order_items) {
      let printifyProductId = item.printify_product_id;
      let variantId = item.variant_id;
      let catalogVariants: any[] | null = null;

      // ─── RESOLVE PRODUCT ID ───
      // If printify_product_id is NOT a real Printify ID, auto-create the product
      if (printifyProductId && !isPrintifyId(printifyProductId)) {
        console.log(`Item has non-Printify product_id: "${printifyProductId}", auto-creating product...`);

        // Get the design image URL — must be an absolute http URL
        let designUrl = item.design_image_url;
        if (!designUrl || !designUrl.startsWith('http')) {
          console.error(`No valid design image URL for slug product "${printifyProductId}": "${designUrl}"`);
          throw new Error(`Cannot auto-create product: no design image URL available for "${printifyProductId}". The image URL must be an absolute HTTPS URL.`);
        }

        // Determine product type from slug mapping or title
        const productType = SLUG_PRODUCT_TYPE[printifyProductId] || item.title || printifyProductId;

        // Auto-create the product in Printify, passing size hint for variant filtering
        const result = await autoCreateProduct(
          designUrl,
          item.title || printifyProductId.replace(/-/g, ' '),
          productType,
          printifyApiToken!,
          String(shopId),
          variantId && !isNumericId(variantId) ? variantId : undefined,
        );

        printifyProductId = result.printifyProductId;
        catalogVariants = result.variants;

        // Update the order item with the real Printify product ID
        await supabase
          .from('order_items')
          .update({ printify_product_id: printifyProductId })
          .eq('id', item.id);
      }

      // ─── RESOLVE VARIANT ID ───
      // If variant_id is a size string (like "M", "L", "2XL") or placeholder, resolve it
      if (variantId && !isNumericId(variantId) && variantId !== 'placeholder' && variantId !== 'undefined') {
        console.log(`Variant ID "${variantId}" is a size string, resolving to numeric ID...`);

        // Get variants from catalog (already fetched during auto-create, or fetch now)
        if (!catalogVariants && isPrintifyId(printifyProductId)) {
          // Fetch the product from Printify to get its variants
          const productRes = await fetch(
            `https://api.printify.com/v1/shops/${shopId}/products/${printifyProductId}.json`,
            { headers: { 'Authorization': `Bearer ${printifyApiToken}` } }
          );
          if (productRes.ok) {
            const product = await productRes.json();
            catalogVariants = product.variants || [];
          }
        }

        if (catalogVariants && catalogVariants.length > 0) {
          // Match size string against variant titles
          const sizeLower = variantId.toLowerCase().trim();
          const sizeMatch = catalogVariants.find((v: any) => {
            const title = (v.title || '').toLowerCase();
            return title.split(/[\s\/]+/).some((part: string) => part.trim() === sizeLower);
          });

          if (sizeMatch) {
            variantId = String(sizeMatch.id);
            console.log(`Resolved size "${item.variant_id}" → variant ID: ${variantId} (${sizeMatch.title})`);
          } else {
            // Fallback: first variant
            variantId = String(catalogVariants[0].id);
            console.log(`Size "${item.variant_id}" not found, using first variant: ${variantId}`);
          }
        }

        await supabase
          .from('order_items')
          .update({ variant_id: variantId })
          .eq('id', item.id);
      }

      // If variant_id is still missing/placeholder, use first available variant
      if (!variantId || variantId === 'placeholder' || variantId === 'undefined' || !isNumericId(variantId)) {
        console.log(`Item ${item.id} still has invalid variant_id: ${variantId}, finding default...`);

        if (!catalogVariants && isPrintifyId(printifyProductId)) {
          const productRes = await fetch(
            `https://api.printify.com/v1/shops/${shopId}/products/${printifyProductId}.json`,
            { headers: { 'Authorization': `Bearer ${printifyApiToken}` } }
          );
          if (productRes.ok) {
            const product = await productRes.json();
            catalogVariants = product.variants || [];
          }
        }

        if (catalogVariants && catalogVariants.length > 0) {
          const enabledVariant = catalogVariants.find((v: any) => v.is_enabled === true) || catalogVariants[0];
          variantId = String(enabledVariant.id);
          console.log(`Using default variant: ${variantId} (${enabledVariant.title})`);
          await supabase
            .from('order_items')
            .update({ variant_id: variantId })
            .eq('id', item.id);
        } else {
          throw new Error(`No variants available for product ${printifyProductId}`);
        }
      }

      // Build line item with print_areas if design image is available
      const lineItem: any = {
        product_id: printifyProductId,
        variant_id: Number(variantId),
        quantity: item.quantity,
      };

      // Add print_areas with the design image URL for custom prints
      // Skip invalid values like "[object Object]" or empty strings
      let designUrl = item.design_image_url;
      if (designUrl && typeof designUrl === 'string' &&
        !designUrl.includes('[object') &&
        designUrl.startsWith('http')) {
        console.log(`Adding print_areas with design image: ${designUrl}`);
        lineItem.print_areas = {
          front: designUrl,
        };
      } else {
        console.log(`Invalid or missing design_image_url for item ${item.id}: "${designUrl}", order will use product's default print`);
      }

      lineItems.push(lineItem);
    }

    const shippingAddress = order.shipping_address;

    // Country name to ISO code mapping
    const countryCodeMap: Record<string, string> = {
      'philippines': 'PH',
      'united states': 'US',
      'usa': 'US',
      'united kingdom': 'GB',
      'uk': 'GB',
      'canada': 'CA',
      'australia': 'AU',
      'germany': 'DE',
      'france': 'FR',
      'japan': 'JP',
      'china': 'CN',
      'india': 'IN',
      'brazil': 'BR',
      'mexico': 'MX',
      'spain': 'ES',
      'italy': 'IT',
      'netherlands': 'NL',
      'singapore': 'SG',
      'south korea': 'KR',
      'new zealand': 'NZ',
    };

    // Convert country name to ISO code if needed
    let countryCode = shippingAddress.country;
    const countryLower = countryCode?.toLowerCase()?.trim();
    if (countryLower && countryCodeMap[countryLower]) {
      countryCode = countryCodeMap[countryLower];
    } else if (countryCode && countryCode.length > 2) {
      // Try to extract a 2-letter ISO code from the start (e.g., "USUnited States" → "US")
      const isoMatch = countryCode.match(/^([A-Z]{2})/);
      if (isoMatch) {
        countryCode = isoMatch[1];
        console.log(`Extracted country code "${countryCode}" from "${shippingAddress.country}"`);
      } else {
        // Try the full string in the lookup map
        const fullLower = countryCode.toLowerCase().replace(/^[a-z]{2}/, '').trim();
        if (countryCodeMap[fullLower]) {
          countryCode = countryCodeMap[fullLower];
        } else {
          console.warn(`Unknown country: ${countryCode}, defaulting to US`);
          countryCode = 'US';
        }
      }
    }

    // Create order in Printify
    const printifyOrderData = {
      external_id: orderId,
      label: `Order ${orderId}`,
      line_items: lineItems,
      shipping_method: 1, // Standard shipping
      send_shipping_notification: true,
      address_to: {
        first_name: shippingAddress.firstName,
        last_name: shippingAddress.lastName,
        email: order.email,
        phone: shippingAddress.phone,
        country: countryCode,
        region: shippingAddress.state,
        address1: shippingAddress.address1,
        address2: shippingAddress.address2 || '',
        city: shippingAddress.city,
        zip: shippingAddress.zip,
      },
    };

    console.log('Creating Printify order with data:', printifyOrderData);

    const createOrderResponse = await fetch(
      `https://api.printify.com/v1/shops/${shopId}/orders.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${printifyApiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(printifyOrderData),
      }
    );

    if (!createOrderResponse.ok) {
      const errorText = await createOrderResponse.text();
      console.error('Printify order creation failed:', errorText);
      throw new Error(`Failed to create Printify order: ${errorText}`);
    }

    const printifyOrder = await createOrderResponse.json();
    console.log('Printify order created:', printifyOrder);

    // Store Printify order mapping
    const { error: mappingError } = await supabase
      .from('printify_orders')
      .insert({
        order_id: orderId,
        printify_order_id: printifyOrder.id,
        printify_status: printifyOrder.status,
      });

    if (mappingError) {
      console.error('Error storing Printify order mapping:', mappingError);
    }

    // Update order status
    await supabase
      .from('orders')
      .update({ status: 'processing' })
      .eq('id', orderId);

    return new Response(
      JSON.stringify({
        success: true,
        printifyOrderId: printifyOrder.id,
        status: printifyOrder.status,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in create-printify-order:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
