import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://rxfoievnsfkodxtcxjsk.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_TUGbC8_VfUm0Caz_m7NKUw_NAFw8ZAB';

const env = import.meta?.env || {};
const rawUrl = (env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL).trim();
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '');
const supabaseAnonKey = (env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY).trim();

// เชื่อมต่อ Supabase Client ทันที
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('your-project-id')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
