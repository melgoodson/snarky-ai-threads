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
    const { data: images, error } = await supabase
      .from('ai_generated_images')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching images:', error);
      return;
    }

    console.log(`Fetched ${images.length} images:`);
    images.forEach(img => {
      console.log(`ID: ${img.id}`);
      console.log(`  User ID: ${img.user_id}`);
      console.log(`  Prompt: ${img.prompt_text}`);
      console.log(`  URL: ${img.image_url.substring(0, 100)}...`);
    });
  } catch (err) {
    console.error('Execution error:', err);
  }
}

run();
