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
    // 1. Fetch the hoodie product
    const { data: product, error: prodError } = await supabase
      .from('products')
      .select('*')
      .eq('id', '087e6cb2-5bc6-4e32-a3c6-8a58691c1bca')
      .single();

    if (prodError || !product) {
      console.error('Failed to fetch product:', prodError);
      return;
    }

    console.log('Fetched product:', product.title);

    // Find variant for Purple / L or any available variant
    const variant = product.variants.find(v => v.title.toLowerCase().includes('purple') && v.title.toLowerCase().includes('l')) 
      || product.variants[0];

    console.log('Selected variant:', variant);

    // Dummy base64 1x1 PNG image
    const dummyBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

    const payload = {
      designImageUrl: dummyBase64,
      baseProductId: product.id,
      variantId: variant.id,
      customTitle: `Test Custom Hoodie`,
      productColor: 'Purple'
    };

    console.log('Invoking function with payload:', {
      ...payload,
      designImageUrl: payload.designImageUrl.substring(0, 50) + '...'
    });

    const response = await fetch(`${supabaseUrl}/functions/v1/create-custom-printify-product`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify(payload)
    });

    console.log('Response Status:', response.status);
    console.log('Response Headers:', Object.fromEntries(response.headers.entries()));

    const text = await response.text();
    console.log('Response Body:', text);
  } catch (err) {
    console.error('Error invoking function:', err);
  }
}

run();
