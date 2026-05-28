import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, Brain, Crown, AlertTriangle } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { adminSkills } from '../../services/cmsAdminService';
import { INDUSTRIES, DEPARTMENTS, SKILL_TYPES } from '../../constants/mindai';
import TagSelector from '../../components/admin/TagSelector';

export default function SkillEditor() {
    const { slug } = useParams();
    const isNew = slug === 'new';
    const navigate = useNavigate();

    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [masterExists, setMasterExists] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        type: 'sub',
        content: '',
        tags_industry: [],
        tags_department: [],
        is_active: true,
        priority: 0,
    });

    useEffect(() => {
        if (!isNew) {
            loadSkill();
        } else {
            // Check if master already exists
            adminSkills.hasMaster().then(exists => setMasterExists(exists));
        }
    }, [slug]);

    const loadSkill = async () => {
        try {
            const skill = await adminSkills.getBySlug(slug);
            if (skill) {
                setFormData({
                    name: skill.name || '',
                    slug: skill.slug || '',
                    type: skill.type || 'sub',
                    content: skill.content || '',
                    tags_industry: skill.tags_industry || [],
                    tags_department: skill.tags_department || [],
                    is_active: skill.is_active !== false,
                    priority: skill.priority || 0,
                });
            } else {
                alert('Skill not found!');
                navigate('/admin/skills');
            }
        } catch (err) {
            console.error(err);
            alert('Lỗi khi tải skill');
        } finally {
            setLoading(false);
        }
    };

    const handleNameChange = (e) => {
        const name = e.target.value;
        setFormData(prev => ({
            ...prev,
            name,
            ...(isNew && {
                slug: name.toLowerCase()
                    .normalize("NFD").replace(/[̀-ͯ]/g, "")
                    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)+/g, '')
            })
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.slug) {
            alert('Vui lòng điền Tên và Slug');
            return;
        }

        // Prevent creating second master
        if (isNew && formData.type === 'master' && masterExists) {
            alert('Đã tồn tại Master Skill. Chỉ được có 1 Master Skill duy nhất.');
            return;
        }

        setSaving(true);
        try {
            if (isNew) {
                await adminSkills.create(formData);
                alert('Tạo skill thành công!');
            } else {
                await adminSkills.update(slug, formData);
                alert('Cập nhật thành công!');
            }
            navigate('/admin/skills');
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

    const isMaster = formData.type === 'master';

    return (
        <>
            <Helmet>
                <title>{isNew ? 'Thêm Skill' : `Sửa: ${formData.name}`} | Admin</title>
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>

            <div className="min-h-screen bg-[#0A0A0A] text-slate-300 pb-20">
                <header className="bg-black/50 border-b border-white/10 sticky top-0 z-50 backdrop-blur-md">
                    <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link to="/admin/skills" className="p-2 -ml-2 text-slate-400 hover:text-white transition-colors">
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <h1 className="text-xl font-bold text-white flex items-center gap-2">
                                {isMaster ? <Crown className="w-5 h-5 text-teal-400" /> : <Brain className="w-5 h-5 text-indigo-400" />}
                                {isNew ? 'Thêm Skill' : formData.name}
                            </h1>
                        </div>
                        <button
                            onClick={handleSubmit}
                            disabled={saving}
                            className="flex items-center gap-2 px-5 py-2 bg-teal-500 hover:bg-teal-400 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Lưu Skill
                        </button>
                    </div>
                </header>

                <main className="max-w-6xl mx-auto px-6 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">

                        {/* Main editor */}
                        <div className="space-y-6">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Tên Skill</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={handleNameChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xl font-bold text-white focus:outline-none focus:border-teal-500/50"
                                    placeholder="VD: Lark Suite Consulting, Retail CRM..."
                                />
                            </div>

                            {/* Slug */}
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Slug</label>
                                <input
                                    type="text"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-teal-500/50 font-mono text-sm"
                                    placeholder="lark-suite-consulting"
                                />
                            </div>

                            {/* Content — markdown textarea */}
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">
                                    Nội dung Skill (Markdown)
                                </label>
                                <p className="text-xs text-slate-500 mb-3">
                                    Viết bằng Markdown. Nội dung này sẽ được gửi kèm trong prompt cho AI Agent.
                                    Càng ngắn gọn, rõ ràng càng tốt (tiết kiệm token).
                                </p>
                                <textarea
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-teal-500/50 font-mono text-sm leading-relaxed resize-none"
                                    style={{ minHeight: '450px' }}
                                    placeholder={isMaster
                                        ? `# Master Skill — Mind AI Agent\n\n## Bạn là ai\nBạn là Business Transformation Manager của Mind.Transform...\n\n## Phong cách trao đổi\n- Chuyên nghiệp nhưng gần gũi\n- Đưa ra nhận định sắc bén\n- Đặt câu hỏi mở để khai thác thông tin\n\n## Tools\n- Search bài viết trên website\n- Gợi ý template phù hợp\n\n## Output format\nJSON: { analysis, score, next_question, suggested_links }`
                                        : `# Lark Suite Consulting Skill\n\n## Phạm vi tư vấn\n- Triển khai Lark Suite cho doanh nghiệp\n- CRM, HR, Project Management trên Lark\n\n## Kiến thức chuyên môn\n- Lark Base, Lark Docs, Lark Approval\n- Tích hợp workflow automation\n\n## Lưu ý khi tư vấn\n- Hỏi về quy mô team trước\n- Xác định pain point chính`
                                    }
                                />
                            </div>

                            {/* Master type warning */}
                            {isMaster && (
                                <div className="bg-teal-500/5 border border-teal-500/20 rounded-xl p-4 flex gap-3">
                                    <Crown className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                                    <div className="text-sm text-slate-400">
                                        <strong className="text-teal-400">Master Skill</strong> được gửi kèm trong <strong>mọi</strong> cuộc hội thoại.
                                        Đây là nơi định nghĩa AI Agent là ai, phong cách, output format.
                                        Sub-skills chỉ được gửi kèm khi form khách hàng match tags.
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar settings */}
                        <div className="space-y-6">
                            {/* Type + Active */}
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                                <h3 className="font-bold text-white mb-4">Cài đặt</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1">Loại Skill</label>
                                        <select
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none"
                                            disabled={!isNew && formData.type === 'master'}
                                        >
                                            {SKILL_TYPES.map(t => (
                                                <option key={t.value} value={t.value}>{t.label}</option>
                                            ))}
                                        </select>
                                        {isNew && formData.type === 'master' && masterExists && (
                                            <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                                                <AlertTriangle className="w-3 h-3" /> Đã tồn tại Master Skill
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1">Độ ưu tiên</label>
                                        <input
                                            type="number"
                                            value={formData.priority}
                                            onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                                            className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none"
                                            min="0"
                                            max="100"
                                        />
                                        <p className="text-xs text-slate-500 mt-1">Số cao = ưu tiên chọn trước</p>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-medium text-slate-400">Kích hoạt</label>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                                            className={`relative w-11 h-6 rounded-full transition-colors ${
                                                formData.is_active ? 'bg-teal-500' : 'bg-slate-700'
                                            }`}
                                        >
                                            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                                                formData.is_active ? 'translate-x-5' : 'translate-x-0'
                                            }`} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Tags — only show for sub-skills */}
                            {!isMaster && (
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                                    <h3 className="font-bold text-white mb-4">Tags (Routing)</h3>
                                    <p className="text-xs text-slate-500 mb-4">
                                        Khi khách hàng điền form, hệ thống match tags này để chọn skill phù hợp.
                                    </p>
                                    <div className="space-y-5">
                                        <TagSelector
                                            label="Ngành nghề"
                                            options={INDUSTRIES}
                                            selected={formData.tags_industry}
                                            onChange={(tags) => setFormData({ ...formData, tags_industry: tags })}
                                            columns={2}
                                        />
                                        <TagSelector
                                            label="Phòng ban"
                                            options={DEPARTMENTS}
                                            selected={formData.tags_department}
                                            onChange={(tags) => setFormData({ ...formData, tags_department: tags })}
                                            columns={2}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Token estimate */}
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                                <h3 className="font-bold text-white mb-2">Token estimate</h3>
                                <div className="text-2xl font-bold text-teal-400">
                                    ~{Math.round((formData.content || '').length / 4)}
                                </div>
                                <p className="text-xs text-slate-500 mt-1">
                                    tokens (ước tính). Nên giữ dưới 500 tokens/skill.
                                </p>
                                {Math.round((formData.content || '').length / 4) > 500 && (
                                    <p className="text-xs text-amber-400 mt-2 flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3" /> Content hơi dài, cân nhắc rút gọn.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
