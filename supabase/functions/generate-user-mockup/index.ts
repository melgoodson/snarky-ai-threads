import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PRODUCT_CONFIG: Record<string, {
  placement: string;
  texture: string;
  perspective: string;
  blending: string;
  printMethod: string;
  surfaceEffects: string;
}> = {
  'tee': {
    placement: 'centered on the chest, approximately 10-12 inches wide, positioned below the collar',
    texture: 'soft cotton jersey with visible fine knit texture and subtle fiber strands',
    perspective: 'follows the natural curve of the torso with slight convex bulge at center',
    blending: 'ink absorbed into cotton fibers, design edges slightly softened by fabric weave',
    printMethod: 'direct-to-garment (DTG) print',
    surfaceEffects: 'fabric creases and wrinkles naturally distort the design, shadows appear in fold valleys'
  },
  'hoodie': {
    placement: 'centered on chest, sized proportionally smaller than t-shirt (8-10 inches), positioned between chest and waist',
    texture: 'heavy fleece with thick, fuzzy surface texture and visible cotton loops',
    perspective: 'follows chest contour with more pronounced curves due to thicker material',
    blending: 'print sits on top of raised fleece texture, ink fills gaps between fabric loops',
    printMethod: 'screen print or DTG on thick fleece',
    surfaceEffects: 'deep fabric folds create dramatic shadows across design, kangaroo pocket below affects placement'
  },
  'mug': {
    placement: 'wrapped around cylindrical surface, design curves naturally from center to edges',
    texture: 'smooth glossy ceramic with subtle light reflections',
    perspective: 'cylindrical distortion - design compresses at edges and expands at center',
    blending: 'sublimation print bonded to ceramic surface, design appears under glaze',
    printMethod: 'sublimation printing',
    surfaceEffects: 'specular highlights on glossy surface, design follows cylinder curvature precisely'
  },
  'tote': {
    placement: 'centered on flat front panel, approximately 8-10 inches wide',
    texture: 'natural canvas weave with visible cross-hatch pattern and slight roughness',
    perspective: 'mostly flat with subtle sag/drape at bottom edges',
    blending: 'screen print ink absorbed into canvas fibers, slight feathering at design edges',
    printMethod: 'screen print on canvas',
    surfaceEffects: 'canvas grain visible through lighter ink areas, handles cast subtle shadows'
  },
  'blanket': {
    placement: 'edge-to-edge sublimation covering the entire front surface of the blanket in a photo collage or large single print',
    texture: 'soft fleece front with visible plush fibers, cozy sherpa backing visible at edges',
    perspective: 'blanket draped naturally over a couch or bed with gentle folds and curves',
    blending: 'full-bleed sublimation print bonded into fleece fibers, design appears embedded in the fabric',
    printMethod: 'edge-to-edge sublimation printing',
    surfaceEffects: 'soft fabric folds create natural shadows across the design, fleece texture visible through lighter areas, sherpa backing peeks at folded edges'
  },
  'card': {
    placement: 'centered on the front face of a folded greeting card, filling most of the card surface',
    texture: 'smooth premium cardstock with slight matte or semi-gloss finish',
    perspective: 'card standing slightly open at an angle, showing front design clearly',
    blending: 'high-quality digital print on cardstock, crisp clean edges, vivid colors',
    printMethod: 'digital printing on premium cardstock',
    surfaceEffects: 'subtle paper texture visible, slight shadow from card fold, clean white interior visible'
  },
  'default': {
    placement: 'centered on primary visible surface',
    texture: 'appropriate material texture for the product type',
    perspective: 'follows natural product contours and shape',
    blending: 'design integrated with material surface naturally',
    printMethod: 'appropriate print method for substrate',
    surfaceEffects: 'natural shadows and highlights consistent with product'
  }
};

function getProductConfig(productTitle: string) {
  const titleLower = productTitle.toLowerCase();
  for (const [key, config] of Object.entries(PRODUCT_CONFIG)) {
    if (key !== 'default' && titleLower.includes(key)) return config;
  }
  if (titleLower.includes('shirt') || titleLower.includes('cotton')) return PRODUCT_CONFIG['tee'];
  if (titleLower.includes('greeting') || titleLower.includes('card')) return PRODUCT_CONFIG['card'];
  return PRODUCT_CONFIG['default'];
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
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userImage, productImage, productTitle, productColor } = await req.json();

    if (!userImage || !productImage) {
      throw new Error('Both userImage and productImage are required');
    }

    const GOOGLE_AI_API_KEY = Deno.env.get('GOOGLE_AI_API_KEY');
    if (!GOOGLE_AI_API_KEY) {
      throw new Error('GOOGLE_AI_API_KEY not configured');
    }

    const color = productColor || 'White';
    const product = productTitle || 'T-Shirt';
    const config = getProductConfig(product);

    console.log(`Generating realistic mockup for ${product} in ${color}`);

    const prompt = `You are a professional product mockup generator for an e-commerce store.

TASK: Produce a single photorealistic e-commerce product image of a ${color.toUpperCase()} ${product} with the custom artwork applied to it.

INPUT IMAGES:
- Image 1 = The artwork/design to print. Reproduce it EXACTLY — same colors, same shapes, no alterations.
- Image 2 = The product template. Use it ONLY to understand the product shape and proportions. Ignore its existing color and any existing text or graphics on it.

PRODUCT SPECIFICATIONS:
- Product: ${product}
- Product color: ${color.toUpperCase()} (the garment/item must be this color)
- Print method: ${config.printMethod}
- Material: ${config.texture}

DESIGN PLACEMENT:
- ${config.placement}
- ${config.perspective}
- ${config.blending}
- ${config.surfaceEffects}

STRICT RULES:
1. The product MUST appear as a ${color.toUpperCase()} colored item. Do not change or reinterpret the product color.
2. The artwork from Image 1 must appear EXACTLY as-is — do not alter, crop, mirror, add text, or hallucinate new design elements.
3. The design must look PRINTED/APPLIED to the product surface — it must follow fabric folds, curves, and texture naturally.
4. Background: clean white studio background, no props, no models, no shadows extending to edges.
5. Output a single product photo only. No before/after, no collage, no multiple angles.
6. Do NOT invent any text, logos, or new design elements not present in Image 1.

OUTPUT: One square-format photorealistic ${color} ${product} on a white background with the artwork printed on it.`;


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
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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
        let generatedImageUrl: string | null = null;

        const candidateParts = data.candidates?.[0]?.content?.parts;
        if (Array.isArray(candidateParts)) {
          for (const part of candidateParts) {
            if (part.inlineData?.data && part.inlineData?.mimeType) {
              generatedImageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
              break;
            }
          }
        }

        if (!generatedImageUrl) {
          console.error('No image in response:', JSON.stringify(data).substring(0, 1000));
          lastError = "No image generated";
          break;
        }

        console.log('Mockup generated successfully');
        return new Response(
          JSON.stringify({
            mockupUrl: generatedImageUrl,
            productConfig: { placement: config.placement, printMethod: config.printMethod }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    if (lastError === "Rate limit exceeded") {
      return new Response(
        JSON.stringify({ error: "AI service is busy. Please wait 1-2 minutes and try again." }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    throw new Error(`Failed to generate mockup: ${lastError}`);
  } catch (error) {
    console.error('Error generating mockup:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to generate mockup' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
