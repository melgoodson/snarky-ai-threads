import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

async function restoreSchedule() {
  const { error: authError } = await supabase.auth.signInWithPassword({
    email: 'teamsienvi@gmail.com',
    password: 'SnarkyAdmin2026!'
  });
  if (authError) throw authError;

  const originalDesignIds = [
    '06f3fc3f-bb59-46b5-b603-44c31150d707',
    'd036dfc5-6d3c-423f-bfee-1012b8c25ac8',
    '446fe0b3-b4d3-4f8d-a795-cb97387c19d8',
    '8817bdc3-4029-4e4d-96e9-575bf12887be',
    '4699aa27-6f14-4c9a-8456-6f1a6b445104'
  ];

  const currentMonth = new Date().getMonth();
  const { data, error } = await supabase
    .from('featured_schedules')
    .update({
      design_ids: originalDesignIds,
      updated_at: new Date().toISOString()
    })
    .eq('month', currentMonth)
    .select();

  if (error) {
    console.error("Error restoring:", error);
  } else {
    console.log("✅ Successfully restored August featured schedule with 5 Q3 event designs:", data[0].design_ids);
  }
}

restoreSchedule().catch(console.error);
