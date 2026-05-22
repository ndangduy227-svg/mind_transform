import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Upload, Settings, Users, History, LogOut } from 'lucide-react';
import { branding } from '../utils/branding';

const Layout = ({ children }) => {
    const location = useLocation();

    const navItems = [
        { path: '/', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/upload', label: 'Upload Orders', icon: Upload },
        { path: '/config', label: 'Configuration', icon: Settings },
        { path: '/shippers', label: 'Shippers', icon: Users },
        { path: '/history', label: 'History', icon: History },
    ];

    return (
        <div className="flex h-screen bg-[var(--bg-body)] overflow-hidden font-sans">
            {/* Premium Sidebar */}
            <aside className="w-72 bg-[var(--bg-sidebar)] text-white flex flex-col shadow-2xl z-20">
                <div className="p-8 flex items-center justify-center border-b border-gray-800">
                    <div
                        className="w-full h-12 text-white"
                        dangerouslySetInnerHTML={{ __html: branding.smartRoute_full }}
                    />
                </div>

                <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 px-4">Menu</div>
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 group ${isActive
                                        ? 'bg-[var(--primary)] text-white shadow-lg shadow-indigo-900/50 translate-x-1'
                                        : 'text-gray-400 hover:bg-gray-800 hover:text-white hover:translate-x-1'
                                    }`}
                            >
                                <Icon size={20} className={isActive ? 'text-white' : 'text-gray-500 group-hover:text-white'} />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-6 border-t border-gray-800 bg-gray-900/50">
                    <div className="flex items-center gap-4 px-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg">
                            A
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-white">Admin User</span>
                            <span className="text-xs text-gray-400">SmartRoute Manager</span>
                        </div>
                        <button className="ml-auto text-gray-500 hover:text-white transition-colors">
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
                {/* Top Header (Optional, for breadcrumbs or actions) */}
                <header className="h-16 bg-white border-b border-[var(--border)] flex items-center justify-between px-8 shadow-sm z-10">
                    <h1 className="text-xl font-bold text-[var(--text-main)] capitalize">
                        {location.pathname === '/' ? 'Route Dashboard' : location.pathname.replace('/', '').replace('-', ' ')}
                    </h1>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-[var(--text-muted)]">
                            {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8 bg-[var(--bg-body)]">
                    <div className="max-w-7xl mx-auto w-full">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Layout;
