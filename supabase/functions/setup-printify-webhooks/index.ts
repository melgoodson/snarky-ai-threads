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
    const webhookUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/printify-webhook`;

    // Events to register (with fallback spelling for cancelled)
    const events = [
      'order:shipment:created',
      'order:shipment:delivered',
      'order:canceled', // we'll try 'order:cancelled' if this fails validation
    ];

    const results: Array<{ event: string; status: 'success' | 'exists' | 'failed'; webhook_id?: string; error?: string; note?: string }> = [];

    async function registerWebhook(event: string): Promise<{ status: 'success' | 'exists' | 'failed'; webhook_id?: string; error?: string }> {
      const resp = await fetch(
        `https://api.printify.com/v1/shops/${shopId}/webhooks.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${printifyApiToken}`,
            'Content-Type': 'application/json',
            'User-Agent': 'LovableApp/1.0',
          },
          body: JSON.stringify({
            topic: event,
            url: webhookUrl,
          }),
        }
      );
      const json = await resp.json();
      if (resp.ok) return { status: 'success', webhook_id: json.id };

      const reason: string = json?.errors?.reason || json?.message || 'Unknown error';
      // Treat "already exists" as success-equivalent
      if (reason?.toLowerCase().includes('already exists')) {
        return { status: 'exists', webhook_id: json?.id };
      }
      return { status: 'failed', error: reason };
    }

    // Register each webhook with fallback for cancelled spelling
    for (const event of events) {
      console.log(`Registering webhook for ${event}...`);
      let res = await registerWebhook(event);

      // If canceled failed validation, retry with British spelling
      if (event === 'order:canceled' && res.status === 'failed' && res.error?.toLowerCase().includes('validation')) {
        console.log('Retrying with alternate topic: order:cancelled');
        const retry = await registerWebhook('order:cancelled');
        if (retry.status !== 'failed') {
          results.push({ event: 'order:cancelled', status: retry.status, webhook_id: retry.webhook_id, note: 'Registered with alternate topic spelling' });
          continue;
        }
      }

      results.push({ event, ...res });
    }

    const allSuccess = results.every(r => r.status === 'success' || r.status === 'exists');

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
