import React from 'react';
import { Link } from 'react-router-dom';
import { LOGOS } from '../constants/brand';

export default function Footer() {
    return (
        <footer className="py-12 px-6 border-t border-white/5 bg-slate-950 text-slate-500 text-sm">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="text-white w-40" dangerouslySetInnerHTML={{ __html: LOGOS.horizontal }} />
                <div className="flex gap-8">
                    <Link to="/" className="hover:text-teal-400 transition-colors">Về chúng tôi</Link>
                    <Link to="/products" className="hover:text-teal-400 transition-colors">Sản phẩm</Link>
                    <Link to="/blog" className="hover:text-teal-400 transition-colors">Blog</Link>
                </div>
                <div>© 2025 Mind.Transform. All rights reserved.</div>
            </div>
        </footer>
    );
}
