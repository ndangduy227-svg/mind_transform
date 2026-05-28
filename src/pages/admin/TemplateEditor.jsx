import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, Image as ImageIcon, Plus, X } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Editor } from '@tinymce/tinymce-react';
import { adminTemplates, isAuthenticated } from '../../services/cmsAdminService';

export default function TemplateEditor() {
    const { slug } = useParams();
    const isNew = slug === 'new';
    const navigate = useNavigate();

    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('description'); // 'description' | 'use_case'
    const [screenshots, setScreenshots] = useState([]);
    const [newScreenshot, setNewScreenshot] = useState('');
    
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        summary: '',
        description: '',
        use_case: '',
        category: 'CRM',
        industry: '',
        thumbnail: '',
        screenshots: '',
        template_link: '',
        form_link: '',
        difficulty: 'Beginner',
        status: 'Draft',
        date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        if (!isAuthenticated()) {
            navigate('/admin/login');
            return;
        }

        if (!isNew) {
            loadTemplate();
        }
    }, [slug]);

    const loadTemplate = async () => {
        try {
            const tmpl = await adminTemplates.getBySlug(slug);
            if (tmpl) {
                setFormData(tmpl);
                if (tmpl.screenshots) {
                    setScreenshots(tmpl.screenshots.split(',').map(s => s.trim()).filter(Boolean));
                }
            } else {
                alert('Không tìm thấy template!');
                navigate('/admin');
            }
        } catch (err) {
            console.error(err);
            alert('Lỗi khi tải template');
        } finally {
            setLoading(false);
        }
    };

    const handleNameChange = (e) => {
        const name = e.target.value;
        setFormData(prev => ({
            ...prev,
            name,
            ...(isNew && { slug: name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') })
        }));
    };

    const addScreenshot = () => {
        if (newScreenshot.trim()) {
            const updated = [...screenshots, newScreenshot.trim()];
            setScreenshots(updated);
            setFormData(prev => ({ ...prev, screenshots: updated.join(',') }));
            setNewScreenshot('');
        }
    };

    const removeScreenshot = (index) => {
        const updated = screenshots.filter((_, i) => i !== index);
        setScreenshots(updated);
        setFormData(prev => ({ ...prev, screenshots: updated.join(',') }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.slug) {
            alert('Vui lòng điền đủ Tên Template và Slug');
            return;
        }

        setSaving(true);
        try {
            if (isNew) {
                await adminTemplates.create(formData);
                alert('Tạo template thành công!');
                navigate('/admin');
            } else {
                await adminTemplates.update(slug, formData);
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
                <title>{isNew ? 'Thêm Template' : 'Sửa Template'} | Admin</title>
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
                                {isNew ? 'Thêm Lark Template' : 'Chỉnh sửa Template'}
                            </h1>
                        </div>
                        <button
                            onClick={handleSubmit}
                            disabled={saving}
                            className="flex items-center gap-2 px-5 py-2 bg-teal-500 hover:bg-teal-400 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Lưu Template
                        </button>
                    </div>
                </header>

                <main className="max-w-7xl mx-auto px-6 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
                        
                        {/* Editor Section */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Tên Template</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={handleNameChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xl font-bold text-white focus:outline-none focus:border-teal-500/50"
                                    placeholder="Nhập tên template..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Đường dẫn (Slug)</label>
                                    <input
                                        type="text"
                                        value={formData.slug}
                                        onChange={(e) => setFormData({...formData, slug: e.target.value})}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-teal-500/50 font-mono text-sm"
                                        placeholder="vi-du-slug"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Ngành nghề (Industry)</label>
                                    <input
                                        type="text"
                                        value={formData.industry}
                                        onChange={(e) => setFormData({...formData, industry: e.target.value})}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-teal-500/50 text-sm"
                                        placeholder="VD: Retail, F&B, Service..."
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Tóm tắt (Summary)</label>
                                <textarea
                                    value={formData.summary}
                                    onChange={(e) => setFormData({...formData, summary: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500/50 h-20 resize-none text-sm"
                                    placeholder="Mô tả ngắn 1-2 câu để hiển thị ngoài danh sách..."
                                />
                            </div>

                            {/* Rich Text Tabs */}
                            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                                <div className="flex border-b border-white/10">
                                    <button
                                        onClick={() => setActiveTab('description')}
                                        className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'description' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                                    >
                                        Mô tả chi tiết
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('use_case')}
                                        className={`flex-1 py-3 text-sm font-medium transition-colors border-l border-white/10 ${activeTab === 'use_case' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                                    >
                                        Bài toán giải quyết
                                    </button>
                                </div>
                                <div className="p-1">
                                    {activeTab === 'description' ? (
                                        <Editor
                                            tinymceScriptSrc="/tinymce/tinymce.min.js"
                                            licenseKey="gpl"
                                            value={formData.description}
                                            onEditorChange={(val) => setFormData({...formData, description: val || ''})}
                                            init={{
                                                height: 400,
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
                                    ) : (
                                        <Editor
                                            tinymceScriptSrc="/tinymce/tinymce.min.js"
                                            licenseKey="gpl"
                                            value={formData.use_case}
                                            onEditorChange={(val) => setFormData({...formData, use_case: val || ''})}
                                            init={{
                                                height: 400,
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
                                    )}
                                </div>
                            </div>

                            {/* Links */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Link Lark Template gốc</label>
                                    <input
                                        type="url"
                                        value={formData.template_link}
                                        onChange={(e) => setFormData({...formData, template_link: e.target.value})}
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none text-sm"
                                        placeholder="https://...larksuite.com/..."
                                    />
                                    <p className="text-xs text-slate-500 mt-2">Nút "Lấy template" sẽ mở link này.</p>
                                </div>
                                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Link Form Đăng ký (Tuỳ chọn)</label>
                                    <input
                                        type="url"
                                        value={formData.form_link}
                                        onChange={(e) => setFormData({...formData, form_link: e.target.value})}
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none text-sm"
                                        placeholder="https://..."
                                    />
                                    <p className="text-xs text-slate-500 mt-2">Nếu để trống, sẽ mở LeadForm mặc định của web.</p>
                                </div>
                            </div>

                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                                <h3 className="font-bold text-white mb-4">Cài đặt hiển thị</h3>
                                
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
                                            <option value="CRM">CRM</option>
                                            <option value="HR">HR</option>
                                            <option value="Project Management">Project Management</option>
                                            <option value="Finance">Finance</option>
                                            <option value="Operations">Operations</option>
                                            <option value="Marketing">Marketing</option>
                                            <option value="Sales">Sales</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1">Độ khó triển khai</label>
                                        <select
                                            value={formData.difficulty}
                                            onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                                            className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none"
                                        >
                                            <option value="Beginner">Beginner (Cơ bản)</option>
                                            <option value="Intermediate">Intermediate (Trung bình)</option>
                                            <option value="Advanced">Advanced (Nâng cao)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1">Ngày cập nhật</label>
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
                                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                                    <ImageIcon className="w-4 h-4" /> Hình ảnh
                                </h3>
                                
                                <div className="mb-4">
                                    <label className="block text-xs font-medium text-slate-400 mb-1">Ảnh đại diện (Thumbnail)</label>
                                    <input
                                        type="text"
                                        value={formData.thumbnail}
                                        onChange={(e) => setFormData({...formData, thumbnail: e.target.value})}
                                        placeholder="URL ảnh chính..."
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none text-sm mb-2"
                                    />
                                    {formData.thumbnail && (
                                        <div className="aspect-video rounded-lg overflow-hidden border border-white/10">
                                            <img src={formData.thumbnail} alt="Thumbnail" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                </div>

                                <div className="border-t border-white/10 pt-4">
                                    <label className="block text-xs font-medium text-slate-400 mb-2">Thư viện ảnh (Screenshots)</label>
                                    <div className="flex gap-2 mb-3">
                                        <input
                                            type="text"
                                            value={newScreenshot}
                                            onChange={(e) => setNewScreenshot(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && addScreenshot()}
                                            placeholder="Thêm URL ảnh..."
                                            className="flex-1 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none text-sm"
                                        />
                                        <button
                                            onClick={addScreenshot}
                                            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {screenshots.length > 0 && (
                                        <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                                            {screenshots.map((url, i) => (
                                                <div key={i} className="relative group rounded-lg overflow-hidden border border-white/10 bg-black/50">
                                                    <img src={url} alt={`Screenshot ${i}`} className="w-full h-20 object-cover" />
                                                    <button
                                                        onClick={() => removeScreenshot(i)}
                                                        className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-red-500 rounded text-white opacity-0 group-hover:opacity-100 transition-all"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                </main>
            </div>
        </>
    );
}
