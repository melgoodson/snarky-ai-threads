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
    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    // Slug-to-title mapping for hardcoded product pages
    const SLUG_TITLE_MAP: Record<string, string[]> = {
      'rbf-champion': ['RBF Champion'],
      'snarky-humans': ['Snarky Humans', 'Snarky A'],
      'free-hugs': ['Free Hugs'],
      'abduct-me': ['Abduct Me'],
      'sasquatches': ['Sasquatches'],
      'white-idol-morning': ['Good Morning', 'Idol Morning'],
      'fathers': ['Fathers', 'dad can'],
      'dark': ['Punching People', 'Snarky —'],
      'personalization-blanket': ['Personalization Blanket', 'Custom Photo Blanket'],
    };

    // Build line items with valid variant IDs and print areas
    const lineItems = [];

    for (const item of order.order_items) {
      let printifyProductId = item.printify_product_id;
      let variantId = item.variant_id;

      // ─── RESOLVE PRODUCT ID ───
      // If printify_product_id is a slug (not a Printify ID), look up the real product
      if (printifyProductId && !isPrintifyId(printifyProductId)) {
        console.log(`Item has non-Printify product_id: "${printifyProductId}", resolving...`);

        // Try to find product by matching title keywords from slug
        const searchTerms = SLUG_TITLE_MAP[printifyProductId] || [printifyProductId.replace(/-/g, ' ')];
        let foundProduct = null;

        for (const term of searchTerms) {
          const { data: products } = await supabase
            .from('products')
            .select('id, printify_id, title, variants')
            .ilike('title', `%${term}%`)
            .limit(1);

          if (products && products.length > 0) {
            foundProduct = products[0];
            break;
          }
        }

        if (foundProduct && foundProduct.printify_id) {
          console.log(`Resolved slug "${printifyProductId}" → Printify ID: ${foundProduct.printify_id} (${foundProduct.title})`);
          printifyProductId = foundProduct.printify_id;

          // Update the order item for future reference
          await supabase
            .from('order_items')
            .update({ printify_product_id: printifyProductId })
            .eq('id', item.id);

          // ─── RESOLVE VARIANT ID ───
          // If variant_id is a size string (like "M", "L", "2XL"), resolve to numeric variant ID
          if (variantId && !isNumericId(variantId) && variantId !== 'placeholder') {
            console.log(`Variant ID "${variantId}" is a size string, resolving to numeric ID...`);
            const variants = foundProduct.variants || [];

            // Try to match by size in the variant title (e.g., "White / M" contains "M")
            const sizeMatch = variants.find((v: any) => {
              if (!v.is_enabled) return false;
              const title = (v.title || '').toLowerCase();
              const size = variantId.toLowerCase();
              // Match exact size in title parts (split by / or space)
              return title.split(/[\s\/]+/).some((part: string) => part.trim() === size);
            });

            if (sizeMatch) {
              variantId = String(sizeMatch.id);
              console.log(`Resolved size "${item.variant_id}" → variant ID: ${variantId} (${sizeMatch.title})`);
            } else {
              // Fallback: first enabled variant
              const fallback = variants.find((v: any) => v.is_enabled === true);
              if (fallback) {
                variantId = String(fallback.id);
                console.log(`Size "${item.variant_id}" not found, using fallback variant: ${variantId} (${fallback.title})`);
              }
            }

            await supabase
              .from('order_items')
              .update({ variant_id: variantId })
              .eq('id', item.id);
          }
        } else {
          console.error(`Could not resolve product slug "${printifyProductId}" to a Printify product`);
          throw new Error(`Product not found in catalog for "${printifyProductId}". Please ensure this product is synced from Printify.`);
        }
      }

      // If variant_id is still missing/placeholder, try to find a default
      if (!variantId || variantId === 'placeholder' || variantId === 'undefined') {
        console.log(`Item ${item.id} has invalid variant_id: ${variantId}, looking up default variant...`);

        // Fetch the product to get its variants
        const productIdForLookup = item.product_id && UUID_RE.test(item.product_id) ? item.product_id : null;
        let variants: any[] = [];

        if (productIdForLookup) {
          const { data: product } = await supabase
            .from('products')
            .select('variants')
            .eq('id', productIdForLookup)
            .single();
          variants = product?.variants || [];
        } else if (isPrintifyId(printifyProductId)) {
          // Look up by printify_id instead
          const { data: product } = await supabase
            .from('products')
            .select('variants')
            .eq('printify_id', printifyProductId)
            .single();
          variants = product?.variants || [];
        }

        const enabledVariant = variants.find((v: any) => v.is_enabled === true);

        if (enabledVariant) {
          variantId = String(enabledVariant.id);
          console.log(`Using default enabled variant: ${variantId} (${enabledVariant.title})`);
          await supabase
            .from('order_items')
            .update({ variant_id: variantId })
            .eq('id', item.id);
        } else {
          console.error(`No enabled variants found for product`);
          throw new Error(`No enabled variants available for product. Please configure variants in Printify.`);
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
    const countryLower = countryCode?.toLowerCase();
    if (countryLower && countryCodeMap[countryLower]) {
      countryCode = countryCodeMap[countryLower];
    } else if (countryCode && countryCode.length > 2) {
      // If it's still a full country name and not in our map, log warning
      console.warn(`Unknown country name: ${countryCode}, attempting to use as-is`);
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
