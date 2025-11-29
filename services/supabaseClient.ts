import { createClient } from '@supabase/supabase-js';

// Vercel/Vite uses import.meta.env for environment variables
// Casting to any to avoid "Property 'env' does not exist on type 'ImportMeta'" TS error
const SUPABASE_URL = (import.meta as any).env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Supabase Keys are missing!");
}

export const supabase = createClient(
  SUPABASE_URL || '', 
  SUPABASE_ANON_KEY || ''
);