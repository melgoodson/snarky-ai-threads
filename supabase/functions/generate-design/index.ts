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
    console.log("AI Gateway response structure:", JSON.stringify(data, null, 2).substring(0, 2000));

    let generatedImageUrl: string | null = null;
    const message = data.choices?.[0]?.message;

    if (message) {
      console.log("Message keys:", Object.keys(message));
      const content = message.content;

      // Format 1: content is an array of parts (OpenAI multimodal format)
      if (Array.isArray(content)) {
        for (const part of content) {
          console.log("Content part type:", part.type);
          // 1a: image_url part with url (could be data:image/... base64 or https URL)
          if (part.type === "image_url" && part.image_url?.url) {
            generatedImageUrl = part.image_url.url;
            break;
          }
          // 1b: Gemini-style inline_data (base64)
          if (part.type === "inline_data" || part.inline_data) {
            const inline = part.inline_data || part;
            if (inline.data && inline.mime_type) {
              generatedImageUrl = `data:${inline.mime_type};base64,${inline.data}`;
              break;
            }
          }
          // 1c: image part with url directly
          if (part.type === "image" && part.url) {
            generatedImageUrl = part.url;
            break;
          }
        }
      }

      // Format 2: images array on the message object
      if (!generatedImageUrl && Array.isArray(message.images) && message.images.length > 0) {
        const img = message.images[0];
        generatedImageUrl = img.image_url?.url || img.url || (typeof img === "string" ? img : null);
        // Check for base64 data in the image object
        if (!generatedImageUrl && img.b64_json) {
          generatedImageUrl = `data:image/png;base64,${img.b64_json}`;
        }
      }

      // Format 3: image_url directly on the message
      if (!generatedImageUrl && message.image_url?.url) {
        generatedImageUrl = message.image_url.url;
      }
    }

    // Format 4: data.images array (some APIs return at top level)
    if (!generatedImageUrl && Array.isArray(data.images) && data.images.length > 0) {
      const img = data.images[0];
      generatedImageUrl = img.url || img.image_url?.url || (typeof img === "string" ? img : null);
      if (!generatedImageUrl && img.b64_json) {
        generatedImageUrl = `data:image/png;base64,${img.b64_json}`;
      }
    }

    // Format 5: data.data array (DALL-E / OpenAI images format)
    if (!generatedImageUrl && Array.isArray(data.data) && data.data.length > 0) {
      const img = data.data[0];
      generatedImageUrl = img.url || (img.b64_json ? `data:image/png;base64,${img.b64_json}` : null);
    }

    if (!generatedImageUrl) {
      console.error("Could not extract image from response. Full response:", JSON.stringify(data));
      throw new Error("No image found in response. The model may have returned text only. Full response logged.");
    }

    console.log("Successfully generated image, URL length:", generatedImageUrl.length);

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
