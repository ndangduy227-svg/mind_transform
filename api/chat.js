import { createClient } from '@supabase/supabase-js';
import { createChatHandler } from '../server/chat.js';

let client;
export default createChatHandler({
    getSupabase: () => {
        if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error('missing_server_configuration');
        client ??= createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
            auth: { persistSession: false, autoRefreshToken: false },
            global: { fetch: (url, options) => fetch(url, { ...options, signal: AbortSignal.timeout(10000) }) },
        });
        return client;
    },
});
