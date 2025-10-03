import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const printifyToken = Deno.env.get('PRINTIFY_API_TOKEN');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!printifyToken) {
      throw new Error('PRINTIFY_API_TOKEN not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { orderId, shopId } = await req.json();

    console.log('Creating Printify order for:', orderId);

    // Fetch order details from database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (*)
        )
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      throw new Error('Order not found');
    }

    // Build Printify order payload
    const printifyOrderPayload = {
      external_id: order.id,
      label: order.email,
      line_items: order.order_items.map((item: any) => ({
        product_id: item.printify_product_id,
        variant_id: parseInt(item.variant_id),
        quantity: item.quantity,
      })),
      shipping_method: 1, // Standard shipping
      send_shipping_notification: true,
      address_to: {
        first_name: order.shipping_address.firstName,
        last_name: order.shipping_address.lastName,
        email: order.email,
        phone: order.shipping_address.phone || '',
        country: order.shipping_address.country,
        region: order.shipping_address.state || '',
        address1: order.shipping_address.address1,
        address2: order.shipping_address.address2 || '',
        city: order.shipping_address.city,
        zip: order.shipping_address.zip,
      },
    };

    console.log('Sending order to Printify:', printifyOrderPayload);

    // Create order in Printify
    const response = await fetch(
      `https://api.printify.com/v1/shops/${shopId}/orders.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${printifyToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(printifyOrderPayload),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Printify API error:', error);
      throw new Error(`Printify API error: ${response.status}`);
    }

    const printifyOrder = await response.json();
    console.log('Printify order created:', printifyOrder.id);

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
