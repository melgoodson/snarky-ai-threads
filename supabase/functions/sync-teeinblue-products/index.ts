import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting Teeinblue product sync...');

    const teeinblueApiKey = Deno.env.get('TEEINBLUE_API_KEY')!;
    const teeinblueStoreId = Deno.env.get('TEEINBLUE_STORE_ID')!;
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch products from Teeinblue
    console.log('Fetching products from Teeinblue...');
    const response = await fetch(
      `https://api.teeinblue.com/v1/stores/${teeinblueStoreId}/products`,
      {
        headers: {
          'Authorization': `Bearer ${teeinblueApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Teeinblue API error:', errorText);
      throw new Error(`Failed to fetch products: ${errorText}`);
    }

    const productsData = await response.json();
    console.log(`Found ${productsData.data?.length || 0} products`);

    if (!productsData.data || productsData.data.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No products found', count: 0 }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Transform and sync products
    const productsToSync = productsData.data.map((product: any) => ({
      printify_product_id: product.id,
      title: product.title,
      description: product.description || '',
      category: product.category || 'apparel',
      price: parseFloat(product.variants?.[0]?.price || '0'),
      images: product.images || [],
      variants: product.variants || [],
      is_active: product.visible === true,
    }));

    console.log('Syncing products to database...');
    const { data, error } = await supabase
      .from('products')
      .upsert(productsToSync, {
        onConflict: 'printify_product_id',
        ignoreDuplicates: false,
      });

    if (error) {
      console.error('Database sync error:', error);
      throw error;
    }

    console.log(`Successfully synced ${productsToSync.length} products`);

    return new Response(
      JSON.stringify({
        success: true,
        count: productsToSync.length,
        message: `Successfully synced ${productsToSync.length} products`,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error syncing products:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
