import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Access Supabase credentials from Vite environment variables
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() || 'https://urcxbufxcebfgrsfvmsj.supabase.co';
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() || '';

let supabaseClient: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey && supabaseAnonKey !== 'your-anon-key-here') {
    try {
        supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
                detectSessionInUrl: false
            }
        });
    } catch (err) {
        console.warn('[Supabase] Client initialization notice:', err);
        supabaseClient = null;
    }
}

export function getSupabase(): SupabaseClient | null {
    return supabaseClient;
}

export function isSupabaseConfigured(): boolean {
    return supabaseClient !== null;
}
