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
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!printifyApiToken) {
      throw new Error('PRINTIFY_API_TOKEN not configured');
    }

    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Generating placeholder image with Lovable AI...');

    // Generate a simple transparent square placeholder using Lovable AI
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: 'Generate a completely transparent 1000x1000 pixel PNG image with no content. This is a blank placeholder for print-on-demand products.',
          },
        ],
        modalities: ['image', 'text'],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Lovable AI error:', errorText);
      throw new Error(`Failed to generate placeholder image: ${errorText}`);
    }

    const aiData = await aiResponse.json();
    console.log('Lovable AI raw response:', JSON.stringify(aiData));

    // Try multiple possible locations for the image URL based on gateway format
    let imageUrl: string | undefined;
    const choice = aiData.choices?.[0];

    if (choice?.message?.images?.[0]?.image_url?.url) {
      imageUrl = choice.message.images[0].image_url.url;
    } else if (choice?.message?.content?.[0]?.image_url?.url) {
      imageUrl = choice.message.content[0].image_url.url;
    } else if (choice?.message?.content?.[0]?.type === 'image_url') {
      imageUrl = choice.message.content[0].image_url?.url;
    }

    if (!imageUrl) {
      throw new Error('No image generated from Lovable AI');
    }

    console.log('Placeholder image generated successfully');

    // Extract base64 data (remove data:image/png;base64, prefix if present)
    const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, '');

    console.log('Uploading placeholder to Printify...');

    // Upload to Printify using JSON body (contents should be base64 string)
    const uploadResponse = await fetch('https://api.printify.com/v1/uploads/images.json', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${printifyApiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file_name: 'placeholder.png',
        contents: base64Data,
      }),
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('Printify upload error:', errorText);
      throw new Error(`Failed to upload to Printify: ${errorText}`);
    }

    const uploadData = await uploadResponse.json();
    console.log('Placeholder uploaded to Printify:', uploadData);

    return new Response(
      JSON.stringify({
        success: true,
        imageId: uploadData.id,
        fileName: uploadData.file_name,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in create-printify-placeholder:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
