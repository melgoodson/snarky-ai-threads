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

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Product configurations
    const productsToCreate = [
      {
        dbId: '6a3e8f69-01e5-412a-95db-92c2a72a4d0e', // Tote Bag
        blueprintId: 467,
        title: 'Tote Bag',
        variantFilter: (variants: any[]) => variants.filter(v => v.title.includes('Snowwhite')),
      },
      {
        dbId: '17c18ee5-d25b-4edd-b9b6-3acef0c7eca6', // T-Shirt
        blueprintId: 12,
        title: 'Unisex Jersey Short Sleeve Tee',
        variantFilter: (variants: any[]) => {
          // Pick top 10 colors: Black, White, Navy, Gray, Red, Royal Blue, Forest Green, Maroon, Light Blue, Pink
          const topColors = ['Black', 'White', 'Navy', 'Dark Heather', 'Red', 'Royal', 'Forest', 'Maroon', 'Light Blue', 'Pink'];
          return variants.filter(v => 
            topColors.some(color => v.title.includes(color))
          ).slice(0, 50); // Get first 50 variants with these colors (all sizes)
        },
      },
      {
        dbId: 'f3f95e6e-e350-4b0d-8b16-fef21e2a3f35', // Hoodie
        blueprintId: 77,
        title: 'Unisex Heavy Blend™ Hooded Sweatshirt',
        variantFilter: (variants: any[]) => {
          const topColors = ['Black', 'White', 'Navy', 'Dark Heather', 'Red', 'Royal', 'Forest', 'Maroon', 'Light Blue', 'Sport Grey'];
          return variants.filter(v => 
            topColors.some(color => v.title.includes(color))
          ).slice(0, 50);
        },
      },
      {
        dbId: '6d9b4b4b-34ba-4990-b8a7-b165db4e8541', // Mug
        blueprintId: 425,
        title: 'Mug 15oz',
        variantFilter: (variants: any[]) => variants.filter(v => v.title.includes('White')),
      },
      {
        dbId: 'e4332daa-23bc-4cef-9e35-36077b1e7ea5', // Greeting Cards
        blueprintId: 962,
        title: 'Greeting Cards',
        variantFilter: (variants: any[]) => variants, // All variants
      },
    ];

    const results = [];

    for (const productConfig of productsToCreate) {
      console.log(`Processing ${productConfig.title}...`);

      // Fetch blueprint details
      const blueprintResponse = await fetch(
        `https://api.printify.com/v1/catalog/blueprints/${productConfig.blueprintId}.json`,
        {
          headers: {
            'Authorization': `Bearer ${printifyApiToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!blueprintResponse.ok) {
        console.error(`Failed to fetch blueprint ${productConfig.blueprintId}`);
        continue;
      }

      const blueprint = await blueprintResponse.json();

      // Fetch available print providers for this blueprint and pick the first one
      const providersResponse = await fetch(
        `https://api.printify.com/v1/catalog/blueprints/${productConfig.blueprintId}/print_providers.json`,
        {
          headers: {
            'Authorization': `Bearer ${printifyApiToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!providersResponse.ok) {
        const errorText = await providersResponse.text();
        console.error(`Failed to fetch print providers for ${productConfig.title}:`, errorText);
        results.push({
          title: productConfig.title,
          success: false,
          error: `Failed to fetch print providers: ${errorText}`,
        });
        continue;
      }

      const providers = await providersResponse.json();
      const selectedProvider = Array.isArray(providers) && providers.length > 0 ? providers[0] : null;

      if (!selectedProvider) {
        console.error(`No print providers found for ${productConfig.title}`);
        results.push({
          title: productConfig.title,
          success: false,
          error: 'No print providers found for this blueprint',
        });
        continue;
      }

      const printProviderId = selectedProvider.id;

      // Fetch variants for the selected print provider
      const variantsResponse = await fetch(
        `https://api.printify.com/v1/catalog/blueprints/${productConfig.blueprintId}/print_providers/${printProviderId}/variants.json`,
        {
          headers: {
            'Authorization': `Bearer ${printifyApiToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!variantsResponse.ok) {
        const status = variantsResponse.status;
        const statusText = variantsResponse.statusText;
        const errorText = await variantsResponse.text();
        console.error(`Failed to fetch variants for ${productConfig.title} (status ${status} ${statusText})`, errorText);
        results.push({
          title: productConfig.title,
          success: false,
          error: `Failed to fetch variants: status ${status} ${statusText} - ${errorText}`,
        });
        continue;
      }

      const allVariants = await variantsResponse.json();
      const selectedVariants = productConfig.variantFilter(allVariants.variants || []);

      if (!selectedVariants.length) {
        console.error(`No variants matched filter for ${productConfig.title}`);
        results.push({
          title: productConfig.title,
          success: false,
          error: 'No variants matched the configured filter',
        });
        continue;
      }

      console.log(`Selected ${selectedVariants.length} variants for ${productConfig.title}`);

      // Create product in Printify
      const createProductPayload = {
        title: productConfig.title,
        description: `Custom ${productConfig.title}`,
        blueprint_id: productConfig.blueprintId,
        print_provider_id: printProviderId,
        variants: selectedVariants.map((variant: any) => ({
          id: variant.id,
          price: Math.round(variant.cost * 2.5), // 2.5x markup in cents
          is_enabled: true,
        })),
        print_areas: [
          {
            variant_ids: selectedVariants.map((v: any) => v.id),
            placeholders: [
              {
                position: 'front',
                images: [
                  {
                    id: 'front-placeholder',
                    x: 0.5,
                    y: 0.5,
                    scale: 1,
                    angle: 0,
                  },
                ],
              },
            ],
          },
        ],
      };

      const createResponse = await fetch(
        `https://api.printify.com/v1/shops/${shopId}/products.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${printifyApiToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(createProductPayload),
        }
      );

      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        console.error(`Failed to create ${productConfig.title}:`, errorText);
        results.push({
          title: productConfig.title,
          success: false,
          error: errorText,
        });
        continue;
      }

      const createdProduct = await createResponse.json();
      console.log(`Created Printify product for ${productConfig.title}:`, createdProduct.id);

      // Update database
      const { error: updateError } = await supabase
        .from('products')
        .update({
          printify_product_id: createdProduct.id,
          variants: selectedVariants,
          images: createdProduct.images || [],
        })
        .eq('id', productConfig.dbId);

      if (updateError) {
        console.error(`Failed to update DB for ${productConfig.title}:`, updateError);
        results.push({
          title: productConfig.title,
          success: false,
          error: updateError.message,
        });
      } else {
        results.push({
          title: productConfig.title,
          success: true,
          printifyProductId: createdProduct.id,
          variantCount: selectedVariants.length,
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in create-bulk-printify-products:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
