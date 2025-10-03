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

    // Format line items for Printify
    const lineItems = order.order_items.map((item: any) => ({
      product_id: item.printify_product_id,
      variant_id: item.variant_id,
      quantity: item.quantity,
    }));

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
