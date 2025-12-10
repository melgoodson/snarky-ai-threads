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

    console.log("Generate design request received:", {
      prompt: prompt.slice(0, 50),
      hasReference: !!referenceImage,
    });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Enhanced prompt for better design generation
    const enhancedPrompt = `Create a high-quality design artwork for print-on-demand products. ${prompt}. The design should be suitable for printing on apparel and merchandise, with clear details and vibrant colors.`;

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

    console.log("Calling Lovable AI Gateway...");

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

    console.log("AI Gateway responded in", response.status);

    if (!response.ok) {
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
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    
    // Log the full response structure for debugging
    console.log("AI Response structure:", JSON.stringify({
      hasChoices: !!data.choices,
      choicesLength: data.choices?.length,
      hasMessage: !!data.choices?.[0]?.message,
      hasImages: !!data.choices?.[0]?.message?.images,
      imagesLength: data.choices?.[0]?.message?.images?.length,
      finishReason: data.choices?.[0]?.finish_reason,
    }));

    const generatedImageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!generatedImageUrl) {
      // Log what we received to debug
      console.error("No image URL in response. Full response:", JSON.stringify(data).slice(0, 500));
      
      // Check if there's a content issue
      const finishReason = data.choices?.[0]?.finish_reason;
      if (finishReason === "stop" || finishReason === "content_filter") {
        throw new Error("The AI could not generate this image. Please try a different prompt.");
      }
      
      throw new Error("No image was generated. Please try again with a different prompt.");
    }

    console.log("Design generated successfully, image URL length:", generatedImageUrl.length);

    return new Response(
      JSON.stringify({ image: generatedImageUrl }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in generate-design function:", error.message);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to generate design" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
