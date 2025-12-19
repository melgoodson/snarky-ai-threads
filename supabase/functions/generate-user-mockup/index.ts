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
  'bag': {
    placement: 'centered on flat front panel, approximately 8-10 inches wide',
    texture: 'natural canvas weave with visible cross-hatch pattern',
    perspective: 'flat panel with soft edges and natural material drape',
    blending: 'ink fills canvas weave pattern, design conforms to fabric texture',
    printMethod: 'screen print on canvas',
    surfaceEffects: 'canvas texture shows through, straps create shadow lines'
  },
  'card': {
    placement: 'full bleed or centered with margins, covering most of front face',
    texture: 'smooth matte or semi-gloss cardstock, fine paper grain',
    perspective: 'perfectly flat surface with crisp edges',
    blending: 'lithographic print on paper, colors appear vibrant and sharp',
    printMethod: 'offset or digital print on cardstock',
    surfaceEffects: 'subtle paper texture, clean edges, possible gloss variation'
  },
  'candle': {
    placement: 'wrapped around glass surface, design visible through container',
    texture: 'smooth glass with slight transparency and reflection',
    perspective: 'cylindrical curvature with glass distortion effects',
    blending: 'printed label adhered to glass, design shows through clear areas',
    printMethod: 'adhesive label or direct print on glass',
    surfaceEffects: 'glass reflections overlay design, candle wax visible inside'
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

// Get product configuration based on title
function getProductConfig(productTitle: string) {
  const titleLower = productTitle.toLowerCase();
  
  for (const [key, config] of Object.entries(PRODUCT_CONFIG)) {
    if (key !== 'default' && titleLower.includes(key)) {
      return config;
    }
  }
  
  // Check for t-shirt variations
  if (titleLower.includes('shirt') || titleLower.includes('cotton')) {
    return PRODUCT_CONFIG['tee'];
  }
  
  return PRODUCT_CONFIG['default'];
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

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const color = productColor || 'White';
    const product = productTitle || 'T-Shirt';
    const config = getProductConfig(product);
    
    console.log(`Generating realistic mockup for ${product} in ${color}`);
    console.log('Using config:', config);

    // Enhanced prompt for photorealistic mockup generation with proper integration
    const prompt = `Create a PHOTOREALISTIC e-commerce product mockup with the design NATURALLY INTEGRATED into the product.

=== PRODUCT DETAILS ===
• Product: ${product}
• Color: ${color.toUpperCase()} (EXACT color - override any template colors)
• Material: ${config.texture}
• Print Method: ${config.printMethod}

=== INPUT IMAGES ===
IMAGE 1 (Design): The exact artwork to be printed - preserve every detail
IMAGE 2 (Template): Product shape reference only - IGNORE its color

=== CRITICAL: NATURAL DESIGN INTEGRATION ===

PLACEMENT & SCALE:
• ${config.placement}
• Scale the design proportionally - it should look professionally sized
• Maintain design aspect ratio - no stretching or distortion

PERSPECTIVE & WARP:
• ${config.perspective}
• Apply proper perspective transformation to match product surface
• Design edges should follow product contours exactly
• Use proper cylindrical/spherical/planar warp as needed

MATERIAL BLENDING:
• ${config.blending}
• Design should NOT look "pasted on" - it must appear PRINTED
• Ink/print should be ABSORBED into the material surface
• Material texture should be slightly visible THROUGH lighter areas of the design
• Design edges should have subtle softening where ink meets fabric/material

SURFACE EFFECTS:
• ${config.surfaceEffects}
• Wrinkles and folds MUST affect the design - distort accordingly
• Design should dip into creases and rise over bumps
• Shadow areas of product should darken the design proportionally
• Highlighted areas should brighten the design subtly

LIGHTING & SHADOWS:
• Soft studio lighting from upper-left (45° angle)
• Consistent shadows across BOTH product AND design
• The design receives the SAME lighting as the product surface
• Add subtle ambient occlusion where design meets product edges
• Gentle product shadow on background

COLOR ACCURACY:
• Product must be exactly ${color.toUpperCase()}
• Design colors should adjust slightly to the ${color} base (darker designs on darker products)
• Maintain color vibrancy while respecting material color influence

=== OUTPUT REQUIREMENTS ===
Generate a photorealistic mockup where:
1. The design appears TRULY PRINTED/EMBROIDERED on the ${color} ${product}
2. No "floating" or "cut-out" appearance
3. Material texture is visible in and around the design
4. All folds, creases, and contours affect the design naturally
5. Professional e-commerce quality suitable for Printify fulfillment`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: userImage
                }
              },
              {
                type: 'image_url',
                image_url: {
                  url: productImage
                }
              }
            ]
          }
        ],
        modalities: ['image', 'text']
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', errorText);
      
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a moment.');
      }
      if (response.status === 402) {
        throw new Error('AI credits exhausted. Please add credits to continue.');
      }
      
      throw new Error(`AI service error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI response received successfully');

    const generatedImageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!generatedImageUrl) {
      console.error('No image in response:', JSON.stringify(data, null, 2));
      throw new Error('No image generated by AI');
    }

    return new Response(
      JSON.stringify({ 
        mockupUrl: generatedImageUrl,
        productConfig: {
          placement: config.placement,
          printMethod: config.printMethod
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error generating mockup:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to generate mockup',
        details: error instanceof Error ? error.stack : undefined
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
