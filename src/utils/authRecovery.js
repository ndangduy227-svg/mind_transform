export const RECOVERY_ERROR = 'Link khôi phục không hợp lệ hoặc đã hết hạn. Hãy yêu cầu một link mới.';
const STORAGE_KEY = 'mindtransform.passwordRecovery';

// Capture the event before lazy routes mount. Never persist passwords or URL tokens.
export function createRecoveryTracker({ auth, storage, initialUrl = '' }) {
    let params;
    try {
        const url = new URL(initialUrl);
        params = new URLSearchParams(`${url.search.slice(1)}&${url.hash.slice(1)}`);
    } catch { params = new URLSearchParams(); }
    const invalid = params.has('error') || params.has('error_code');
    let snapshot = { status: invalid ? 'invalid' : params.get('type') === 'recovery' ? 'pending' : 'idle' };
    const listeners = new Set();
    const readMarker = () => { try { return storage?.getItem(STORAGE_KEY); } catch { return null; } };
    const removeMarker = () => { try { storage?.removeItem(STORAGE_KEY); } catch { /* Storage may be disabled. */ } };
    const setStatus = status => {
        if (snapshot.status === status) return;
        snapshot = { status };
        listeners.forEach(listener => listener());
    };
    if (invalid) removeMarker();
    const { data: { subscription } } = auth.onAuthStateChange((event, session) => {
        // Keep this callback synchronous: auth methods can hold the SDK's session lock.
        if (event === 'PASSWORD_RECOVERY' && session?.user?.id) {
            try { storage?.setItem(STORAGE_KEY, session.user.id); } catch { /* In-memory recovery still works. */ }
            setStatus('active');
        } else if (event === 'SIGNED_OUT') {
            removeMarker();
            setStatus(snapshot.status === 'pending' || snapshot.status === 'active' ? 'invalid' : snapshot.status);
        } else if (event === 'INITIAL_SESSION') {
            const marker = readMarker();
            if (marker && marker === session?.user?.id && !invalid) setStatus('active');
            else {
                removeMarker();
                if (!session && snapshot.status === 'pending') setStatus('invalid');
            }
        }
    });
    return {
        getSnapshot: () => snapshot,
        subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
        clear() { removeMarker(); setStatus('idle'); },
        expirePending() { if (snapshot.status === 'pending') setStatus('invalid'); },
        dispose() { subscription.unsubscribe(); listeners.clear(); },
    };
}
