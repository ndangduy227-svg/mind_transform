import { supabase } from '../lib/supabase';
import { createRecoveryTracker } from '../utils/authRecovery';

let storage;
try { storage = window.sessionStorage; } catch { /* Recovery also works without storage. */ }
export const passwordRecovery = createRecoveryTracker({
    auth: supabase.auth,
    storage,
    initialUrl: typeof window === 'undefined' ? '' : window.location.href,
});
