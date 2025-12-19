import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Product-specific integration settings for virtual try-on
const PRODUCT_INTEGRATION = {
  tee: {
    placement: 'centered on chest, 10-12 inches wide',
    warp: 'subtle chest curvature, follows torso contour',
    texture: 'cotton jersey - visible weave, soft shadows in folds'
  },
  hoodie: {
    placement: 'centered on chest, 8-10 inches wide',
    warp: 'thicker material with more pronounced folds',
    texture: 'fleece - fuzzy surface, deeper shadows in creases'
  },
  mug: {
    placement: 'wrapped around cylinder',
    warp: 'cylindrical distortion - compressed at edges',
    texture: 'glossy ceramic with reflections'
  },
  tote: {
    placement: 'centered on flat front panel',
    warp: 'minimal - mostly flat with slight drape',
    texture: 'canvas weave visible through design'
  }
};

function getProductType(title: string) {
  const lower = title.toLowerCase();
  if (lower.includes('hoodie') || lower.includes('sweatshirt')) return 'hoodie';
  if (lower.includes('mug')) return 'mug';
  if (lower.includes('tote') || lower.includes('bag')) return 'tote';
  return 'tee';
}

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
    const productType = getProductType(product);
    const config = PRODUCT_INTEGRATION[productType] || PRODUCT_INTEGRATION.tee;

    console.log(`Generating virtual try-on for ${product} in ${color}`);
    console.log('Product config:', config);

    // Prepare images for the API
    const userImageData = userImage.startsWith("data:") 
      ? userImage 
      : `data:image/jpeg;base64,${userImage}`;

    const productImageData = productImage.startsWith("data:")
      ? productImage
      : productImage.startsWith("http")
      ? productImage
      : `data:image/png;base64,${productImage}`;

    // Enhanced prompt for photorealistic virtual try-on with proper integration
    const prompt = `Create a PHOTOREALISTIC virtual try-on image with the design NATURALLY INTEGRATED into the garment.

=== INPUTS ===
• IMAGE A (FIRST): Photo of the person wearing the product
• IMAGE B (SECOND): ${product} mockup - extract the DESIGN ONLY from this

=== TASK ===
Show the person from IMAGE A wearing a ${color.toUpperCase()} ${product} with the EXACT design from IMAGE B printed on it.

=== CRITICAL: NATURAL DESIGN INTEGRATION ===

COLOR ACCURACY:
• The ${product} MUST be ${color.toUpperCase()} color
• IGNORE the garment color from IMAGE B - use ${color} instead
• Fabric must appear as ${color} with proper shading

DESIGN EXTRACTION & APPLICATION:
• Extract ONLY the graphic/artwork from IMAGE B (ignore model/mannequin)
• Preserve the design EXACTLY - no alterations, cropping, or distortion
• Placement: ${config.placement}

PERSPECTIVE & WARP:
• ${config.warp}
• Design must follow the person's body contours in IMAGE A
• Apply proper perspective transformation to match pose
• Design edges follow fabric curves precisely

MATERIAL INTEGRATION:
• ${config.texture}
• Design should appear PRINTED on fabric - NOT pasted/floating
• Fabric texture must be slightly visible THROUGH lighter design areas
• Design edges should have subtle softening where ink meets fabric

REALISTIC EFFECTS:
• Wrinkles and folds in IMAGE A's clothing MUST distort the design
• Design dips into creases and rises over bumps
• Shadows on fabric should darken the design proportionally
• Highlighted areas brighten the design naturally

LIGHTING MATCH:
• Match the lighting from IMAGE A exactly
• Design receives same shadows/highlights as surrounding fabric
• Maintain IMAGE A's environment and ambiance
• Natural shadow under person consistent with scene

=== OUTPUT ===
A completely photorealistic image where the person from IMAGE A is wearing a ${color} ${product} with the design naturally printed on it - indistinguishable from a real photo.`;

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
      console.error("No image in response:", JSON.stringify(data, null, 2));
      throw new Error("No image generated");
    }

    console.log("Virtual try-on mockup generated successfully");

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
