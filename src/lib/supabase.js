import { createClient } from '@supabase/supabase-js';

export const isSupabaseConfigured = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { fetch: (url, options) => {
        if (!isSupabaseConfigured) return Promise.reject(new Error('Dịch vụ chưa được cấu hình.'));
        return fetch(url, { ...options, signal: options?.signal || AbortSignal.timeout(15000) });
    } },
});
