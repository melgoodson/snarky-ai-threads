import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BASE_URL = 'https://www.snarkyazzhumans.com';

const HARDCODED_PRODUCTS = [
  "personalization-blanket",
  "rbf-champion",
  "snarky-humans",
  "free-hugs",
  "abduct-me",
  "sasquatches",
  "white-idol-morning",
  "fathers",
  "dark"
];

const STATIC_ROUTES = [
  "/",
  "/collections",
  "/designs",
  "/shirts",
  "/hoodies",
  "/blankets",
  "/tote-bags",
  "/mugs",
  "/greeting-cards",
  "/new-arrivals",
  "/custom-design",
  "/blog",
  "/faq",
  "/about",
  "/contact",
  "/shipping",
  "/returns",
  "/privacy",
  "/terms"
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Fetch dynamic designs
    const { data: designs } = await supabaseClient
      .from("designs")
      .select("id");

    // Fetch dynamic blog posts
    const { data: blogPosts } = await supabaseClient
      .from("blog_posts")
      .select("slug")
      .eq("status", "published");

    const urls: string[] = [];

    // Add static routes
    for (const route of STATIC_ROUTES) {
      urls.push(`
  <url>
    <loc>${BASE_URL}${route}</loc>
    <changefreq>${route === '/' || route === '/collections' ? 'daily' : 'weekly'}</changefreq>
    <priority>${route === '/' ? '1.0' : route === '/collections' ? '0.9' : '0.8'}</priority>
  </url>`);
    }

    // Add SEO Category routes
    const SEO_CATEGORIES = [
      "funny-gifts",
      "gag-gifts",
      "white-elephant-gifts",
      "funny-coworker-gifts",
      "funny-gifts-under-25",
      "funny-gifts-under-50"
    ];

    for (const cat of SEO_CATEGORIES) {
      urls.push(`
  <url>
    <loc>${BASE_URL}/category/${cat}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`);
    }

    // Add hardcoded products
    for (const productSlug of HARDCODED_PRODUCTS) {
      urls.push(`
  <url>
    <loc>${BASE_URL}/product/${productSlug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`);
    }

    // Add dynamic designs
    if (designs) {
      for (const design of designs) {
        urls.push(`
  <url>
    <loc>${BASE_URL}/designs/${design.id}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`);
      }
    }

    // Add dynamic blog posts
    if (blogPosts) {
      for (const post of blogPosts) {
        urls.push(`
  <url>
    <loc>${BASE_URL}/blog/${post.slug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`);
      }
    }

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("")}
</urlset>`;

    return new Response(sitemap, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });

  } catch (error) {
    console.error('Error serving sitemap:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});
