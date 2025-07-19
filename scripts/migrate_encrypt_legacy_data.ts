import { createClient } from '@supabase/supabase-js';
import { encryptAES } from '../src/utils/encryption';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
const dryRun = process.argv.includes('--dry-run');

async function main() {
  if (!supabaseUrl || !supabaseAnonKey) throw new Error('Set SUPABASE_URL and SUPABASE_ANON_KEY env vars');
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  // 1. Fetch AES key
  const { data: settings } = await supabase.from('settings').select('x_secret').single();
  if (!settings || !settings.x_secret) throw new Error('No encryption key found in settings.x_secret');
  const key = settings.x_secret;

  // 2. Migrate profiles table
  const { data: profiles } = await supabase.from('profiles').select('*');
  if (!profiles) {
    console.log('No profiles found.');
    return;
  }
  for (const profile of profiles) {
    const updates: any = {};
    for (const field of ['phone', 'companyName', 'companyDescription', 'companyPhone', 'companyAddress', 'companyWebsite']) {
      const value = profile[field];
      if (value && typeof value === 'string' && !value.includes(':')) {
        updates[field] = await encryptAES(value, key);
      }
    }
    if (Object.keys(updates).length > 0) {
      if (dryRun) {
        console.log(`[DRY RUN] Would update profile ${profile.id}:`, updates);
      } else {
        await supabase.from('profiles').update(updates).eq('id', profile.id);
        console.log(`Updated profile ${profile.id}`);
      }
    }
  }
  // Repeat for jobs, etc. as needed
  console.log('Migration complete.');
}

main().catch(e => { console.error(e); process.exit(1); }); 