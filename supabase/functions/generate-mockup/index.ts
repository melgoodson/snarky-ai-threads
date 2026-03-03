import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PRODUCT_INTEGRATION: Record<string, { placement: string; warp: string; texture: string }> = {
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
  },
  blanket: {
    placement: 'edge-to-edge sublimation covering entire front surface, photo collage or single large print',
    warp: 'soft draping folds over couch or lap, gentle curves',
    texture: 'soft fleece plush fibers on front, cozy sherpa backing at edges'
  },
  card: {
    placement: 'centered on front face of folded greeting card',
    warp: 'mostly flat, slight perspective from card standing at angle',
    texture: 'smooth premium cardstock with matte finish'
  }
};

function getProductType(title: string) {
  const lower = title.toLowerCase();
  if (lower.includes('hoodie') || lower.includes('sweatshirt')) return 'hoodie';
  if (lower.includes('mug')) return 'mug';
  if (lower.includes('tote') || lower.includes('bag')) return 'tote';
  if (lower.includes('blanket')) return 'blanket';
  if (lower.includes('greeting') || lower.includes('card')) return 'card';
  return 'tee';
}

function parseDataUrl(dataUrl: string): { mimeType: string; data: string } | null {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (match) return { mimeType: match[1], data: match[2] };
  return null;
}

async function urlToBase64(url: string): Promise<{ mimeType: string; data: string }> {
  const resp = await fetch(url);
  const buf = await resp.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  const base64 = btoa(binary);
  const contentType = resp.headers.get('content-type') || 'image/png';
  return { mimeType: contentType, data: base64 };
}

async function toImagePart(image: string): Promise<{ inlineData: { mimeType: string; data: string } }> {
  if (image.startsWith('data:')) {
    const parsed = parseDataUrl(image);
    if (parsed) return { inlineData: parsed };
  }
  if (image.startsWith('http')) {
    const fetched = await urlToBase64(image);
    return { inlineData: fetched };
  }
  return { inlineData: { mimeType: 'image/jpeg', data: image } };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userImage, productImage, productTitle, productColor } = await req.json();
    const GOOGLE_AI_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY");

    if (!GOOGLE_AI_API_KEY) {
      throw new Error("GOOGLE_AI_API_KEY is not configured");
    }

    const color = productColor || "White";
    const product = productTitle || "T-Shirt";
    const productType = getProductType(product);
    const config = PRODUCT_INTEGRATION[productType] || PRODUCT_INTEGRATION.tee;

    console.log(`Generating virtual try-on for ${product} in ${color}`);

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

DESIGN EXTRACTION & APPLICATION:
• Extract ONLY the graphic/artwork from IMAGE B (ignore model/mannequin)
• Preserve the design EXACTLY - no alterations, cropping, or distortion
• Placement: ${config.placement}

PERSPECTIVE & WARP:
• ${config.warp}
• Design must follow the person's body contours in IMAGE A

MATERIAL INTEGRATION:
• ${config.texture}
• Design should appear PRINTED on fabric - NOT pasted/floating

REALISTIC EFFECTS:
• Wrinkles and folds in IMAGE A's clothing MUST distort the design
• Shadows on fabric should darken the design proportionally

=== OUTPUT ===
A completely photorealistic image where the person from IMAGE A is wearing a ${color} ${product} with the design naturally printed on it.`;

    const userImagePart = await toImagePart(userImage);
    const productImagePart = await toImagePart(productImage);

    const models = ["gemini-2.5-flash-image", "gemini-2.0-flash-exp-image-generation"];
    const MAX_RETRIES = 2;
    let lastError = "";

    for (const model of models) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GOOGLE_AI_API_KEY}`;
      console.log(`Trying model: ${model}`);

      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        if (attempt > 0) {
          const delay = Math.min(2000 * Math.pow(2, attempt - 1), 8000);
          console.log(`Retry ${attempt + 1}, waiting ${delay}ms...`);
          await new Promise(r => setTimeout(r, delay));
        }

        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: prompt },
                userImagePart,
                productImagePart,
              ]
            }],
            generationConfig: {
              responseModalities: ["TEXT", "IMAGE"],
            },
          }),
        });

        if (response.status === 429) {
          lastError = "Rate limit exceeded";
          console.log(`Rate limited on ${model}, attempt ${attempt + 1}/${MAX_RETRIES}`);
          continue;
        }

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Gemini API error: ${response.status} - ${errorText}`);
          lastError = `${response.status} - ${errorText}`;
          break;
        }

        const data = await response.json();
        let generatedImage: string | null = null;

        const candidateParts = data.candidates?.[0]?.content?.parts;
        if (Array.isArray(candidateParts)) {
          for (const part of candidateParts) {
            if (part.inlineData?.data && part.inlineData?.mimeType) {
              generatedImage = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
              break;
            }
          }
        }

        if (!generatedImage) {
          console.error("No image in response:", JSON.stringify(data).substring(0, 1000));
          lastError = "No image generated";
          break;
        }

        console.log("Virtual try-on mockup generated successfully");
        return new Response(
          JSON.stringify({ image: generatedImage }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    if (lastError === "Rate limit exceeded") {
      return new Response(
        JSON.stringify({ error: "AI service is busy. Please wait 1-2 minutes and try again." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    throw new Error(`Failed to generate try-on: ${lastError}`);
  } catch (error) {
    console.error("Error in generate-mockup function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
