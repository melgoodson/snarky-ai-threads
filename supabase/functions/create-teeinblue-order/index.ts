import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

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
    console.log('Creating Teeinblue order for:', orderId);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const teeinblueApiKey = Deno.env.get('TEEINBLUE_API_KEY')!;
    const teeinblueStoreId = Deno.env.get('TEEINBLUE_STORE_ID')!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch order details with items
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
      console.error('Order fetch error:', orderError);
      throw new Error('Order not found');
    }

    // Prepare line items for Teeinblue
    const lineItems = order.order_items.map((item: any) => ({
      product_id: item.printify_product_id,
      variant_id: item.variant_id,
      quantity: item.quantity,
    }));

    // Create order in Teeinblue
    const teeinblueOrder = {
      external_id: order.id,
      label: `Order ${order.id.substring(0, 8)}`,
      line_items: lineItems,
      shipping_method: 1,
      send_shipping_notification: false,
      address_to: {
        first_name: order.shipping_address.firstName || 'Customer',
        last_name: order.shipping_address.lastName || '',
        email: order.email,
        phone: order.shipping_address.phone || '',
        country: order.shipping_address.country,
        region: order.shipping_address.state || '',
        address1: order.shipping_address.address,
        address2: order.shipping_address.address2 || '',
        city: order.shipping_address.city,
        zip: order.shipping_address.zip,
      },
    };

    console.log('Creating Teeinblue order:', teeinblueOrder);

    const teeinblueResponse = await fetch(
      `https://api.teeinblue.com/v1/stores/${teeinblueStoreId}/orders`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${teeinblueApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(teeinblueOrder),
      }
    );

    if (!teeinblueResponse.ok) {
      const errorText = await teeinblueResponse.text();
      console.error('Teeinblue API error:', errorText);
      throw new Error(`Teeinblue API error: ${errorText}`);
    }

    const teeinblueData = await teeinblueResponse.json();
    console.log('Teeinblue order created:', teeinblueData);

    // Update order with Teeinblue order ID
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        teeinblue_order_id: teeinblueData.id,
        status: 'processing',
        fulfillment_status: 'processing',
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Order update error:', updateError);
      throw updateError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        teeinblue_order_id: teeinblueData.id,
        status: teeinblueData.status,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error creating Teeinblue order:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
