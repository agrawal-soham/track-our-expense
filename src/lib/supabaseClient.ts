import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bkgfhyrwzjgzvmufaggq.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_O4-Jx-B2RMXybI5JirNinQ_94qQW_Hq';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
