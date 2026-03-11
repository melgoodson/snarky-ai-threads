import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PRODUCT_INTEGRATION: Record<string, { placement: string; warp: string; texture: string }> = {
  tee: {
    placement: 'centered on chest, 10-12 inches wide, below the collar',
    warp: 'subtle chest curvature, follows torso contour naturally',
    texture: 'cotton jersey - visible weave, soft shadows in folds'
  },
  hoodie: {
    placement: 'centered on chest, 8-10 inches wide, between collar and kangaroo pocket',
    warp: 'thicker fleece material with more pronounced folds and volume',
    texture: 'heavy fleece - fuzzy surface, deeper shadows in creases'
  },
  mug: {
    placement: 'wrapped around cylinder center, visible from front',
    warp: 'cylindrical distortion - design compresses slightly at edges',
    texture: 'glossy ceramic with subtle specular highlights'
  },
  tote: {
    placement: 'centered on flat front panel, 8-10 inches wide',
    warp: 'minimal warp - mostly flat with slight canvas drape',
    texture: 'natural canvas weave visible through lighter design areas'
  },
  blanket: {
    placement: 'edge-to-edge sublimation across the entire front face',
    warp: 'soft natural draping folds, gentle curves from weight of fabric',
    texture: 'soft fleece plush fibers on front, cozy sherpa backing visible at folded edges'
  },
  card: {
    placement: 'centered on front face of folded greeting card',
    warp: 'mostly flat, slight perspective from card standing upright',
    texture: 'smooth premium cardstock with matte finish'
  }
};

function getProductType(title: string) {
  const lower = title.toLowerCase();
  if (lower.includes('hoodie') || lower.includes('sweatshirt')) return 'hoodie';
  if (lower.includes('mug') || lower.includes('cup')) return 'mug';
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
  if (!resp.ok) throw new Error(`Failed to fetch image: ${resp.status} ${resp.statusText} — URL: ${url}`);
  const buf = await resp.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  const base64 = btoa(binary);
  const contentType = resp.headers.get('content-type') || 'image/jpeg';
  return { mimeType: contentType.split(';')[0], data: base64 };
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
  // Raw base64 fallback
  return { inlineData: { mimeType: 'image/jpeg', data: image } };
}

