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
    const dummyBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

    const payload = {
      designImageUrl: dummyBase64,
      baseProductId: '087e6cb2-5bc6-4e32-a3c6-8a58691c1bca',
      variantId: 9999999, // Mismatched donor variant ID
      customTitle: `Test Donor Mismatch Hoodie`,
      productColor: 'Purple'
    };

    console.log('Invoking function with mismatched variantId...');

    const response = await fetch(`${supabaseUrl}/functions/v1/create-custom-printify-product`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify(payload)
    });

    console.log('Response Status:', response.status);
    const text = await response.text();
    console.log('Response Body:', text);
  } catch (err) {
    console.error('Error invoking function:', err);
  }
}

run();
