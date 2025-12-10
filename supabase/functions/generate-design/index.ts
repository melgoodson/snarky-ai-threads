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
    console.log("Generate design request received:", { prompt: prompt?.substring(0, 50), hasReference: !!referenceImage });

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
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build the message content
    const messageContent = referenceImage
      ? [
          { type: "text", text: `Create a design for print on demand products based on this description: ${prompt}. Make it vibrant, clean, and suitable for printing on apparel and accessories.` },
          {
            type: "image_url",
            image_url: { url: referenceImage },
          },
        ]
      : `Create a design for print on demand products based on this description: ${prompt}. Make it vibrant, clean, and suitable for printing on apparel and accessories. The design should have a transparent or solid background that works well on different colored products.`;

    const messages = [
      {
        role: "user",
        content: messageContent,
      },
    ];

    console.log("Calling Lovable AI Gateway...");
    const startTime = Date.now();

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

    const elapsed = Date.now() - startTime;
    console.log(`AI Gateway responded in ${elapsed}ms with status ${response.status}`);

    if (!response.ok) {
      if (response.status === 429) {
        console.error("Rate limit exceeded");
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a few moments." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        console.error("Payment required");
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to your workspace." }),
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
    const generatedImageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!generatedImageUrl) {
      console.error("No image URL in response:", JSON.stringify(data).substring(0, 200));
      throw new Error("No image URL in response");
    }

    console.log("Design generated successfully, image URL length:", generatedImageUrl.length);

    return new Response(
      JSON.stringify({ image: generatedImageUrl }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in generate-design function:", error.message || error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to generate design. Please try again." }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
