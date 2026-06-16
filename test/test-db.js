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

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .limit(5);

    if (error) {
      console.error('Error fetching products:', error);
      return;
    }

    console.log(`Fetched ${products.length} products:`);
    products.forEach(p => {
      console.log(`Product: ${p.title} (ID: ${p.id})`);
      console.log(`  Printify Product ID: ${p.printify_product_id}`);
      console.log(`  Variants (count: ${p.variants ? p.variants.length : 0}):`);
      if (p.variants && p.variants.length > 0) {
        console.log(`    First Variant:`, p.variants[0]);
      }
    });
  } catch (err) {
    console.error('Execution error:', err);
  }
}

run();
