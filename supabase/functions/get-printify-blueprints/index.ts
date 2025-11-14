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

    console.log('Fetching Printify blueprints...');

    const response = await fetch('https://api.printify.com/v1/catalog/blueprints.json', {
      headers: {
        'Authorization': `Bearer ${printifyApiToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Printify API error:', errorText);
      throw new Error(`Failed to fetch blueprints: ${errorText}`);
    }

    const blueprints = await response.json();
    console.log(`Found ${blueprints.length} blueprints`);

    return new Response(
      JSON.stringify(blueprints),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in get-printify-blueprints:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
