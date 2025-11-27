import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useModal } from '../context/ModalContext';
import { LOGOS } from '../constants/brand';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
    const { openForm } = useModal();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const isActive = (path) => location.pathname === path;

    const navLinks = [
        { path: '/', label: 'Trang chủ' },
        { path: '/products', label: 'Sản phẩm' },
        { path: '/blog', label: 'Blog' },
        { path: '/mind-ai', label: 'Mind AI', badge: 'Beta' },
    ];

    return (
        <nav className="fixed w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <Link to="/" className="text-white hover:opacity-80 transition-opacity z-50">
                    <div dangerouslySetInnerHTML={{ __html: LOGOS.horizontal }} />
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`text-sm font-medium transition-colors flex items-center gap-1 ${isActive(link.path) ? 'text-teal-400' : 'text-slate-400 hover:text-white'}`}
                        >
                            {link.label}
                            {link.badge && (
                                <span className="text-[10px] px-1.5 py-0.5 bg-teal-500/20 text-teal-400 rounded-full border border-teal-500/20">
                                    {link.badge}
                                </span>
                            )}
                        </Link>
                    ))}
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={openForm}
                        className="hidden md:block px-6 py-2 text-sm font-medium border border-white/10 hover:border-white/30 rounded-full transition-all hover:bg-white/5 text-white"
                    >
                        Liên hệ
                    </button>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden text-white p-2"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-slate-950 border-b border-white/10 overflow-hidden"
                    >
                        <div className="px-6 py-8 flex flex-col gap-6">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`text-lg font-medium transition-colors flex items-center gap-2 ${isActive(link.path) ? 'text-teal-400' : 'text-slate-400 hover:text-white'}`}
                                >
                                    {link.label}
                                    {link.badge && (
                                        <span className="text-xs px-2 py-0.5 bg-teal-500/20 text-teal-400 rounded-full border border-teal-500/20">
                                            {link.badge}
                                        </span>
                                    )}
                                </Link>
                            ))}
                            <button
                                onClick={() => {
                                    openForm();
                                    setIsMobileMenuOpen(false);
                                }}
                                className="w-full px-6 py-3 text-center font-medium bg-white text-slate-950 rounded-xl hover:bg-teal-50 transition-colors"
                            >
                                Liên hệ ngay
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
