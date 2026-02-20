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
    const googleApiKey = Deno.env.get('GOOGLE_AI_API_KEY');

    if (!printifyApiToken) {
      throw new Error('PRINTIFY_API_TOKEN not configured');
    }

    if (!googleApiKey) {
      throw new Error('GOOGLE_AI_API_KEY not configured');
    }

    console.log('Generating placeholder image with Gemini API...');

    const model = "gemini-2.0-flash-exp";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${googleApiKey}`;

    const aiResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: 'Generate a completely transparent 1000x1000 pixel PNG image with no content. This is a blank placeholder for print-on-demand products.',
          }],
        }],
        generationConfig: {
          responseModalities: ["TEXT", "IMAGE"],
        },
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Failed to generate placeholder image: ${errorText}`);
    }

    const aiData = await aiResponse.json();
    console.log('Gemini API response received');

    // Extract image from Gemini native response
    let imageBase64: string | undefined;
    const candidateParts = aiData.candidates?.[0]?.content?.parts;

    if (Array.isArray(candidateParts)) {
      for (const part of candidateParts) {
        if (part.inlineData?.data) {
          imageBase64 = part.inlineData.data;
          break;
        }
      }
    }

    if (!imageBase64) {
      throw new Error('No image generated from Gemini API');
    }

    console.log('Placeholder image generated successfully');
    console.log('Uploading placeholder to Printify...');

    // Upload to Printify
    const uploadResponse = await fetch('https://api.printify.com/v1/uploads/images.json', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${printifyApiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file_name: 'placeholder.png',
        contents: imageBase64,
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
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in create-printify-placeholder:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
