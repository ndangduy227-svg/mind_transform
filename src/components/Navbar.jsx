import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useModal } from '../context/ModalContext';
import { LOGOS } from '../constants/brand';

export default function Navbar() {
    const { openForm } = useModal();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="fixed w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <Link to="/" className="text-white hover:opacity-80 transition-opacity">
                    <div dangerouslySetInnerHTML={{ __html: LOGOS.horizontal }} />
                </Link>

                <div className="hidden md:flex items-center gap-8">
                    <Link
                        to="/"
                        className={`text-sm font-medium transition-colors ${isActive('/') ? 'text-teal-400' : 'text-slate-400 hover:text-white'}`}
                    >
                        Trang chủ
                    </Link>
                    <Link
                        to="/products"
                        className={`text-sm font-medium transition-colors ${isActive('/products') ? 'text-teal-400' : 'text-slate-400 hover:text-white'}`}
                    >
                        Sản phẩm
                    </Link>
                    <Link
                        to="/blog"
                        className={`text-sm font-medium transition-colors ${isActive('/blog') ? 'text-teal-400' : 'text-slate-400 hover:text-white'}`}
                    >
                        Blog
                    </Link>
                    <Link
                        to="/mind-ai"
                        className={`text-sm font-medium transition-colors flex items-center gap-1 ${isActive('/mind-ai') ? 'text-teal-400' : 'text-slate-400 hover:text-white'}`}
                    >
                        Mind AI <span className="text-[10px] px-1.5 py-0.5 bg-teal-500/20 text-teal-400 rounded-full border border-teal-500/20">Beta</span>
                    </Link>
                </div>

                <button
                    onClick={openForm}
                    className="px-6 py-2 text-sm font-medium border border-white/10 hover:border-white/30 rounded-full transition-all hover:bg-white/5 text-white"
                >
                    Liên hệ
                </button>
            </div>
        </nav>
    );
}
