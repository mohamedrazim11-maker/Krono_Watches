import { createClient, SupabaseClient } from '@supabase/supabase-js';

const isLocalDb = process.env.USE_LOCAL_DB === 'true';
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabase: SupabaseClient | null =
  !isLocalDb && supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false },
      })
    : null;
