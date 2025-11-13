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
    const webhookData = await req.json();
    console.log('Received Teeinblue webhook:', JSON.stringify(webhookData, null, 2));

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const eventType = webhookData.type;
    const orderData = webhookData.data;

    // Find order by Teeinblue order ID
    const { data: orders, error: findError } = await supabase
      .from('orders')
      .select('id')
      .eq('teeinblue_order_id', orderData.id)
      .limit(1);

    if (findError || !orders || orders.length === 0) {
      console.log('Order not found for Teeinblue ID:', orderData.id);
      return new Response(
        JSON.stringify({ message: 'Order not found' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const orderId = orders[0].id;

    // Handle different webhook events
    let updateData: any = {};

    switch (eventType) {
      case 'order.created':
        updateData = {
          fulfillment_status: 'processing',
          status: 'processing',
        };
        break;

      case 'order.shipped':
        updateData = {
          fulfillment_status: 'shipped',
          status: 'shipped',
        };
        break;

      case 'order.delivered':
        updateData = {
          fulfillment_status: 'delivered',
          status: 'delivered',
        };
        break;

      case 'order.cancelled':
      case 'order.canceled':
        updateData = {
          fulfillment_status: 'canceled',
          status: 'canceled',
        };
        break;

      default:
        console.log('Unhandled event type:', eventType);
        return new Response(
          JSON.stringify({ message: 'Event type not handled' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
    }

    // Update order status
    const { error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId);

    if (updateError) {
      console.error('Error updating order:', updateError);
      throw updateError;
    }

    console.log(`Order ${orderId} updated with status:`, updateData);

    return new Response(
      JSON.stringify({ success: true, message: 'Webhook processed' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
