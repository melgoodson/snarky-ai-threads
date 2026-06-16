import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse .env manually
const envContent = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let key = match[1];
    let val = match[2] || '';
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.substring(1, val.length - 1);
    }
    env[key] = val;
  }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_PUBLISHABLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const getProductType = (title) => {
  const lower = title.toLowerCase();
  if (lower.includes('hoodie') || lower.includes('sweatshirt')) return 'hoodie';
  if (lower.includes('tee') || lower.includes('shirt')) return 'tee';
  if (lower.includes('mug')) return 'mug';
  if (lower.includes('tote') || lower.includes('bag')) return 'tote';
  if (lower.includes('card') || lower.includes('greeting')) return 'card';
  if (lower.includes('blanket')) return 'unknown'; // HIDDEN: investigating print quality
  if (lower.includes('notebook') || lower.includes('journal')) return 'notebook';
  return 'unknown';
};

async function test() {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("category", { ascending: true });

    if (error) throw error;

    console.log(`Raw active products in DB: ${data.length}`);

    const allProducts = (data || []).map((p) => ({
      id: p.id,
      title: p.title,
      printify_product_id: p.printify_product_id,
      brand: p.brand || "",
      model: p.model || "",
      category: p.category || "",
      description: p.description || "",
      images: Array.isArray(p.images) ? p.images.map((img) => typeof img === 'string' ? img : img.src || img.url || String(img)) : [],
      template_image_url: p.template_image_url || "",
      price: Number(p.price) || 0,
      retail_price: Number(p.retail_price) || Number(p.price) || 0,
      variants: Array.isArray(p.variants) ? p.variants.map((v) => ({
        id: v.id,
        title: v.title || '',
        is_enabled: true,
        price: v.price || 0,
        cost: v.cost || 0,
      })) : [],
    }));

    console.log(`Mapped products: ${allProducts.length}`);
    allProducts.forEach(p => {
      console.log(`- Title: "${p.title}" | Category: "${p.category}" | Type: "${getProductType(p.title)}" | Variants: ${p.variants.length}`);
    });

    const seenTypes = new Set();
    const baseProducts = [];

    const sorted = [...allProducts].sort((a, b) => {
      const aLower = a.title.toLowerCase();
      const bLower = b.title.toLowerCase();
      const aIsBase = !aLower.includes('placeholder') && !aLower.startsWith('custom ');
      const bIsBase = !bLower.includes('placeholder') && !bLower.startsWith('custom ');
      if (aIsBase && !bIsBase) return -1;
      if (!aIsBase && bIsBase) return 1;
      return a.title.length - b.title.length;
    });

    for (const p of sorted) {
      const type = getProductType(p.title);
      if (type !== 'unknown' && !seenTypes.has(type)) {
        seenTypes.add(type);
        baseProducts.push(p);
      }
    }

    console.log(`Base products (seen types: ${Array.from(seenTypes).join(', ')}): ${baseProducts.length}`);
    baseProducts.forEach(p => {
      console.log(`  * Base Product: "${p.title}"`);
    });

  } catch (err) {
    console.error('Error:', err);
  }
}

test();
