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

    const { blueprintId } = await req.json();

    if (!blueprintId) {
      throw new Error('blueprintId is required');
    }

    console.log('Fetching blueprint details for:', blueprintId);

    // Fetch blueprint details
    const blueprintResponse = await fetch(
      `https://api.printify.com/v1/catalog/blueprints/${blueprintId}.json`,
      {
        headers: {
          'Authorization': `Bearer ${printifyApiToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!blueprintResponse.ok) {
      const errorText = await blueprintResponse.text();
      console.error('Printify API error:', errorText);
      throw new Error(`Failed to fetch blueprint: ${errorText}`);
    }

    const blueprint = await blueprintResponse.json();

    // Fetch print providers for this blueprint
    const providersResponse = await fetch(
      `https://api.printify.com/v1/catalog/blueprints/${blueprintId}/print_providers.json`,
      {
        headers: {
          'Authorization': `Bearer ${printifyApiToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!providersResponse.ok) {
      console.warn('Failed to fetch print providers, continuing without them');
    }

    const providers = providersResponse.ok ? await providersResponse.json() : [];

    // Fetch variants for this blueprint
    const variantsResponse = await fetch(
      `https://api.printify.com/v1/catalog/blueprints/${blueprintId}/print_providers/${providers[0]?.id || 99}/variants.json`,
      {
        headers: {
          'Authorization': `Bearer ${printifyApiToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const variants = variantsResponse.ok ? await variantsResponse.json() : [];

    return new Response(
      JSON.stringify({
        blueprint,
        providers,
        variants: variants.variants || [],
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in get-printify-blueprint-details:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
