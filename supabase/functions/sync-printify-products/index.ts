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

    console.log(`Successfully synced ${syncedCount} shop products`);

    // Second pass: Sync variants for blueprint-only products (those with short numeric IDs)
    const { data: blueprintProducts } = await supabase
      .from('products')
      .select('id, printify_product_id, title, variants')
      .eq('is_active', true);

    let blueprintSyncCount = 0;
    for (const bp of (blueprintProducts || [])) {
      if (!bp.printify_product_id) continue;
      const isBlueprint = /^\d{1,5}$/.test(String(bp.printify_product_id));
      if (!isBlueprint) continue;
      if (bp.variants && bp.variants.length > 0) continue; // Already has variants

      console.log(`Syncing blueprint variants for: ${bp.title} (blueprint ${bp.printify_product_id})`);
      try {
        // Get print providers for this blueprint
        const providersRes = await fetch(
          `https://api.printify.com/v1/catalog/blueprints/${bp.printify_product_id}/print_providers.json`,
          { headers: { 'Authorization': `Bearer ${printifyApiToken}` } }
        );
        if (!providersRes.ok) { console.error(`No providers for blueprint ${bp.printify_product_id}`); continue; }
        const providers = await providersRes.json();
        if (!providers || providers.length === 0) continue;

        const providerId = providers[0].id;

        // Get variants for this blueprint + provider
        const variantsRes = await fetch(
          `https://api.printify.com/v1/catalog/blueprints/${bp.printify_product_id}/print_providers/${providerId}/variants.json`,
          { headers: { 'Authorization': `Bearer ${printifyApiToken}` } }
        );
        if (!variantsRes.ok) continue;
        const variantsData = await variantsRes.json();
        const variants = (variantsData.variants || []).map((v: any) => ({
          id: v.id,
          title: v.title,
          is_enabled: true,
          price: v.price || 0,
          cost: v.cost || 0,
        }));

        if (variants.length > 0) {
          const { error } = await supabase
            .from('products')
            .update({ variants })
            .eq('id', bp.id);
          if (!error) {
            blueprintSyncCount++;
            console.log(`  Synced ${variants.length} variants for ${bp.title}`);
          } else {
            console.error(`  Error updating variants for ${bp.title}:`, error);
          }
        }
      } catch (e) {
        console.error(`Error syncing blueprint ${bp.printify_product_id}:`, e);
      }
    }

    console.log(`Blueprint sync complete: ${blueprintSyncCount} products updated`);

    return new Response(
      JSON.stringify({
        success: true,
        syncedCount,
        blueprintSyncCount,
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
