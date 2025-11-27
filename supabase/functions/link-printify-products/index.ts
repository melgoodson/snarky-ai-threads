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

    console.log('Fetching Printify shop...');

    // Get shop ID
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

    // Fetch all products from Printify
    console.log('Fetching products from Printify...');
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
      throw new Error(`Failed to fetch Printify products: ${productsResponse.statusText}`);
    }

    const printifyProducts = await productsResponse.json();
    console.log(`Found ${printifyProducts.data?.length || 0} Printify products`);

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch our database products
    const { data: dbProducts, error: fetchError } = await supabase
      .from('products')
      .select('id, title, printify_product_id');

    if (fetchError) {
      throw fetchError;
    }

    console.log(`Found ${dbProducts?.length || 0} database products`);

    const results = [];

    // Match Printify products to database products
    for (const dbProduct of dbProducts || []) {
      const matchResult: any = {
        dbProductId: dbProduct.id,
        dbProductTitle: dbProduct.title,
        status: 'not_found',
        printifyProductId: null,
        variantCount: 0,
      };

      // More flexible title matching
      const dbTitleLower = dbProduct.title.toLowerCase();
      const keyTerms = dbTitleLower.split(/[\s–—-]+/).filter((term: string) => term.length > 2);

      const matchedPrintifyProduct = printifyProducts.data?.find((pp: any) => {
        const ppTitleLower = pp.title.toLowerCase();
        
        // Count matching terms
        const matchCount = keyTerms.filter((term: string) => ppTitleLower.includes(term)).length;
        
        // For short product names (1-2 key terms), require 1 match
        // For longer names, require at least 2 matches
        const requiredMatches = keyTerms.length <= 2 ? 1 : 2;
        
        return matchCount >= requiredMatches;
      });

      if (matchedPrintifyProduct) {
        console.log(`Matched "${dbProduct.title}" to "${matchedPrintifyProduct.title}"`);

        // Update database with Printify product ID and variants
        const { error: updateError } = await supabase
          .from('products')
          .update({
            printify_product_id: matchedPrintifyProduct.id,
            variants: matchedPrintifyProduct.variants || [],
            images: matchedPrintifyProduct.images || [],
          })
          .eq('id', dbProduct.id);

        if (updateError) {
          console.error(`Error updating product ${dbProduct.id}:`, updateError);
          matchResult.status = 'error';
          matchResult.error = updateError.message;
        } else {
          matchResult.status = 'linked';
          matchResult.printifyProductId = matchedPrintifyProduct.id;
          matchResult.printifyProductTitle = matchedPrintifyProduct.title;
          matchResult.variantCount = matchedPrintifyProduct.variants?.length || 0;
        }
      } else {
        console.log(`No match found for "${dbProduct.title}"`);
      }

      results.push(matchResult);
    }

    const linkedCount = results.filter(r => r.status === 'linked').length;
    const notFoundCount = results.filter(r => r.status === 'not_found').length;

    console.log(`Linking complete: ${linkedCount} linked, ${notFoundCount} not found`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully linked ${linkedCount} of ${dbProducts?.length || 0} products`,
        results,
        summary: {
          total: dbProducts?.length || 0,
          linked: linkedCount,
          notFound: notFoundCount,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in link-printify-products:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
