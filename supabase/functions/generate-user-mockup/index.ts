import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Comprehensive product configuration for realistic mockup generation
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
  return PRODUCT_CONFIG['default'];
}

// Helper: extract base64 data and mime type from a data URL
function parseDataUrl(dataUrl: string): { mimeType: string; data: string } | null {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (match) return { mimeType: match[1], data: match[2] };
  return null;
}

// Helper: fetch a URL and return as base64
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

// Convert image input to Gemini inlineData part
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

    const prompt = `Create a PHOTOREALISTIC e-commerce product mockup with the design NATURALLY INTEGRATED into the product.

=== PRODUCT DETAILS ===
• Product: ${product}
• Color: ${color.toUpperCase()}
• Material: ${config.texture}
• Print Method: ${config.printMethod}

=== INPUT IMAGES ===
IMAGE 1 (Design): The exact artwork to be printed - preserve every detail
IMAGE 2 (Template): Product shape reference only - IGNORE its color

=== CRITICAL: NATURAL DESIGN INTEGRATION ===

PLACEMENT & SCALE:
• ${config.placement}
• Scale the design proportionally

PERSPECTIVE & WARP:
• ${config.perspective}
• Design edges should follow product contours exactly

MATERIAL BLENDING:
• ${config.blending}
• Design should NOT look "pasted on" - it must appear PRINTED

SURFACE EFFECTS:
• ${config.surfaceEffects}
• Wrinkles and folds MUST affect the design

LIGHTING & SHADOWS:
• Soft studio lighting from upper-left
• The design receives the SAME lighting as the product surface

COLOR ACCURACY:
• Product must be exactly ${color.toUpperCase()}

=== OUTPUT ===
A photorealistic mockup where the design appears TRULY PRINTED on the ${color} ${product}.`;

    const userImagePart = await toImagePart(userImage);
    const productImagePart = await toImagePart(productImage);

    const model = "gemini-2.0-flash-exp";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GOOGLE_AI_API_KEY}`;

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

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a moment.');
      }
      throw new Error(`Gemini API error: ${response.status}`);
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
      throw new Error('No image generated by AI');
    }

    console.log('Mockup generated successfully');

    return new Response(
      JSON.stringify({
        mockupUrl: generatedImageUrl,
        productConfig: {
          placement: config.placement,
          printMethod: config.printMethod
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error generating mockup:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to generate mockup',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
