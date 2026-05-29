import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Editor } from '@tinymce/tinymce-react';
import { adminPosts } from '../../services/cmsAdminService';
import ImageUpload from '../../components/admin/ImageUpload';

export default function PostEditor() {
    const { slug } = useParams();
    const isNew = slug === 'new';
    const navigate = useNavigate();

    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        summary: '',
        content: '',
        cover_image: '',
        category: 'Strategy',
        author: 'Admin',
        status: 'Draft',
        date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        if (!isNew) {
            loadPost();
        }
    }, [slug]);

    const loadPost = async () => {
        try {
            const post = await adminPosts.getBySlug(slug);
            if (post) {
                setFormData(post);
            } else {
                alert('Không tìm thấy bài viết!');
                navigate('/admin');
            }
        } catch (err) {
            console.error(err);
            alert('Lỗi khi tải bài viết');
        } finally {
            setLoading(false);
        }
    };

    const handleTitleChange = (e) => {
        const title = e.target.value;
        setFormData(prev => ({
            ...prev,
            title,
            // Auto generate slug if it's new
            ...(isNew && { slug: title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') })
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.slug) {
            alert('Vui lòng điền đủ Tiêu đề và Slug');
            return;
        }

        setSaving(true);
        try {
            if (isNew) {
                await adminPosts.create(formData);
                alert('Tạo bài viết thành công!');
                navigate('/admin');
            } else {
                await adminPosts.update(slug, formData);
                alert('Cập nhật thành công!');
                navigate('/admin');
            }
        } catch (err) {
            alert('Lỗi: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>{isNew ? 'Viết bài mới' : 'Sửa bài viết'} | Admin</title>
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>

            <div className="min-h-screen bg-[#0A0A0A] text-slate-300 pb-20">
                {/* Header */}
                <header className="bg-black/50 border-b border-white/10 sticky top-0 z-50 backdrop-blur-md">
                    <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link to="/admin" className="p-2 -ml-2 text-slate-400 hover:text-white transition-colors">
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <h1 className="text-xl font-bold text-white">
                                {isNew ? 'Viết bài mới' : 'Chỉnh sửa bài viết'}
                            </h1>
                        </div>
                        <button
                            onClick={handleSubmit}
                            disabled={saving}
                            className="flex items-center gap-2 px-5 py-2 bg-teal-500 hover:bg-teal-400 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Lưu bài viết
                        </button>
                    </div>
                </header>

                <main className="max-w-7xl mx-auto px-6 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
                        
                        {/* Editor Section */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Tiêu đề</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={handleTitleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xl font-bold text-white focus:outline-none focus:border-teal-500/50"
                                    placeholder="Nhập tiêu đề bài viết..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Đường dẫn (Slug)</label>
                                <input
                                    type="text"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({...formData, slug: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-teal-500/50 font-mono text-sm"
                                    placeholder="vi-du-duong-dan"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Tóm tắt (Summary)</label>
                                <textarea
                                    value={formData.summary}
                                    onChange={(e) => setFormData({...formData, summary: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500/50 h-24 resize-none"
                                    placeholder="Nhập đoạn mô tả ngắn..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Nội dung</label>
                                <Editor
                                    tinymceScriptSrc="/tinymce/tinymce.min.js"
                                    value={formData.content}
                                    onEditorChange={(val) => setFormData({...formData, content: val || ''})}
                                    licenseKey="gpl"
                                    init={{
                                        height: 500,
                                        menubar: true,
                                        skin: 'oxide-dark',
                                        content_css: 'dark',
                                        plugins: [
                                            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
                                            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                                            'insertdatetime', 'media', 'table', 'preview', 'help', 'wordcount'
                                        ],
                                        toolbar: 'undo redo | blocks | bold italic forecolor | ' +
                                            'alignleft aligncenter alignright alignjustify | ' +
                                            'bullist numlist outdent indent | link image media table | ' +
                                            'removeformat | code fullscreen | help',
                                        content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 16px; color: #e2e8f0; background-color: #0f172a; }',
                                        promotion: false,
                                        branding: false,
                                    }}
                                />
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                                <h3 className="font-bold text-white mb-4">Cài đặt bài viết</h3>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1">Trạng thái</label>
                                        <select
                                            value={formData.status}
                                            onChange={(e) => setFormData({...formData, status: e.target.value})}
                                            className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none"
                                        >
                                            <option value="Draft">Draft (Bản nháp)</option>
                                            <option value="Published">Published (Xuất bản)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1">Danh mục</label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                                            className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none"
                                        >
                                            <option value="Strategy">Strategy</option>
                                            <option value="Technology">Technology</option>
                                            <option value="Methodology">Methodology</option>
                                            <option value="Data">Data</option>
                                            <option value="Case Study">Case Study</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1">Tác giả</label>
                                        <input
                                            type="text"
                                            value={formData.author}
                                            onChange={(e) => setFormData({...formData, author: e.target.value})}
                                            className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1">Ngày đăng</label>
                                        <input
                                            type="date"
                                            value={formData.date}
                                            onChange={(e) => setFormData({...formData, date: e.target.value})}
                                            className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                                <ImageUpload
                                    value={formData.cover_image}
                                    onChange={(url) => setFormData({...formData, cover_image: url})}
                                    folder="posts"
                                    label="Ảnh bìa"
                                />
                            </div>
                        </div>

                    </div>
                </main>
            </div>
        </>
    );
}
