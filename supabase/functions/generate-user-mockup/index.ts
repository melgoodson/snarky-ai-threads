import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
    
    console.log(`Generating Printify mockup for ${product} in color: ${color}`);

    // Determine print placement based on product type
    const getPlacement = (productName: string) => {
      const name = productName.toLowerCase();
      if (name.includes('mug')) return 'wrapped around the cylindrical surface with natural curvature distortion';
      if (name.includes('tote') || name.includes('bag')) return 'centered on the front panel';
      if (name.includes('card') || name.includes('greeting')) return 'centered on the front face';
      if (name.includes('hoodie')) return 'centered on the chest area, sized proportionally';
      return 'centered on the chest, sized appropriately for the garment';
    };

    const getTexture = (productName: string) => {
      const name = productName.toLowerCase();
      if (name.includes('mug')) return 'smooth ceramic with subtle gloss';
      if (name.includes('tote') || name.includes('bag')) return 'canvas weave with slight texture';
      if (name.includes('card')) return 'matte cardstock paper';
      return 'cotton fabric with visible weave texture';
    };

    const placement = getPlacement(product);
    const texture = getTexture(product);

    // Optimized prompt for Printify-ready mockup generation
    const prompt = `Generate a clean, professional e-commerce product mockup.

PRODUCT SPECIFICATIONS:
- Product Type: ${product}
- Product Color: ${color.toUpperCase()} (MANDATORY - this is the exact color the customer ordered)
- Material Texture: ${texture}

INPUT IMAGES:
1. FIRST IMAGE = Customer's design artwork (use EXACTLY as provided, no modifications)
2. SECOND IMAGE = Product template/shape reference ONLY (IGNORE its color completely)

CRITICAL REQUIREMENTS:

COLOR ACCURACY:
- Render the entire ${product} in ${color.toUpperCase()} color
- Override any color from the reference template image
- This color must match what Printify will produce

DESIGN APPLICATION:
- Print Placement: ${placement}
- Transfer the design EXACTLY as shown - do not alter, crop, or resize disproportionately
- Apply the design as if screen-printed or heat-transferred onto the ${color} surface
- The design should follow the product's contours naturally

REALISTIC BLENDING:
- Apply subtle fabric/material texture over the design where it meets the ${color} surface
- Add natural shadows where the design edges meet the product
- Include realistic wrinkles/folds that affect both the product AND the design
- Design ink should appear absorbed into the material, not floating on top

LIGHTING & SHADOWS:
- Soft, even studio lighting from upper-left
- Gentle drop shadow beneath the product
- Highlights should be consistent across product and design
- Colors should integrate naturally with the ${color} base

FINAL OUTPUT: A photorealistic ${color} ${product} with the exact customer design cleanly printed on it, ready for e-commerce display and Printify fulfillment.`;
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
    console.log('AI response received');

    const generatedImageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!generatedImageUrl) {
      throw new Error('No image generated by AI');
    }

    return new Response(
      JSON.stringify({ mockupUrl: generatedImageUrl }),
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
