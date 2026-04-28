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

    const printifyHeaders = {
      'Authorization': `Bearer ${printifyApiToken}`,
      'Content-Type': 'application/json',
    };

    console.log('Fetching products from Printify...');

    // Get shop ID from Printify
    const shopsResponse = await fetch('https://api.printify.com/v1/shops.json', { headers: printifyHeaders });
    if (!shopsResponse.ok) throw new Error(`Failed to fetch shops: ${shopsResponse.statusText}`);
    const shops = await shopsResponse.json();
    if (!shops || shops.length === 0) throw new Error('No Printify shops found');

    const shopId = shops[0].id;
    console.log('Using shop ID:', shopId);

    // Fetch all shop products with pagination
    let allProducts: any[] = [];
    let page = 1;
    while (true) {
      const productsResponse = await fetch(
        `https://api.printify.com/v1/shops/${shopId}/products.json?page=${page}&limit=100`,
        { headers: printifyHeaders }
      );
      if (!productsResponse.ok) throw new Error(`Failed to fetch products: ${productsResponse.statusText}`);
      const productsPage = await productsResponse.json();
      const pageData = productsPage.data || [];
      allProducts = allProducts.concat(pageData);
      if (pageData.length < 100) break; // last page
      page++;
    }

    console.log(`Fetched ${allProducts.length} total shop products`);

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Cache blueprint catalog images so we only fetch each blueprint once
    const blueprintImageCache: Record<number, string> = {};

    const getBlueprintCatalogImage = async (blueprintId: number): Promise<string> => {
      if (blueprintImageCache[blueprintId] !== undefined) return blueprintImageCache[blueprintId];
      try {
        const res = await fetch(
          `https://api.printify.com/v1/catalog/blueprints/${blueprintId}.json`,
          { headers: printifyHeaders }
        );
        if (!res.ok) {
          blueprintImageCache[blueprintId] = '';
          return '';
        }
        const data = await res.json();
        // images is an array of plain URLs — pick the first (clean blank catalog mockup)
        const url: string = Array.isArray(data.images) ? (data.images[0] || '') : '';
        blueprintImageCache[blueprintId] = url;
        console.log(`  Blueprint ${blueprintId} catalog image: ${url.substring(0, 80)}`);
        return url;
      } catch (e) {
        console.error(`  Failed to fetch blueprint ${blueprintId} catalog image:`, e);
        blueprintImageCache[blueprintId] = '';
        return '';
      }
    };

    let syncedCount = 0;

    for (const product of allProducts) {
      // Resolve price from the first enabled variant with a non-zero price
      const enabledVariants: any[] = (product.variants || []).filter((v: any) => v.is_enabled);
      const priceVariant =
        enabledVariants.find((v: any) => (v.price ?? 0) > 0) ||
        enabledVariants[0] ||
        (product.variants || [])[0];
      const price = priceVariant ? (priceVariant.price ?? 0) / 100 : 0;

      // Fetch the clean blank catalog image for this blueprint from the Printify catalog API
      const templateImageUrl = product.blueprint_id
        ? await getBlueprintCatalogImage(product.blueprint_id)
        : '';

      const productData = {
        printify_product_id: product.id,
        title: product.title,
        description: product.description || '',
        price,
        retail_price: price, // populated from Printify variant price; markup applied elsewhere
        category: product.tags?.[0] || 'Apparel',
        images: product.images || [],
        variants: product.variants || [],
        template_image_url: templateImageUrl,
        is_active: product.visible !== false,
      };

      const { error } = await supabase
        .from('products')
        .upsert(productData, { onConflict: 'printify_product_id' });

      if (error) {
        console.error(`Error syncing product ${product.id}:`, error);
      } else {
        syncedCount++;
      }
    }

    console.log(`Successfully synced ${syncedCount} shop products`);

    // Second pass: Sync variants + catalog images for blueprint-only records (short numeric IDs)
    const { data: blueprintProducts } = await supabase
      .from('products')
      .select('id, printify_product_id, title, variants, template_image_url')
      .eq('is_active', true);

    let blueprintSyncCount = 0;
    for (const bp of (blueprintProducts || [])) {
      if (!bp.printify_product_id) continue;
      const isBlueprint = /^\d{1,5}$/.test(String(bp.printify_product_id));
      if (!isBlueprint) continue;

      const blueprintId = Number(bp.printify_product_id);
      const updates: Record<string, any> = {};

      // Fetch blank catalog image if not already stored
      if (!bp.template_image_url) {
        const catalogImg = await getBlueprintCatalogImage(blueprintId);
        if (catalogImg) updates.template_image_url = catalogImg;
      }

      // Fetch and store variants if not already present
      if (!bp.variants || bp.variants.length === 0) {
        console.log(`Syncing blueprint variants for: ${bp.title} (blueprint ${blueprintId})`);
        try {
          const providersRes = await fetch(
            `https://api.printify.com/v1/catalog/blueprints/${blueprintId}/print_providers.json`,
            { headers: printifyHeaders }
          );
          if (!providersRes.ok) {
            console.error(`No providers for blueprint ${blueprintId}`);
          } else {
            const providers = await providersRes.json();
            if (providers && providers.length > 0) {
              const providerId = providers[0].id;
              const variantsRes = await fetch(
                `https://api.printify.com/v1/catalog/blueprints/${blueprintId}/print_providers/${providerId}/variants.json`,
                { headers: printifyHeaders }
              );
              if (variantsRes.ok) {
                const variantsData = await variantsRes.json();
                const variants = (variantsData.variants || []).map((v: any) => ({
                  id: v.id,
                  title: v.title,
                  is_enabled: true,
                  price: v.price || 0,
                  cost: v.cost || 0,
                }));
                if (variants.length > 0) {
                  updates.variants = variants;
                  console.log(`  Queued ${variants.length} variants for ${bp.title}`);
                }
              }
            }
          }
        } catch (e) {
          console.error(`Error syncing blueprint ${blueprintId}:`, e);
        }
      }

      if (Object.keys(updates).length > 0) {
        const { error } = await supabase.from('products').update(updates).eq('id', bp.id);
        if (!error) blueprintSyncCount++;
        else console.error(`  Error updating blueprint ${bp.title}:`, error);
      }
    }

    console.log(`Blueprint sync complete: ${blueprintSyncCount} products updated`);

    return new Response(
      JSON.stringify({ success: true, syncedCount, blueprintSyncCount, totalProducts: allProducts.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in sync-printify-products:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
