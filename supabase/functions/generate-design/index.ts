import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, referenceImage } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Prompt is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Enhanced prompt for better print-on-demand designs
    const enhancedPrompt = `Create a high-quality, print-ready design for print-on-demand products. ${prompt}. The design should be clear, vibrant, and suitable for printing on apparel and merchandise. Use a transparent or solid background. Make the design eye-catching and professional.`;

    const messages: any[] = [
      {
        role: "user",
        content: referenceImage
          ? [
              { type: "text", text: enhancedPrompt },
              {
                type: "image_url",
                image_url: { url: referenceImage },
              },
            ]
          : enhancedPrompt,
      },
    ];

    console.log("Sending request to AI Gateway with prompt:", enhancedPrompt);

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image-preview",
          messages,
          modalities: ["image", "text"],
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error status:", response.status);
      console.error("AI Gateway error body:", errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      throw new Error(`AI Gateway error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("AI Gateway response structure:", JSON.stringify(data, null, 2).substring(0, 1000));

    // Try multiple possible response structures
    let generatedImageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    // Alternative structure: directly on the message
    if (!generatedImageUrl) {
      generatedImageUrl = data.choices?.[0]?.message?.content?.find?.((c: any) => c.type === 'image_url')?.image_url?.url;
    }
    
    // Another alternative: image_url directly in images array
    if (!generatedImageUrl && data.choices?.[0]?.message?.images?.[0]) {
      const img = data.choices[0].message.images[0];
      generatedImageUrl = img.url || img.image_url?.url || img;
    }

    if (!generatedImageUrl) {
      console.error("Full API response:", JSON.stringify(data));
      throw new Error("No image URL in response. API may have returned text only or the model failed to generate an image.");
    }

    console.log("Successfully generated image");

    return new Response(
      JSON.stringify({ image: generatedImageUrl }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in generate-design function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to generate design" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
