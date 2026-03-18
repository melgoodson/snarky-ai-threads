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
    const webhookData = await req.json();
    console.log('Received Printify webhook:', webhookData);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { type, resource } = webhookData;

    if (type === 'order:shipment:created') {
      // Order has been shipped
      const printifyOrderId = resource.id;
      const trackingNumber = resource.shipments?.[0]?.tracking_number;
      const trackingUrl = resource.shipments?.[0]?.tracking_url;

      console.log('Order shipped:', {
        printifyOrderId,
        trackingNumber,
        trackingUrl,
      });

      // Update printify_orders table
      const { data: printifyOrder } = await supabase
        .from('printify_orders')
        .select('order_id')
        .eq('printify_order_id', printifyOrderId)
        .single();

      if (printifyOrder) {
        await supabase
          .from('printify_orders')
          .update({
            printify_status: 'shipped',
            tracking_number: trackingNumber,
            tracking_url: trackingUrl,
          })
          .eq('printify_order_id', printifyOrderId);

        // Update orders table
        await supabase
          .from('orders')
          .update({ status: 'shipped' })
          .eq('id', printifyOrder.order_id);

        console.log('Order status updated to shipped');

        // Send shipping notification email
        try {
          const { data: order } = await supabase
            .from('orders')
            .select('email, id')
            .eq('id', printifyOrder.order_id)
            .single();

          if (order?.email) {
            await supabase.functions.invoke('send-shipping-notification', {
              body: {
                email: order.email,
                orderId: order.id,
                trackingNumber,
                trackingUrl,
              },
            });
            console.log('Shipping notification email sent to', order.email);
          }
        } catch (emailError) {
          console.error('Failed to send shipping notification email:', emailError);
        }
      }
    } else if (type === 'order:shipment:delivered') {
      // Order has been delivered
      const printifyOrderId = resource.id;

      console.log('Order delivered:', printifyOrderId);

      const { data: printifyOrder } = await supabase
        .from('printify_orders')
        .select('order_id')
        .eq('printify_order_id', printifyOrderId)
        .single();

      if (printifyOrder) {
        await supabase
          .from('printify_orders')
          .update({ printify_status: 'delivered' })
          .eq('printify_order_id', printifyOrderId);

        await supabase
          .from('orders')
          .update({ status: 'delivered' })
          .eq('id', printifyOrder.order_id);

        console.log('Order status updated to delivered');

        // Send delivery notification email
        try {
          const { data: order } = await supabase
            .from('orders')
            .select('email, id')
            .eq('id', printifyOrder.order_id)
            .single();

          if (order?.email) {
            await supabase.functions.invoke('send-delivery-notification', {
              body: {
                email: order.email,
                orderId: order.id,
              },
            });
            console.log('Delivery notification email sent to', order.email);
          }
        } catch (emailError) {
          console.error('Failed to send delivery notification email:', emailError);
        }
      }
    } else if (type === 'order:canceled' || type === 'order:cancelled') {
      // Order was canceled
      const printifyOrderId = resource.id;

      console.log('Order canceled:', printifyOrderId);

      const { data: printifyOrder } = await supabase
        .from('printify_orders')
        .select('order_id')
        .eq('printify_order_id', printifyOrderId)
        .single();

      if (printifyOrder) {
        await supabase
          .from('printify_orders')
          .update({ printify_status: 'canceled' })
          .eq('printify_order_id', printifyOrderId);

        await supabase
          .from('orders')
          .update({ status: 'canceled' })
          .eq('id', printifyOrder.order_id);

        console.log('Order status updated to canceled');
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in printify-webhook:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
