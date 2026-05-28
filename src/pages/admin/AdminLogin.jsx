import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, Loader2, Home, Mail, ArrowLeft } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { login } from '../../services/cmsAdminService';
import { supabase } from '../../lib/supabase';

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState('login'); // 'login' | 'forgot' | 'sent'
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(email, password);

        if (result.success) {
            navigate('/admin');
        } else {
            setError(result.message || 'Đăng nhập thất bại');
        }
        setLoading(false);
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        if (!email) {
            setError('Vui lòng nhập email');
            return;
        }
        setError('');
        setLoading(true);

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/admin/login`,
        });

        if (error) {
            setError('Không thể gửi email. Vui lòng thử lại.');
        } else {
            setMode('sent');
        }
        setLoading(false);
    };

    return (
        <>
            <Helmet>
                <title>Admin Login | Mind.Transform</title>
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>

            <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-4">
                <div className="absolute top-8 left-8">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-slate-400 hover:text-teal-400 transition-colors"
                    >
                        <Home className="w-5 h-5" /> Về trang chủ
                    </button>
                </div>

                <div className="w-full max-w-md bg-white/[0.03] border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-2xl">
                    {mode === 'login' && (
                        <>
                            <div className="flex flex-col items-center mb-8">
                                <div className="w-16 h-16 bg-teal-500/10 rounded-full flex items-center justify-center mb-4 border border-teal-500/20">
                                    <Lock className="w-8 h-8 text-teal-400" />
                                </div>
                                <h1 className="text-2xl font-bold text-white">Quản trị CMS</h1>
                                <p className="text-slate-400 text-sm mt-2 text-center">
                                    Đăng nhập bằng tài khoản được cấp để truy cập hệ thống.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="admin@example.com"
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all placeholder:text-slate-600"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">Mật khẩu</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Nhập mật khẩu..."
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all placeholder:text-slate-600"
                                        required
                                    />
                                </div>

                                {error && (
                                    <p className="text-red-400 text-sm mt-2">{error}</p>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading || !password || !email}
                                    className="w-full bg-teal-500 hover:bg-teal-400 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                                >
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>Đăng nhập <ArrowRight className="w-4 h-4" /></>
                                    )}
                                </button>
                            </form>

                            <div className="mt-6 text-center">
                                <button
                                    onClick={() => { setMode('forgot'); setError(''); }}
                                    className="text-sm text-slate-500 hover:text-teal-400 transition-colors"
                                >
                                    Quên mật khẩu?
                                </button>
                            </div>
                        </>
                    )}

                    {mode === 'forgot' && (
                        <>
                            <div className="flex flex-col items-center mb-8">
                                <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mb-4 border border-amber-500/20">
                                    <Mail className="w-8 h-8 text-amber-400" />
                                </div>
                                <h1 className="text-2xl font-bold text-white">Quên mật khẩu</h1>
                                <p className="text-slate-400 text-sm mt-2 text-center">
                                    Nhập email đã đăng ký, hệ thống sẽ gửi link đặt lại mật khẩu.
                                </p>
                            </div>

                            <form onSubmit={handleForgotPassword} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="admin@example.com"
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all placeholder:text-slate-600"
                                        required
                                    />
                                </div>

                                {error && (
                                    <p className="text-red-400 text-sm mt-2">{error}</p>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading || !email}
                                    className="w-full bg-amber-500 hover:bg-amber-400 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                                >
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>Gửi link đặt lại mật khẩu <Mail className="w-4 h-4" /></>
                                    )}
                                </button>
                            </form>

                            <div className="mt-6 text-center">
                                <button
                                    onClick={() => { setMode('login'); setError(''); }}
                                    className="text-sm text-slate-500 hover:text-teal-400 transition-colors flex items-center gap-1 mx-auto"
                                >
                                    <ArrowLeft className="w-3 h-3" /> Quay lại đăng nhập
                                </button>
                            </div>
                        </>
                    )}

                    {mode === 'sent' && (
                        <div className="flex flex-col items-center py-4">
                            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4 border border-emerald-500/20">
                                <Mail className="w-8 h-8 text-emerald-400" />
                            </div>
                            <h1 className="text-2xl font-bold text-white mb-3">Đã gửi email!</h1>
                            <p className="text-slate-400 text-sm text-center mb-2">
                                Kiểm tra hộp thư <strong className="text-white">{email}</strong> để lấy link đặt lại mật khẩu.
                            </p>
                            <p className="text-slate-500 text-xs text-center mb-6">
                                Nếu không thấy, hãy kiểm tra thư mục Spam.
                            </p>
                            <button
                                onClick={() => { setMode('login'); setError(''); }}
                                className="text-sm text-teal-400 hover:text-teal-300 transition-colors flex items-center gap-1"
                            >
                                <ArrowLeft className="w-3 h-3" /> Quay lại đăng nhập
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
