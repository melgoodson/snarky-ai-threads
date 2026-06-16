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

async function run() {
  try {
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', '087e6cb2-5bc6-4e32-a3c6-8a58691c1bca')
      .single();

    if (error || !product) {
      console.error('Error:', error);
      return;
    }

    console.log(`Product: ${product.title}`);
    console.log('All Variant Titles:');
    product.variants.forEach((v, index) => {
      console.log(`  [${index}] ID: ${v.id} | Title: "${v.title}" | Enabled: ${v.is_enabled}`);
    });
  } catch (err) {
    console.error('Execution error:', err);
  }
}

run();
