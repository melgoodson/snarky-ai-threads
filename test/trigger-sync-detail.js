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
  console.log('Invoking sync-printify-products...');
  try {
    const { data, error } = await supabase.functions.invoke('sync-printify-products');
    if (error) {
      console.error('Error returned from invoke:', error);
      if (error.context) {
        const text = await error.context.text();
        console.error('Response body text:', text);
      }
      return;
    }
    console.log('Result:', data);
  } catch (err) {
    console.error('Thrown error:', err);
  }
}

run();
