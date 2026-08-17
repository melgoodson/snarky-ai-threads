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

async function testAdminFeaturedSchedule() {
  console.log("1. Authenticating as admin: teamsienvi@gmail.com ...");
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'teamsienvi@gmail.com',
    password: 'SnarkyAdmin2026!'
  });

  if (authError) {
    console.error("❌ Authentication failed:", authError.message);
    return;
  }

  console.log("✅ Authenticated successfully! User ID:", authData.user.id);

  console.log("\n2. Querying designs table...");
  const { data: designs, error: designsErr } = await supabase
    .from('designs')
    .select('id, title, image_url, is_active')
    .limit(10);

  if (designsErr) {
    console.error("❌ Error querying designs:", designsErr.message);
    return;
  }
  
  console.log(`✅ Retrieved ${designs.length} designs.`);
  designs.slice(0, 5).forEach(d => console.log(`   - [${d.id}] "${d.title}"`));

  const currentMonth = new Date().getMonth(); // 7 for August
  console.log(`\n3. Fetching existing schedule for Month ${currentMonth}...`);
  const { data: existingSchedule, error: fetchErr } = await supabase
    .from('featured_schedules')
    .select('*')
    .eq('month', currentMonth)
    .maybeSingle();

  if (fetchErr) {
    console.error("❌ Error fetching schedule:", fetchErr.message);
    return;
  }

  console.log("✅ Existing schedule found with design_ids count:", existingSchedule?.design_ids?.length);

  // Preserve existing design IDs or add test ID
  const testDesignIds = designs.slice(0, 5).map(d => d.id);
  console.log("\n4. Updating featured_schedules with 5 design IDs:", testDesignIds);

  const { data: updateData, error: updateErr } = await supabase
    .from('featured_schedules')
    .update({
      design_ids: testDesignIds,
      updated_at: new Date().toISOString()
    })
    .eq('month', currentMonth)
    .select();

  if (updateErr) {
    console.error("❌ Update failed:", updateErr.message);
  } else {
    console.log("✅ Update SUCCEEDED! Updated record:", updateData);
  }

  console.log("\n5. Verifying from public anonymous client...");
  const anonClient = createClient(supabaseUrl, supabaseKey);
  const { data: verified, error: verifyErr } = await anonClient
    .from('featured_schedules')
    .select('month, headline, design_ids, updated_at')
    .eq('month', currentMonth)
    .single();

  if (verifyErr) {
    console.error("❌ Verification failed:", verifyErr.message);
  } else {
    console.log("✅ Verified updated featured schedule:", verified);
  }
}

testAdminFeaturedSchedule().catch(console.error);
