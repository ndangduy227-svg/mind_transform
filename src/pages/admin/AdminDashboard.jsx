import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FileText, Layers, LogOut, Plus, Edit2, Trash2, Loader2, ExternalLink, RefreshCw } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { adminPosts, adminTemplates, logout } from '../../services/cmsAdminService';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('posts'); // 'posts' | 'templates'
    const [posts, setPosts] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            const [postsData, templatesData] = await Promise.all([
                adminPosts.getAll(),
                adminTemplates.getAll()
            ]);
            setPosts(postsData);
            setTemplates(templatesData);
        } catch (err) {
            console.error('Lỗi tải dữ liệu CMS:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleDeletePost = async (slug, title) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xoá bài viết: "${title}"?`)) return;
        
        try {
            await adminPosts.delete(slug);
            setPosts(posts.filter(p => p.slug !== slug));
        } catch (err) {
            alert('Lỗi xoá bài viết: ' + err.message);
        }
    };

    const handleDeleteTemplate = async (slug, name) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xoá template: "${name}"?`)) return;
        
        try {
            await adminTemplates.delete(slug);
            setTemplates(templates.filter(t => t.slug !== slug));
        } catch (err) {
            alert('Lỗi xoá template: ' + err.message);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 text-teal-500 animate-spin mb-4" />
                <p className="text-slate-400">Đang tải dữ liệu CMS...</p>
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>Admin Dashboard | Mind.Transform</title>
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>

            <div className="min-h-screen bg-[#0A0A0A] text-slate-300">
                {/* Header */}
                <header className="bg-black/50 border-b border-white/10 sticky top-0 z-50 backdrop-blur-md">
                    <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <h1 className="text-xl font-bold text-white flex items-center gap-2">
                                <span className="bg-teal-500 text-black px-2 py-0.5 rounded text-sm uppercase tracking-wider">CMS</span>
                                Dashboard
                            </h1>
                            <Link to="/" className="text-sm text-slate-500 hover:text-teal-400 flex items-center gap-1 transition-colors ml-4 border-l border-white/10 pl-4">
                                <ExternalLink className="w-4 h-4" /> Xem Website
                            </Link>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-sm text-slate-400 hover:text-red-400 transition-colors"
                        >
                            <LogOut className="w-4 h-4" /> Đăng xuất
                        </button>
                    </div>
                </header>

                {/* Main Content */}
                <main className="max-w-7xl mx-auto px-6 py-8">
                    {/* Tabs */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex gap-4">
                            <button
                                onClick={() => setActiveTab('posts')}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                                    activeTab === 'posts' 
                                        ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' 
                                        : 'bg-white/5 text-slate-400 border border-transparent hover:bg-white/10'
                                }`}
                            >
                                <FileText className="w-5 h-5" /> Blog Posts ({posts.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('templates')}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                                    activeTab === 'templates' 
                                        ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' 
                                        : 'bg-white/5 text-slate-400 border border-transparent hover:bg-white/10'
                                }`}
                            >
                                <Layers className="w-5 h-5" /> Lark Templates ({templates.length})
                            </button>
                        </div>
                        
                        <div className="flex gap-3">
                            <button
                                onClick={() => loadData(true)}
                                className="flex items-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-colors border border-white/10"
                                disabled={refreshing}
                            >
                                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                            </button>
                            {activeTab === 'posts' ? (
                                <Link
                                    to="/admin/post/new"
                                    className="flex items-center gap-2 px-6 py-3 bg-teal-500 hover:bg-teal-400 text-white rounded-xl font-medium transition-colors"
                                >
                                    <Plus className="w-5 h-5" /> Viết bài mới
                                </Link>
                            ) : (
                                <Link
                                    to="/admin/template/new"
                                    className="flex items-center gap-2 px-6 py-3 bg-teal-500 hover:bg-teal-400 text-white rounded-xl font-medium transition-colors"
                                >
                                    <Plus className="w-5 h-5" /> Thêm Template
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Content Table */}
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
                        {activeTab === 'posts' && (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/5 bg-white/5">
                                        <th className="p-4 font-medium text-slate-400 w-16 text-center">ID</th>
                                        <th className="p-4 font-medium text-slate-400">Tiêu đề</th>
                                        <th className="p-4 font-medium text-slate-400">Danh mục</th>
                                        <th className="p-4 font-medium text-slate-400">Ngày tạo</th>
                                        <th className="p-4 font-medium text-slate-400">Trạng thái</th>
                                        <th className="p-4 font-medium text-slate-400 text-right">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {posts.length === 0 ? (
                                        <tr><td colSpan="6" className="p-8 text-center text-slate-500">Chưa có bài viết nào</td></tr>
                                    ) : (
                                        posts.map(post => (
                                            <tr key={post.id || post.slug} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                                <td className="p-4 text-center text-slate-500">{post.id}</td>
                                                <td className="p-4">
                                                    <div className="font-medium text-white mb-1 line-clamp-1">{post.title}</div>
                                                    <div className="text-xs text-slate-500 font-mono">{post.slug}</div>
                                                </td>
                                                <td className="p-4">
                                                    <span className="px-2.5 py-1 bg-white/5 rounded-md text-xs">{post.category}</span>
                                                </td>
                                                <td className="p-4 text-sm text-slate-400">{new Date(post.date).toLocaleDateString('vi-VN')}</td>
                                                <td className="p-4">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                                                        post.status === 'Published' 
                                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                    }`}>
                                                        {post.status || 'Draft'}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex justify-end gap-2">
                                                        {post.status === 'Published' && (
                                                            <a href={`/blog/${post.slug}`} target="_blank" rel="noreferrer" className="p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors" title="Xem trên web">
                                                                <ExternalLink className="w-4 h-4" />
                                                            </a>
                                                        )}
                                                        <Link to={`/admin/post/${post.slug}`} className="p-2 text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-colors" title="Chỉnh sửa">
                                                            <Edit2 className="w-4 h-4" />
                                                        </Link>
                                                        <button onClick={() => handleDeletePost(post.slug, post.title)} className="p-2 text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors" title="Xoá">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        )}

                        {activeTab === 'templates' && (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/5 bg-white/5">
                                        <th className="p-4 font-medium text-slate-400 w-16 text-center">ID</th>
                                        <th className="p-4 font-medium text-slate-400">Tên Template</th>
                                        <th className="p-4 font-medium text-slate-400">Danh mục</th>
                                        <th className="p-4 font-medium text-slate-400">Mức độ</th>
                                        <th className="p-4 font-medium text-slate-400">Trạng thái</th>
                                        <th className="p-4 font-medium text-slate-400 text-right">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {templates.length === 0 ? (
                                        <tr><td colSpan="6" className="p-8 text-center text-slate-500">Chưa có template nào</td></tr>
                                    ) : (
                                        templates.map(tmpl => (
                                            <tr key={tmpl.id || tmpl.slug} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                                <td className="p-4 text-center text-slate-500">{tmpl.id}</td>
                                                <td className="p-4">
                                                    <div className="font-medium text-white mb-1 line-clamp-1">{tmpl.name}</div>
                                                    <div className="text-xs text-slate-500 font-mono">{tmpl.slug}</div>
                                                </td>
                                                <td className="p-4">
                                                    <span className="px-2.5 py-1 bg-white/5 rounded-md text-xs">{tmpl.category}</span>
                                                </td>
                                                <td className="p-4 text-sm text-slate-400">{tmpl.difficulty}</td>
                                                <td className="p-4">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                                                        tmpl.status === 'Published' 
                                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                    }`}>
                                                        {tmpl.status || 'Draft'}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex justify-end gap-2">
                                                        {tmpl.status === 'Published' && (
                                                            <a href={`/templates/${tmpl.slug}`} target="_blank" rel="noreferrer" className="p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors" title="Xem trên web">
                                                                <ExternalLink className="w-4 h-4" />
                                                            </a>
                                                        )}
                                                        <Link to={`/admin/template/${tmpl.slug}`} className="p-2 text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-colors" title="Chỉnh sửa">
                                                            <Edit2 className="w-4 h-4" />
                                                        </Link>
                                                        <button onClick={() => handleDeleteTemplate(tmpl.slug, tmpl.name)} className="p-2 text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors" title="Xoá">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </main>
            </div>
        </>
    );
}
