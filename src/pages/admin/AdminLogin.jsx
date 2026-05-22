import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, Loader2, Home } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { login } from '../../services/cmsAdminService';

export default function AdminLogin() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Simulate network delay for better UX
        await new Promise(resolve => setTimeout(resolve, 500));

        if (login(password)) {
            navigate('/admin');
        } else {
            setError('Mật khẩu không chính xác');
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
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-16 h-16 bg-teal-500/10 rounded-full flex items-center justify-center mb-4 border border-teal-500/20">
                            <Lock className="w-8 h-8 text-teal-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-white">Quản trị CMS</h1>
                        <p className="text-slate-400 text-sm mt-2 text-center">
                            Vui lòng nhập mật khẩu để truy cập hệ thống quản trị nội dung.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Nhập mật khẩu..."
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all placeholder:text-slate-600"
                                required
                            />
                            {error && (
                                <p className="text-red-400 text-sm mt-2">{error}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !password}
                            className="w-full bg-teal-500 hover:bg-teal-400 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>Đăng nhập <ArrowRight className="w-4 h-4" /></>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}