// Models in priority order. gemini-2.0-flash-preview-image-generation is the confirmed
// working image-generation model. gemini-2.0-flash-exp-image-generation is the fallback.
const MODELS = [
  "gemini-2.0-flash-preview-image-generation",
  "gemini-2.0-flash-exp-image-generation",
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { userImage, productImage, productTitle, productColor } = body;

    // Validate required fields
    if (!userImage) {
      return new Response(
        JSON.stringify({ error: "Missing required field: userImage (person photo)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (!productImage) {
      return new Response(
        JSON.stringify({ error: "Missing required field: productImage (product template URL or image)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const GOOGLE_AI_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY");
    if (!GOOGLE_AI_API_KEY) {
      console.error("GOOGLE_AI_API_KEY environment variable is not set");
      return new Response(
        JSON.stringify({ error: "Server configuration error: AI API key not configured. Please contact support." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const color = productColor || "White";
    const product = productTitle || "T-Shirt";
    const productType = getProductType(product);
    const config = PRODUCT_INTEGRATION[productType] || PRODUCT_INTEGRATION.tee;

    console.log(`[generate-mockup] Try-on request: product="${product}" color="${color}" type="${productType}"`);
    console.log(`[generate-mockup] userImage type: ${userImage.startsWith('data:') ? 'base64 data-url' : 'url'} (~${Math.round(userImage.length / 1024)}KB)`);
    console.log(`[generate-mockup] productImage type: ${productImage.startsWith('data:') ? 'base64 data-url' : 'url'}`);

    const prompt = `You are a professional virtual clothing try-on AI.

TASK: Show the person from Image 1 wearing a ${color.toUpperCase()} ${product} with the custom design applied to it.

INPUTS:
- Image 1 = The person's photo. Keep the person's face, body, background, and overall scene intact.
- Image 2 = The product template. Use it to understand: (a) what the blank ${product} looks like, and (b) where the design artwork is printed on it.

WHAT TO DO:
1. Replace only the clothing the person is wearing with a ${color.toUpperCase()} ${product}.
2. Apply the design from Image 2 onto the new garment in the correct position: ${config.placement}
3. The design must follow the body's natural ${config.warp}
4. The garment fabric must show realistic ${config.texture}
5. The rest of the image (face, hair, background, hands, etc.) must remain UNCHANGED.

STRICT RULES:
- Do NOT alter the person's face, skin tone, or body.
- The garment color MUST be ${color.toUpperCase()}.
- The design must appear PRINTED on fabric — not floating or pasted on top.
- Preserve the design artwork exactly — do not add, remove, or alter any design elements.
- Output ONE image only — no collages, no split views, no before/after.

OUTPUT: A single photorealistic image of the person wearing the ${color} ${product} with the design printed on it.`;

    // Convert images in parallel to save time
    let userImagePart: { inlineData: { mimeType: string; data: string } };
    let productImagePart: { inlineData: { mimeType: string; data: string } };
    try {
      [userImagePart, productImagePart] = await Promise.all([
        toImagePart(userImage),
        toImagePart(productImage),
      ]);
    } catch (fetchErr) {
      console.error("[generate-mockup] Failed to load input images:", fetchErr);
      return new Response(
        JSON.stringify({ error: `Failed to load input images: ${fetchErr instanceof Error ? fetchErr.message : String(fetchErr)}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[generate-mockup] Images loaded. userImage: ~${Math.round(userImagePart.inlineData.data.length / 1024)}KB b64, productImage: ~${Math.round(productImagePart.inlineData.data.length / 1024)}KB b64`);

    let lastError = "";
    let lastStatus = 0;

    for (const model of MODELS) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GOOGLE_AI_API_KEY}`;
      console.log(`[generate-mockup] Calling model: ${model}`);

      const MAX_RETRIES = 2;
      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        if (attempt > 0) {
          const delay = 3000 * attempt;
          console.log(`[generate-mockup] Retry ${attempt}/${MAX_RETRIES - 1}, waiting ${delay}ms...`);
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

        lastStatus = response.status;

        if (response.status === 429) {
          lastError = "Rate limit exceeded";
          console.warn(`[generate-mockup] Rate limited on ${model} (attempt ${attempt + 1})`);
          continue; // retry
        }

        if (response.status === 404) {
          lastError = `Model not found: ${model}`;
          console.error(`[generate-mockup] Model 404: ${model}`);
          break; // try next model
        }

        if (!response.ok) {
          const errorText = await response.text();
          lastError = `HTTP ${response.status}: ${errorText.substring(0, 300)}`;
          console.error(`[generate-mockup] Gemini API error on ${model}: ${lastError}`);
          break; // try next model
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
          // Log what Gemini did return so we can debug
          const finishReason = data.candidates?.[0]?.finishReason;
          const textParts = candidateParts?.filter((p: any) => p.text)?.map((p: any) => p.text).join(' ');
          lastError = `No image generated. finishReason=${finishReason ?? 'unknown'}${textParts ? ` modelSaid="${textParts.substring(0, 200)}"` : ''}`;
          console.error(`[generate-mockup] ${lastError}`);
          break; // try next model — no point retrying same model if it refused
        }

        console.log(`[generate-mockup] Success via ${model}`);
        return new Response(
          JSON.stringify({ image: generatedImage }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // All models/retries exhausted — return a clear diagnostic error
    console.error(`[generate-mockup] All models failed. lastStatus=${lastStatus} lastError=${lastError}`);

    if (lastError === "Rate limit exceeded") {
      return new Response(
        JSON.stringify({ error: "AI service is currently overloaded. Please wait 1–2 minutes and try again." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (lastError.includes("No image generated")) {
      return new Response(
        JSON.stringify({ error: "The AI declined to generate this try-on. This can happen with certain photo angles or content. Try a different photo." }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: `Try-on generation failed: ${lastError}` }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[generate-mockup] Unhandled error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
