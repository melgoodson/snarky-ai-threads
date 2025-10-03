import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    
    if (!printifyApiToken) {
      throw new Error('PRINTIFY_API_TOKEN not configured');
    }

    console.log('Fetching shop ID from Printify...');

    // Get shop ID
    const shopsResponse = await fetch('https://api.printify.com/v1/shops.json', {
      headers: {
        'Authorization': `Bearer ${printifyApiToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!shopsResponse.ok) {
      throw new Error(`Failed to fetch shops: ${shopsResponse.statusText}`);
    }

    const shops = await shopsResponse.json();
    
    if (!shops || shops.length === 0) {
      throw new Error('No Printify shops found. Please connect a store via API first.');
    }

    const shopId = shops[0].id;
    console.log('Using shop ID:', shopId);

    // Webhook URL
    const webhookUrl = `https://waldggnsstpxasmauwda.supabase.co/functions/v1/printify-webhook`;

    // Events to register
    const events = [
      'order:shipment:created',
      'order:shipment:delivered',
      'order:canceled'
    ];

    const results = [];

    // Register each webhook
    for (const event of events) {
      console.log(`Registering webhook for ${event}...`);
      
      const webhookResponse = await fetch(
        `https://api.printify.com/v1/shops/${shopId}/webhooks.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${printifyApiToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            topic: event,
            url: webhookUrl,
          }),
        }
      );

      const result = await webhookResponse.json();
      
      if (webhookResponse.ok) {
        console.log(`Successfully registered ${event}`);
        results.push({
          event,
          status: 'success',
          webhook_id: result.id,
        });
      } else {
        console.error(`Failed to register ${event}:`, result);
        results.push({
          event,
          status: 'failed',
          error: result.message || 'Unknown error',
        });
      }
    }

    const allSuccess = results.every(r => r.status === 'success');

    return new Response(
      JSON.stringify({
        success: allSuccess,
        shop_id: shopId,
        webhook_url: webhookUrl,
        results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: allSuccess ? 200 : 207, // 207 = Multi-Status
      }
    );
  } catch (error) {
    console.error('Error in setup-printify-webhooks:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
