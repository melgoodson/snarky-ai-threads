import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = "https://birjqwhhleqtirwkzcwl.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  try {
    const { data, error } = await supabase
      .from('email_subscribers')
      .select('email, source, status, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching subscribers:', error);
      return;
    }

    const emailList = data.map(sub => sub.email).join('\n');
    const outputPath = path.join(__dirname, '..', 'subscribers_list.txt');
    fs.writeFileSync(outputPath, emailList, 'utf8');

    console.log(`SUMMARY: Total subscribers: ${data.length}`);
    console.log(`All emails written to: ${outputPath}`);
  } catch (err) {
    console.error('Execution error:', err);
  }
}

run();
