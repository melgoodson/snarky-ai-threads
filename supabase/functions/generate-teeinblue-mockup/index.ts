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
    const { productId, designUrl, variantId } = await req.json();
    console.log('Generating mockup for product:', productId);

    const teeinblueApiKey = Deno.env.get('TEEINBLUE_API_KEY')!;
    const teeinblueStoreId = Deno.env.get('TEEINBLUE_STORE_ID')!;

    // Generate mockup using Teeinblue API
    const mockupRequest = {
      product_id: productId,
      variant_id: variantId,
      design_url: designUrl,
    };

    console.log('Requesting mockup:', mockupRequest);

    const response = await fetch(
      `https://api.teeinblue.com/v1/stores/${teeinblueStoreId}/mockups`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${teeinblueApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockupRequest),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Teeinblue mockup API error:', errorText);
      throw new Error(`Failed to generate mockup: ${errorText}`);
    }

    const mockupData = await response.json();
    console.log('Mockup generated:', mockupData);

    return new Response(
      JSON.stringify({
        success: true,
        mockup_url: mockupData.url,
        mockup_id: mockupData.id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error generating mockup:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
