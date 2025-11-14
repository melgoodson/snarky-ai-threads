import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const printifyApiToken = Deno.env.get('PRINTIFY_API_TOKEN');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!printifyApiToken) {
      throw new Error('PRINTIFY_API_TOKEN not configured');
    }

    const { 
      blueprintId, 
      title, 
      description, 
      printProviderId,
      variantIds,
      printAreas,
      tags = []
    } = await req.json();

    console.log('Creating Printify product:', { blueprintId, title, printProviderId });

    // Get shop ID from Printify
    const shopsResponse = await fetch('https://api.printify.com/v1/shops.json', {
      headers: {
        'Authorization': `Bearer ${printifyApiToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!shopsResponse.ok) {
      throw new Error(`Failed to fetch shops: ${shopsResponse.statusText}`);
    }

    const shops = await shopsResponse.json();
    if (!shops || shops.length === 0) {
      throw new Error('No Printify shops found');
    }

    const shopId = shops[0].id;
    console.log('Using shop ID:', shopId);

    // Create product in Printify
    const productData = {
      title,
      description: description || '',
      blueprint_id: parseInt(blueprintId),
      print_provider_id: parseInt(printProviderId),
      variants: variantIds.map((variantId: number) => ({
        id: variantId,
        price: 2999, // Default price in cents, will be updated later
        is_enabled: true
      })),
      print_areas: printAreas || []
    };

    console.log('Creating product with data:', JSON.stringify(productData, null, 2));

    const createResponse = await fetch(
      `https://api.printify.com/v1/shops/${shopId}/products.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${printifyApiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      }
    );

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error('Printify API error:', errorText);
      throw new Error(`Failed to create product in Printify: ${errorText}`);
    }

    const printifyProduct = await createResponse.json();
    console.log('Product created in Printify:', printifyProduct.id);

    // Save product to database
    const supabase = createClient(supabaseUrl, supabaseKey);

    const dbProduct = {
      printify_product_id: printifyProduct.id,
      printify_blueprint_id: blueprintId,
      title: printifyProduct.title,
      description: printifyProduct.description || '',
      price: printifyProduct.variants?.[0]?.price / 100 || 0,
      retail_price: printifyProduct.variants?.[0]?.price / 100 || 0,
      base_cost: printifyProduct.variants?.[0]?.cost / 100 || 0,
      category: tags[0] || 'Apparel',
      images: printifyProduct.images || [],
      variants: printifyProduct.variants || [],
      print_area_dimensions: printAreas?.[0]?.placeholders?.[0] ? {
        width: printAreas[0].placeholders[0].width,
        height: printAreas[0].placeholders[0].height,
        x_offset: printAreas[0].placeholders[0].position?.left || 0,
        y_offset: printAreas[0].placeholders[0].position?.top || 0
      } : null,
      is_active: false, // Inactive until published
    };

    const { data: savedProduct, error: dbError } = await supabase
      .from('products')
      .insert(dbProduct)
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw dbError;
    }

    console.log('Product saved to database:', savedProduct.id);

    return new Response(
      JSON.stringify({
        success: true,
        printifyProduct,
        savedProduct,
        message: 'Product created successfully in Printify and saved to database',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in create-printify-product:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
