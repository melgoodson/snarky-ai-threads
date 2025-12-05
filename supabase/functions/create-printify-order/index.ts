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

    // Build line items with valid variant IDs
    const lineItems = [];
    
    for (const item of order.order_items) {
      let variantId = item.variant_id;
      
      // If variant_id is missing or "placeholder", look up a valid enabled variant
      if (!variantId || variantId === 'placeholder' || variantId === 'undefined') {
        console.log(`Item ${item.id} has invalid variant_id: ${variantId}, looking up default variant...`);
        
        // Fetch the product to get its variants
        const { data: product, error: productError } = await supabase
          .from('products')
          .select('variants')
          .eq('id', item.product_id)
          .single();
        
        if (productError || !product) {
          console.error(`Could not find product ${item.product_id}:`, productError);
          throw new Error(`Product not found for item: ${item.product_id}`);
        }
        
        // Find the first enabled variant
        const variants = product.variants || [];
        const enabledVariant = variants.find((v: any) => v.is_enabled === true);
        
        if (!enabledVariant) {
          console.error(`No enabled variants found for product ${item.product_id}`);
          throw new Error(`No enabled variants available for product. Please configure variants in Printify.`);
        }
        
        variantId = enabledVariant.id;
        console.log(`Using default enabled variant: ${variantId} (${enabledVariant.title})`);
        
        // Update the order item with the correct variant ID for future reference
        await supabase
          .from('order_items')
          .update({ variant_id: String(variantId) })
          .eq('id', item.id);
      }
      
      lineItems.push({
        product_id: item.printify_product_id,
        variant_id: Number(variantId), // Printify expects numeric variant ID
        quantity: item.quantity,
      });
    }

    const shippingAddress = order.shipping_address;

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
        country: shippingAddress.country,
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
