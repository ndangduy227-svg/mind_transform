import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FileText, Layers, LogOut, Plus, Edit2, Trash2, Loader2, ExternalLink, RefreshCw, Upload, Brain, CheckSquare, Square, ChevronDown, X } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { adminPosts, adminTemplates, logout } from '../../services/cmsAdminService';

const POST_CATEGORIES = ['Strategy', 'Technology', 'Methodology', 'Data', 'Case Study'];
const TEMPLATE_CATEGORIES = ['CRM', 'HR', 'Project Management', 'Finance', 'Operations', 'Marketing', 'Sales'];

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('posts');
    const [posts, setPosts] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Bulk selection
    const [selectedSlugs, setSelectedSlugs] = useState(new Set());
    const [bulkAction, setBulkAction] = useState(null); // null | 'status' | 'category' | 'delete'
    const [bulkLoading, setBulkLoading] = useState(false);

    // Clear selection khi switch tab
    useEffect(() => {
        setSelectedSlugs(new Set());
        setBulkAction(null);
    }, [activeTab]);

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
        if (!window.confirm(`Xoá bài viết: "${title}"?`)) return;
        try {
            await adminPosts.delete(slug);
            setPosts(posts.filter(p => p.slug !== slug));
        } catch (err) {
            alert('Lỗi: ' + err.message);
        }
    };

    const handleDeleteTemplate = async (slug, name) => {
        if (!window.confirm(`Xoá template: "${name}"?`)) return;
        try {
            await adminTemplates.delete(slug);
            setTemplates(templates.filter(t => t.slug !== slug));
        } catch (err) {
            alert('Lỗi: ' + err.message);
        }
    };

    // ── Selection helpers ──────────────────────────────────────────
    const currentItems = activeTab === 'posts' ? posts : templates;
    const allSlugs = currentItems.map(i => i.slug);
    const isAllSelected = currentItems.length > 0 && allSlugs.every(s => selectedSlugs.has(s));
    const hasSelection = selectedSlugs.size > 0;

    const toggleSelect = (slug) => {
        setSelectedSlugs(prev => {
            const next = new Set(prev);
            if (next.has(slug)) next.delete(slug);
            else next.add(slug);
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (isAllSelected) {
            setSelectedSlugs(new Set());
        } else {
            setSelectedSlugs(new Set(allSlugs));
        }
    };

    const clearSelection = () => {
        setSelectedSlugs(new Set());
        setBulkAction(null);
    };

    // ── Bulk actions ──────────────────────────────────────────────
    const service = activeTab === 'posts' ? adminPosts : adminTemplates;
    const slugsArray = Array.from(selectedSlugs);

    const handleBulkStatus = async (status) => {
        setBulkLoading(true);
        try {
            await service.bulkUpdateStatus(slugsArray, status);
            if (activeTab === 'posts') {
                setPosts(posts.map(p => selectedSlugs.has(p.slug) ? { ...p, status } : p));
            } else {
                setTemplates(templates.map(t => selectedSlugs.has(t.slug) ? { ...t, status } : t));
            }
            clearSelection();
        } catch (err) {
            alert('Lỗi: ' + err.message);
        } finally {
            setBulkLoading(false);
        }
    };

    const handleBulkCategory = async (category) => {
        setBulkLoading(true);
        try {
            await service.bulkUpdateCategory(slugsArray, category);
            if (activeTab === 'posts') {
                setPosts(posts.map(p => selectedSlugs.has(p.slug) ? { ...p, category } : p));
            } else {
                setTemplates(templates.map(t => selectedSlugs.has(t.slug) ? { ...t, category } : t));
            }
            clearSelection();
        } catch (err) {
            alert('Lỗi: ' + err.message);
        } finally {
            setBulkLoading(false);
        }
    };

    const handleBulkDelete = async () => {
        const count = selectedSlugs.size;
        const label = activeTab === 'posts' ? 'bài viết' : 'template';
        if (!window.confirm(`Xoá ${count} ${label} đã chọn? Hành động này không thể hoàn tác.`)) return;

        setBulkLoading(true);
        try {
            await service.bulkDelete(slugsArray);
            if (activeTab === 'posts') {
                setPosts(posts.filter(p => !selectedSlugs.has(p.slug)));
            } else {
                setTemplates(templates.filter(t => !selectedSlugs.has(t.slug)));
            }
            clearSelection();
        } catch (err) {
            alert('Lỗi: ' + err.message);
        } finally {
            setBulkLoading(false);
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

    const categories = activeTab === 'posts' ? POST_CATEGORIES : TEMPLATE_CATEGORIES;

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

                <main className="max-w-7xl mx-auto px-6 py-8">
                    {/* Tabs + Actions */}
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
                            <Link
                                to="/admin/skills"
                                className="flex items-center gap-2 px-4 py-3 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-xl font-medium transition-colors border border-indigo-500/20 text-sm"
                            >
                                <Brain className="w-4 h-4" /> AI Skills
                            </Link>
                            <Link
                                to="/admin/import"
                                className="flex items-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-colors border border-white/10 text-sm"
                            >
                                <Upload className="w-4 h-4" /> Import
                            </Link>
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

                    {/* ── Bulk Action Bar ────────────────────────────── */}
                    {hasSelection && (
                        <div className="mb-4 flex items-center gap-3 bg-teal-500/10 border border-teal-500/20 rounded-xl px-5 py-3 animate-in fade-in slide-in-from-top-2">
                            <span className="text-sm text-teal-400 font-medium flex-shrink-0">
                                Đã chọn {selectedSlugs.size}
                            </span>
                            <div className="h-5 w-px bg-teal-500/30" />

                            {/* Status buttons */}
                            <button
                                onClick={() => handleBulkStatus('Published')}
                                disabled={bulkLoading}
                                className="px-3 py-1.5 text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 rounded-lg hover:bg-emerald-500/25 transition-colors disabled:opacity-50"
                            >
                                Published
                            </button>
                            <button
                                onClick={() => handleBulkStatus('Draft')}
                                disabled={bulkLoading}
                                className="px-3 py-1.5 text-xs font-medium bg-amber-500/15 text-amber-400 border border-amber-500/25 rounded-lg hover:bg-amber-500/25 transition-colors disabled:opacity-50"
                            >
                                Draft
                            </button>

                            <div className="h-5 w-px bg-teal-500/30" />

                            {/* Category dropdown */}
                            <div className="relative group">
                                <button
                                    disabled={bulkLoading}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white/10 text-white border border-white/15 rounded-lg hover:bg-white/15 transition-colors disabled:opacity-50"
                                >
                                    Danh mục <ChevronDown className="w-3 h-3" />
                                </button>
                                <div className="absolute top-full left-0 mt-1 bg-slate-900 border border-white/10 rounded-lg shadow-xl shadow-black/50 py-1 min-w-[160px] hidden group-hover:block z-20">
                                    {categories.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => handleBulkCategory(cat)}
                                            className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="h-5 w-px bg-teal-500/30" />

                            {/* Delete */}
                            <button
                                onClick={handleBulkDelete}
                                disabled={bulkLoading}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-red-500/15 text-red-400 border border-red-500/25 rounded-lg hover:bg-red-500/25 transition-colors disabled:opacity-50"
                            >
                                <Trash2 className="w-3 h-3" /> Xoá
                            </button>

                            {bulkLoading && <Loader2 className="w-4 h-4 animate-spin text-teal-400 ml-2" />}

                            {/* Clear */}
                            <button
                                onClick={clearSelection}
                                className="ml-auto p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                title="Bỏ chọn tất cả"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {/* ── Content Table ──────────────────────────────── */}
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
                        {activeTab === 'posts' && (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/5 bg-white/5">
                                        <th className="p-4 w-10">
                                            <button onClick={toggleSelectAll} className="text-slate-400 hover:text-white transition-colors">
                                                {isAllSelected
                                                    ? <CheckSquare className="w-5 h-5 text-teal-400" />
                                                    : <Square className="w-5 h-5" />
                                                }
                                            </button>
                                        </th>
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
                                        posts.map(post => {
                                            const isSelected = selectedSlugs.has(post.slug);
                                            return (
                                                <tr
                                                    key={post.id || post.slug}
                                                    className={`border-b border-white/5 transition-colors ${
                                                        isSelected ? 'bg-teal-500/[0.06]' : 'hover:bg-white/[0.02]'
                                                    }`}
                                                >
                                                    <td className="p-4">
                                                        <button onClick={() => toggleSelect(post.slug)} className="text-slate-400 hover:text-white transition-colors">
                                                            {isSelected
                                                                ? <CheckSquare className="w-5 h-5 text-teal-400" />
                                                                : <Square className="w-5 h-5" />
                                                            }
                                                        </button>
                                                    </td>
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
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        )}

                        {activeTab === 'templates' && (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/5 bg-white/5">
                                        <th className="p-4 w-10">
                                            <button onClick={toggleSelectAll} className="text-slate-400 hover:text-white transition-colors">
                                                {isAllSelected
                                                    ? <CheckSquare className="w-5 h-5 text-teal-400" />
                                                    : <Square className="w-5 h-5" />
                                                }
                                            </button>
                                        </th>
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
                                        templates.map(tmpl => {
                                            const isSelected = selectedSlugs.has(tmpl.slug);
                                            return (
                                                <tr
                                                    key={tmpl.id || tmpl.slug}
                                                    className={`border-b border-white/5 transition-colors ${
                                                        isSelected ? 'bg-teal-500/[0.06]' : 'hover:bg-white/[0.02]'
                                                    }`}
                                                >
                                                    <td className="p-4">
                                                        <button onClick={() => toggleSelect(tmpl.slug)} className="text-slate-400 hover:text-white transition-colors">
                                                            {isSelected
                                                                ? <CheckSquare className="w-5 h-5 text-teal-400" />
                                                                : <Square className="w-5 h-5" />
                                                            }
                                                        </button>
                                                    </td>
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
                                            );
                                        })
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
