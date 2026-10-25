import React, { useEffect, useState, useSyncExternalStore } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Loader2, Home } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { login } from '../../services/cmsAdminService';
import { supabase } from '../../lib/supabase';
import { passwordRecovery } from '../../services/passwordRecovery';
import { RECOVERY_ERROR } from '../../utils/authRecovery';

const inputClass = 'w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500';
const buttonClass = 'w-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-medium py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';
const linkClass = 'text-sm text-teal-400 hover:text-teal-300 disabled:opacity-50';

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmation, setConfirmation] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState('login');
    const { status } = useSyncExternalStore(passwordRecovery.subscribe, passwordRecovery.getSnapshot);
    const navigate = useNavigate();
    const currentMode = status === 'active' ? 'reset' : status === 'pending' ? 'pending' : mode;
    useEffect(() => {
        if (status === 'active') { setPassword(''); setConfirmation(''); setError(''); }
    }, [status]);

    const changeMode = next => {
        passwordRecovery.clear();
        setMode(next); setError(''); setPassword(''); setConfirmation('');
    };

    const handleSubmit = async event => {
        event.preventDefault();
        setError('');
        if (currentMode === 'reset' && (password.length < 8 || password !== confirmation)) {
            setError(password.length < 8 ? 'Mật khẩu cần ít nhất 8 ký tự.' : 'Hai mật khẩu chưa khớp.');
            return;
        }
        setLoading(true);
        try {
            if (currentMode === 'forgot') {
                const { error: sendError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
                    redirectTo: `${window.location.origin}/admin/login`,
                });
                if (sendError) throw sendError;
                setMode('sent');
            } else if (currentMode === 'reset') {
                const { error: updateError } = await supabase.auth.updateUser({ password });
                if (updateError) {
                    if (['weak_password', 'same_password'].includes(updateError.code)) {
                        setError(updateError.code === 'same_password' ? 'Hãy chọn mật khẩu khác mật khẩu cũ.' : 'Mật khẩu chưa đạt yêu cầu bảo mật. Hãy dùng mật khẩu dài hơn, có chữ hoa, chữ thường, số và ký tự đặc biệt.');
                        return;
                    }
                    if ([401, 403].includes(updateError.status) || ['session_not_found', 'refresh_token_not_found'].includes(updateError.code)) {
                        changeMode('forgot'); setError(RECOVERY_ERROR);
                        return;
                    }
                    throw updateError;
                }
                setPassword(''); setConfirmation('');
                passwordRecovery.clear();
                setMode('done');
            } else {
                const result = await login(email.trim(), password);
                if (result.success) { setPassword(''); navigate('/admin'); }
                else setError(result.message || 'Đăng nhập thất bại.');
            }
        } catch {
            setError(currentMode === 'forgot' ? 'Không thể gửi yêu cầu. Vui lòng thử lại sau.'
                : currentMode === 'reset' ? 'Chưa đổi được mật khẩu. Kiểm tra kết nối rồi thử lại.'
                    : 'Không thể kết nối để đăng nhập. Vui lòng thử lại.');
        } finally { setLoading(false); }
    };

    const cancelRecovery = async () => {
        setLoading(true); setError('');
        try {
            const { error: signOutError } = await supabase.auth.signOut({ scope: 'local' });
            if (signOutError) throw signOutError;
            changeMode('login');
        } catch { setError('Chưa kết thúc được phiên khôi phục. Vui lòng thử lại.'); }
        finally { setLoading(false); }
    };

    const title = { login: 'Quản trị CMS', forgot: 'Quên mật khẩu', sent: 'Kiểm tra email', reset: 'Đặt mật khẩu mới', pending: 'Đang kiểm tra link', done: 'Đã đổi mật khẩu' }[currentMode];
    const description = {
        login: 'Đăng nhập bằng tài khoản được cấp để truy cập hệ thống.',
        forgot: 'Nhập email đã đăng ký để nhận link đặt lại mật khẩu.',
        sent: `Nếu ${email.trim()} có tài khoản, bạn sẽ nhận được email khôi phục. Kiểm tra cả thư mục Spam.`,
        reset: 'Nhập mật khẩu mới có ít nhất 8 ký tự và xác nhận lại.',
        pending: 'Vui lòng đợi trong khi xác minh phiên khôi phục.',
        done: 'Mật khẩu mới đã được lưu. Bạn có thể vào trang quản trị.',
    }[currentMode];
    const displayError = error || (status === 'invalid' ? RECOVERY_ERROR : '');

    return <>
        <Helmet><title>{title} | Mind.Transform</title><meta name="robots" content="noindex, nofollow" /><meta name="referrer" content="no-referrer" /></Helmet>
        <main className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-4">
            {currentMode !== 'reset' && currentMode !== 'pending' && <button type="button" onClick={() => { changeMode('login'); navigate('/'); }} className="mb-8 flex items-center gap-2 text-slate-400 hover:text-teal-400"><Home className="w-5 h-5" /> Về trang chủ</button>}
            <section aria-labelledby="auth-title" className="w-full max-w-md bg-white/[0.03] border border-white/10 rounded-2xl p-8 shadow-2xl">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-teal-500/10 rounded-full grid place-items-center mb-4"><Lock className="w-8 h-8 text-teal-400" /></div>
                    <h1 id="auth-title" className="text-2xl font-bold text-white text-center">{title}</h1>
                    <p className="text-slate-400 text-sm mt-2 text-center">{description}</p>
                </div>
                {displayError && <p role="alert" className="text-red-400 text-sm mb-4">{displayError}</p>}
                {currentMode === 'pending' && <p role="status" className="text-slate-300 text-center">Đang xác minh…</p>}
                {['login', 'forgot', 'reset'].includes(currentMode) && <form onSubmit={handleSubmit} className="space-y-4" aria-busy={loading}>
                    {currentMode !== 'reset' && <div>
                        <label htmlFor="admin-email" className="block text-xs font-medium text-slate-400 mb-1">Email</label>
                        <input id="admin-email" type="email" autoComplete="username" value={email} onChange={event => setEmail(event.target.value)} className={inputClass} required disabled={loading} />
                    </div>}
                    {currentMode !== 'forgot' && <div>
                        <label htmlFor="admin-password" className="block text-xs font-medium text-slate-400 mb-1">{currentMode === 'reset' ? 'Mật khẩu mới' : 'Mật khẩu'}</label>
                        <input id="admin-password" type="password" autoComplete={currentMode === 'reset' ? 'new-password' : 'current-password'} minLength={currentMode === 'reset' ? 8 : undefined} value={password} onChange={event => setPassword(event.target.value)} className={inputClass} required disabled={loading} />
                    </div>}
                    {currentMode === 'reset' && <div>
                        <label htmlFor="admin-confirmation" className="block text-xs font-medium text-slate-400 mb-1">Xác nhận mật khẩu mới</label>
                        <input id="admin-confirmation" type="password" autoComplete="new-password" minLength={8} value={confirmation} onChange={event => setConfirmation(event.target.value)} className={inputClass} required disabled={loading} />
                    </div>}
                    <button type="submit" disabled={loading} className={buttonClass}>
                        {loading && <Loader2 aria-hidden="true" className="w-5 h-5 animate-spin" />}
                        {currentMode === 'forgot' ? 'Gửi link đặt lại mật khẩu' : currentMode === 'reset' ? 'Lưu mật khẩu mới' : 'Đăng nhập'}
                    </button>
                </form>}
                <div className="mt-6 flex flex-col items-center gap-4">
                    {currentMode === 'login' && <button type="button" disabled={loading} onClick={() => changeMode('forgot')} className={linkClass}>Quên mật khẩu?</button>}
                    {['forgot', 'sent'].includes(currentMode) && <button type="button" disabled={loading} onClick={() => changeMode('login')} className={linkClass}>Quay lại đăng nhập</button>}
                    {currentMode === 'sent' && <button type="button" onClick={() => changeMode('forgot')} className={linkClass}>Dùng email khác hoặc gửi lại</button>}
                    {currentMode === 'reset' && <button type="button" disabled={loading} onClick={cancelRecovery} className={linkClass}>Hủy đặt lại mật khẩu</button>}
                    {currentMode === 'done' && <button type="button" onClick={() => navigate('/admin')} className={buttonClass}>Vào CMS</button>}
                </div>
            </section>
        </main>
    </>;
}
