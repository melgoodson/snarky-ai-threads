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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const webhookData = await req.json();
    
    console.log('Received Printify webhook:', webhookData.type);

    // Handle different webhook types
    switch (webhookData.type) {
      case 'order:shipment:created':
      case 'order:shipment:delivered':
      case 'order:sent-to-production':
        await handleOrderUpdate(supabase, webhookData);
        break;
      
      default:
        console.log('Unhandled webhook type:', webhookData.type);
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

async function handleOrderUpdate(supabase: any, webhookData: any) {
  const printifyOrderId = webhookData.resource.id;
  const status = webhookData.resource.status;
  
  console.log(`Updating order ${printifyOrderId} to status: ${status}`);

  // Find our order mapping
  const { data: mapping, error: mappingError } = await supabase
    .from('printify_orders')
    .select('order_id')
    .eq('printify_order_id', printifyOrderId)
    .single();

  if (mappingError || !mapping) {
    console.error('Order mapping not found:', printifyOrderId);
    return;
  }

  // Update Printify order record
  const updateData: any = {
    printify_status: status,
  };

  // Add tracking info if available
  if (webhookData.resource.shipments && webhookData.resource.shipments.length > 0) {
    const shipment = webhookData.resource.shipments[0];
    updateData.tracking_number = shipment.tracking_number;
    updateData.tracking_url = shipment.tracking_url;
  }

  await supabase
    .from('printify_orders')
    .update(updateData)
    .eq('printify_order_id', printifyOrderId);

  // Update order status based on Printify status
  let orderStatus = 'processing';
  if (status === 'shipped') orderStatus = 'shipped';
  if (status === 'delivered') orderStatus = 'delivered';
  if (status === 'canceled') orderStatus = 'cancelled';

  await supabase
    .from('orders')
    .update({ status: orderStatus })
    .eq('id', mapping.order_id);

  console.log(`Order ${mapping.order_id} updated to ${orderStatus}`);
}
