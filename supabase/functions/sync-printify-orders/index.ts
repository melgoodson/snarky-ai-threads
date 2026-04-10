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
    const printifyApiToken = Deno.env.get('PRINTIFY_API_TOKEN');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!printifyApiToken) {
      throw new Error('PRINTIFY_API_TOKEN not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get shop ID
    const shopsResponse = await fetch('https://api.printify.com/v1/shops.json', {
      headers: {
        'Authorization': `Bearer ${printifyApiToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!shopsResponse.ok) {
      throw new Error('Failed to fetch Printify shops');
    }

    const shops = await shopsResponse.json();
    const shopId = shops[0]?.id;

    if (!shopId) {
      throw new Error('No Printify shop found');
    }

    // Fetch orders that are not yet delivered
    const { data: activeOrders, error: fetchError } = await supabase
      .from('printify_orders')
      .select('*')
      .neq('printify_status', 'delivered')
      .neq('printify_status', 'canceled');

    if (fetchError) {
      throw new Error(`Failed to fetch active orders: ${fetchError.message}`);
    }

    console.log(`Found ${activeOrders?.length || 0} active Printify orders to sync.`);
    
    const results = [];

    for (const pOrder of activeOrders || []) {
      try {
        console.log(`Syncing Printify order: ${pOrder.printify_order_id}`);
        // Fetch specific order details from Printify
        const orderRes = await fetch(
          `https://api.printify.com/v1/shops/${shopId}/orders/${pOrder.printify_order_id}.json`,
          {
            headers: {
              'Authorization': `Bearer ${printifyApiToken}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!orderRes.ok) {
          console.error(`Failed to fetch order ${pOrder.printify_order_id} from Printify. Status: ${orderRes.status}`);
          continue;
        }

        const printifyData = await orderRes.json();
        const currentStatus = printifyData.status;

        // Extract tracking if shipped
        let trackingNumber = null;
        let trackingUrl = null;
        if (currentStatus === 'shipped' || currentStatus === 'delivered') {
          // Printify shipments array holds tracking info
          const shipment = printifyData.shipments?.[0];
          trackingNumber = shipment?.tracking_number;
          trackingUrl = shipment?.tracking_url;

          // Note: "delivered" status from Printify is rarely emitted as natively "delivered" 
          // on the order object itself because the order sits at "shipped", 
          // but sometimes API provides it. If webhook missed it, we sync tracking anyway.
        }

        // Did it change?
        if (pOrder.printify_status !== currentStatus || trackingNumber) {
          console.log(`Order ${pOrder.order_id} status changed: ${pOrder.printify_status} -> ${currentStatus}`);
          
          await supabase
            .from('printify_orders')
            .update({
              printify_status: currentStatus,
              tracking_number: trackingNumber || pOrder.tracking_number,
              tracking_url: trackingUrl || pOrder.tracking_url,
              updated_at: new Date().toISOString()
            })
            .eq('id', pOrder.id);

          // Update main orders table as well to keep dashboard fully synced
          let mappedFulfillment = currentStatus;
          if (currentStatus === 'on-hold') mappedFulfillment = 'pending';
          
          await supabase
            .from('orders')
            .update({ 
               status: currentStatus === 'on-hold' ? 'processing' : currentStatus, 
               fulfillment_status: mappedFulfillment 
            })
            .eq('id', pOrder.order_id);
            
          results.push({ order: pOrder.order_id, synced: true, new_status: currentStatus });
        } else {
          results.push({ order: pOrder.order_id, synced: false, status: currentStatus });
        }

      } catch (err) {
        console.error(`Error processing order ${pOrder.printify_order_id}:`, err);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Synced ${activeOrders?.length} orders.`,
        results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in sync-printify-orders:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
