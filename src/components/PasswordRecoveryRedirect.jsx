import { useEffect, useSyncExternalStore } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { passwordRecovery } from '../services/passwordRecovery';

export default function PasswordRecoveryRedirect() {
    const { status } = useSyncExternalStore(passwordRecovery.subscribe, passwordRecovery.getSnapshot);
    const { pathname } = useLocation();
    const navigate = useNavigate();
    useEffect(() => {
        if ((status === 'active' || status === 'invalid') && pathname !== '/admin/login') {
            navigate('/admin/login', { replace: true });
        }
    }, [status, pathname, navigate]);
    useEffect(() => {
        if (status !== 'pending') return;
        const timeout = setTimeout(() => passwordRecovery.expirePending(), 20000);
        return () => clearTimeout(timeout);
    }, [status]);
    return null;
}
