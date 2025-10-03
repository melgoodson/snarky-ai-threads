import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const printifyToken = Deno.env.get('PRINTIFY_API_TOKEN');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!printifyToken) {
      throw new Error('PRINTIFY_API_TOKEN not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get shop ID from request or use default
    const { shopId } = await req.json();
    
    console.log('Fetching products from Printify shop:', shopId);

    // Fetch products from Printify
    const response = await fetch(
      `https://api.printify.com/v1/shops/${shopId}/products.json`,
      {
        headers: {
          'Authorization': `Bearer ${printifyToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Printify API error:', error);
      throw new Error(`Printify API error: ${response.status}`);
    }

    const printifyProducts = await response.json();
    console.log(`Fetched ${printifyProducts.data?.length || 0} products from Printify`);

    // Sync products to database
    const syncedProducts = [];
    for (const product of printifyProducts.data || []) {
      const productData = {
        printify_product_id: product.id,
        title: product.title,
        description: product.description || '',
        price: product.variants?.[0]?.price / 100 || 0, // Convert cents to dollars
        category: product.tags?.join(', ') || 'Apparel',
        images: product.images || [],
        variants: product.variants || [],
        is_active: product.visible,
      };

      // Upsert product
      const { data, error } = await supabase
        .from('products')
        .upsert(productData, {
          onConflict: 'printify_product_id',
        })
        .select()
        .single();

      if (error) {
        console.error('Error upserting product:', error);
      } else {
        syncedProducts.push(data);
      }
    }

    console.log(`Synced ${syncedProducts.length} products to database`);

    return new Response(
      JSON.stringify({
        success: true,
        synced: syncedProducts.length,
        products: syncedProducts,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in sync-printify-products:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
