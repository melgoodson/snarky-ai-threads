import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userImage, productImage, productTitle, productColor } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const color = productColor || "White";
    const product = productTitle || "T-Shirt";

    console.log(`Generating virtual try-on for ${product} in ${color}`);

    // Prepare images for the API
    const userImageData = userImage.startsWith("data:") 
      ? userImage 
      : `data:image/jpeg;base64,${userImage}`;

    const productImageData = productImage.startsWith("data:")
      ? productImage
      : productImage.startsWith("http")
      ? productImage
      : `data:image/png;base64,${productImage}`;

    // Optimized prompt for virtual try-on with accurate color
    const prompt = `Create a photorealistic virtual try-on image.

INPUTS:
- IMAGE A (FIRST): Photo of the person who will wear the product
- IMAGE B (SECOND): ${product} with design printed on it (reference for design extraction only)

TASK:
Show the person from IMAGE A wearing a ${color.toUpperCase()} ${product} with the EXACT design from IMAGE B.

CRITICAL COLOR RULE:
- The ${product} MUST be ${color.toUpperCase()} colored
- Do NOT use the garment color from IMAGE B - change it to ${color}
- The fabric/material must appear as ${color}

DESIGN EXTRACTION:
- Extract ONLY the printed graphic/artwork from IMAGE B
- Ignore the model/mannequin in IMAGE B completely
- Preserve the design exactly as shown

APPLICATION:
- Place the extracted design on a ${color} ${product} worn by the person in IMAGE A
- Center the design appropriately (chest for shirts/hoodies, front for bags)
- Match perspective to the person's body position
- Apply realistic fabric texture, wrinkles, and shadows
- Blend lighting to match IMAGE A's environment

OUTPUT: Professional photo of the person wearing a ${color} ${product} with the design.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt,
              },
              {
                type: "image_url",
                image_url: {
                  url: userImageData,
                },
              },
              {
                type: "image_url",
                image_url: {
                  url: productImageData,
                },
              },
            ],
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds to your workspace." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data = await response.json();
    const generatedImage = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!generatedImage) {
      throw new Error("No image generated");
    }

    console.log("Mockup generated successfully");

    return new Response(
      JSON.stringify({ image: generatedImage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in generate-mockup function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
