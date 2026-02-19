import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@18.5.0";

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
        const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

        if (!printifyApiToken) throw new Error('PRINTIFY_API_TOKEN not configured');
        if (!stripeSecretKey) throw new Error('STRIPE_SECRET_KEY not configured');

        const supabase = createClient(supabaseUrl, supabaseKey);
        const stripe = new Stripe(stripeSecretKey, { apiVersion: "2025-08-27.basil" });

        const BLUEPRINT_ID = 522; // Velveteen Plush Blanket
        const RETAIL_PRICE_CENTS = 4999; // $49.99

        console.log('=== STEP 1: Get Printify shop ID ===');
        const shopsRes = await fetch('https://api.printify.com/v1/shops.json', {
            headers: { 'Authorization': `Bearer ${printifyApiToken}` },
        });
        const shops = await shopsRes.json();
        const shopId = shops[0]?.id;
        if (!shopId) throw new Error('No Printify shop found');
        console.log('Shop ID:', shopId);

        console.log('=== STEP 2: Get print providers for blueprint 522 ===');
        const providersRes = await fetch(
            `https://api.printify.com/v1/catalog/blueprints/${BLUEPRINT_ID}/print_providers.json`,
            { headers: { 'Authorization': `Bearer ${printifyApiToken}` } }
        );
        if (!providersRes.ok) throw new Error('Failed to fetch print providers');
        const providers = await providersRes.json();
        console.log(`Found ${providers.length} print providers`);

        // Pick the first available provider
        const provider = providers[0];
        if (!provider) throw new Error('No print providers available for this blueprint');
        console.log('Using provider:', provider.id, provider.title);

        console.log('=== STEP 3: Get variants for this provider ===');
        const variantsRes = await fetch(
            `https://api.printify.com/v1/catalog/blueprints/${BLUEPRINT_ID}/print_providers/${provider.id}/variants.json`,
            { headers: { 'Authorization': `Bearer ${printifyApiToken}` } }
        );
        if (!variantsRes.ok) throw new Error('Failed to fetch variants');
        const variantsData = await variantsRes.json();
        const variants = variantsData.variants || [];
        console.log(`Found ${variants.length} variants:`, variants.map((v: any) => `${v.id}: ${v.title}`));

        if (variants.length === 0) throw new Error('No variants available');

        console.log('=== STEP 4: Get print area info ===');
        const printAreasRes = await fetch(
            `https://api.printify.com/v1/catalog/blueprints/${BLUEPRINT_ID}/print_providers/${provider.id}/shipping.json`,
            { headers: { 'Authorization': `Bearer ${printifyApiToken}` } }
        );

        console.log('=== STEP 5: Create product in Printify ===');
        const productPayload = {
            title: "Personalization Blanket – Custom Photo Blanket",
            description: "Upload your favorite photos to create a one-of-a-kind custom velveteen plush blanket. Ultra-soft, vibrant print, machine washable. The perfect personalized gift.",
            blueprint_id: BLUEPRINT_ID,
            print_provider_id: provider.id,
            variants: variants.map((v: any) => ({
                id: v.id,
                price: RETAIL_PRICE_CENTS,
                is_enabled: true,
            })),
            print_areas: [
                {
                    variant_ids: variants.map((v: any) => v.id),
                    placeholders: [
                        {
                            position: "front",
                            images: [
                                {
                                    id: "placeholder",  // Will use default/placeholder
                                    x: 0,
                                    y: 0,
                                    scale: 1,
                                    angle: 0,
                                },
                            ],
                        },
                    ],
                },
            ],
        };

        console.log('Creating product with payload:', JSON.stringify(productPayload, null, 2));

        const createRes = await fetch(
            `https://api.printify.com/v1/shops/${shopId}/products.json`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${printifyApiToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(productPayload),
            }
        );

        if (!createRes.ok) {
            const errText = await createRes.text();
            console.error('Printify create error:', errText);

            // If print_areas fails, try without them (simpler approach)
            console.log('Retrying without print_areas...');
            const simplePayload = {
                title: "Personalization Blanket – Custom Photo Blanket",
                description: "Upload your favorite photos to create a one-of-a-kind custom velveteen plush blanket. Ultra-soft, vibrant print, machine washable. The perfect personalized gift.",
                blueprint_id: BLUEPRINT_ID,
                print_provider_id: provider.id,
                variants: variants.map((v: any) => ({
                    id: v.id,
                    price: RETAIL_PRICE_CENTS,
                    is_enabled: true,
                })),
            };

            const retryRes = await fetch(
                `https://api.printify.com/v1/shops/${shopId}/products.json`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${printifyApiToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(simplePayload),
                }
            );

            if (!retryRes.ok) {
                const retryErr = await retryRes.text();
                throw new Error(`Failed to create Printify product: ${retryErr}`);
            }

            var printifyProduct = await retryRes.json();
        } else {
            var printifyProduct = await createRes.json();
        }

        console.log('Printify product created! ID:', printifyProduct.id);

        console.log('=== STEP 6: Create Stripe price ===');
        const stripeProduct = await stripe.products.create({
            name: "Personalization Blanket – Custom Photo Blanket",
            description: "Custom velveteen plush blanket with your photos",
            metadata: {
                printify_product_id: printifyProduct.id,
                blueprint_id: String(BLUEPRINT_ID),
            },
        });

        const stripePrice = await stripe.prices.create({
            product: stripeProduct.id,
            unit_amount: RETAIL_PRICE_CENTS,
            currency: 'usd',
        });

        console.log('Stripe product created:', stripeProduct.id);
        console.log('Stripe price created:', stripePrice.id);

        console.log('=== STEP 7: Save to Supabase products table ===');
        const dbProduct = {
            printify_product_id: printifyProduct.id,
            printify_blueprint_id: String(BLUEPRINT_ID),
            title: printifyProduct.title || "Personalization Blanket – Custom Photo Blanket",
            description: "Custom velveteen plush blanket with your photos. Upload your favorite memories.",
            price: RETAIL_PRICE_CENTS / 100,
            retail_price: RETAIL_PRICE_CENTS / 100,
            category: "Personalized Gifts",
            images: printifyProduct.images?.map((img: any) => img.src) || [],
            variants: printifyProduct.variants || variants.map((v: any) => ({
                id: v.id,
                title: v.title,
                is_enabled: true,
                price: RETAIL_PRICE_CENTS,
                cost: v.cost || 0,
            })),
            is_active: true,
        };

        const { data: savedProduct, error: dbError } = await supabase
            .from('products')
            .upsert(dbProduct, { onConflict: 'printify_product_id' })
            .select()
            .single();

        if (dbError) {
            console.error('DB error (non-fatal):', dbError);
        } else {
            console.log('Saved to database:', savedProduct.id);
        }

        console.log('=== ALL DONE ===');

        return new Response(
            JSON.stringify({
                success: true,
                printify_product_id: printifyProduct.id,
                stripe_price_id: stripePrice.id,
                stripe_product_id: stripeProduct.id,
                supabase_product_id: savedProduct?.id || null,
                variants: printifyProduct.variants?.map((v: any) => ({
                    id: v.id,
                    title: v.title,
                    price: v.price,
                })) || [],
                message: 'Blanket product created in Printify, Stripe price created, and saved to database!',
                next_steps: [
                    `Update create-checkout PRODUCT_PRICES with blanket: "${stripePrice.id}"`,
                    `Update ProductDetail.tsx PRINTIFY_PRODUCT_IDS with blanket: "${printifyProduct.id}"`,
                ],
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error in setup-blanket-product:', error);
        return new Response(
            JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
            {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        );
    }
});
