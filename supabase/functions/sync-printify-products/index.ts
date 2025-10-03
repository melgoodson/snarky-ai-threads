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

    console.log('Fetching products from Printify...');

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
    console.log('Shops:', shops);

    if (!shops || shops.length === 0) {
      throw new Error('No Printify shops found');
    }

    const shopId = shops[0].id;
    console.log('Using shop ID:', shopId);

    // Fetch products from Printify
    const productsResponse = await fetch(
      `https://api.printify.com/v1/shops/${shopId}/products.json`,
      {
        headers: {
          'Authorization': `Bearer ${printifyApiToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!productsResponse.ok) {
      throw new Error(`Failed to fetch products: ${productsResponse.statusText}`);
    }

    const printifyProducts = await productsResponse.json();
    console.log(`Fetched ${printifyProducts.data?.length || 0} products`);

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    let syncedCount = 0;
    const products = printifyProducts.data || [];

    for (const product of products) {
      // Only sync published products
      if (!product.is_published) continue;

      const productData = {
        printify_product_id: product.id,
        title: product.title,
        description: product.description || '',
        price: product.variants?.[0]?.price / 100 || 0, // Convert cents to dollars
        category: product.tags?.[0] || 'Apparel',
        images: product.images || [],
        variants: product.variants || [],
        is_active: true,
      };

      const { error } = await supabase
        .from('products')
        .upsert(productData, {
          onConflict: 'printify_product_id',
        });

      if (error) {
        console.error(`Error syncing product ${product.id}:`, error);
      } else {
        syncedCount++;
      }
    }

    console.log(`Successfully synced ${syncedCount} products`);

    return new Response(
      JSON.stringify({
        success: true,
        syncedCount,
        totalProducts: products.length,
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
