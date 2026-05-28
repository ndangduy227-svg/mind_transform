import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Edit2, Trash2, Loader2, Brain, Crown, ToggleLeft, ToggleRight } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { adminSkills } from '../../services/cmsAdminService';

export default function SkillsList() {
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSkills();
    }, []);

    const loadSkills = async () => {
        setLoading(true);
        try {
            const data = await adminSkills.getAll();
            setSkills(data);
        } catch (err) {
            console.error('Error loading skills:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (slug, currentActive) => {
        try {
            await adminSkills.toggleActive(slug, !currentActive);
            setSkills(skills.map(s => s.slug === slug ? { ...s, is_active: !currentActive } : s));
        } catch (err) {
            alert('Lỗi: ' + err.message);
        }
    };

    const handleDelete = async (slug, name, type) => {
        if (type === 'master') {
            alert('Không thể xóa Master Skill!');
            return;
        }
        if (!window.confirm(`Xóa skill "${name}"?`)) return;

        try {
            await adminSkills.delete(slug);
            setSkills(skills.filter(s => s.slug !== slug));
        } catch (err) {
            alert('Lỗi: ' + err.message);
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
                <title>Quản lý Skills | Admin</title>
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>

            <div className="min-h-screen bg-[#0A0A0A] text-slate-300 pb-20">
                <header className="bg-black/50 border-b border-white/10 sticky top-0 z-50 backdrop-blur-md">
                    <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link to="/admin" className="p-2 -ml-2 text-slate-400 hover:text-white transition-colors">
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <h1 className="text-xl font-bold text-white flex items-center gap-2">
                                <Brain className="w-5 h-5 text-teal-400" />
                                AI Agent Skills
                            </h1>
                        </div>
                        <Link
                            to="/admin/skill/new"
                            className="flex items-center gap-2 px-5 py-2 bg-teal-500 hover:bg-teal-400 text-white rounded-lg font-medium transition-colors"
                        >
                            <Plus className="w-4 h-4" /> Thêm Skill
                        </Link>
                    </div>
                </header>

                <main className="max-w-5xl mx-auto px-6 py-8">
                    {/* Info card */}
                    <div className="bg-gradient-to-r from-teal-900/20 to-indigo-900/20 border border-white/10 rounded-2xl p-5 mb-8">
                        <p className="text-sm text-slate-400 leading-relaxed">
                            <strong className="text-white">Master Skill</strong> = prompt gốc, định hình AI Agent là ai, cách trao đổi. Luôn được gửi kèm mọi cuộc hội thoại.<br/>
                            <strong className="text-white">Sub-skills</strong> = kiến thức chuyên môn theo ngành/phòng ban. Hệ thống tự chọn dựa trên form khách hàng điền.
                        </p>
                    </div>

                    {skills.length === 0 ? (
                        <div className="text-center py-20">
                            <Brain className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-white mb-2">Chưa có Skill nào</h3>
                            <p className="text-slate-500 mb-6">Tạo Master Skill trước để bắt đầu.</p>
                            <Link
                                to="/admin/skill/new"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-teal-500 hover:bg-teal-400 text-white rounded-xl font-medium transition-colors"
                            >
                                <Plus className="w-4 h-4" /> Tạo Master Skill
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {skills.map((skill) => (
                                <div
                                    key={skill.slug}
                                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                                        skill.type === 'master'
                                            ? 'bg-teal-500/5 border-teal-500/20'
                                            : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                                    }`}
                                >
                                    {/* Type badge */}
                                    <div className="flex-shrink-0">
                                        {skill.type === 'master' ? (
                                            <div className="w-10 h-10 bg-teal-500/15 rounded-xl flex items-center justify-center">
                                                <Crown className="w-5 h-5 text-teal-400" />
                                            </div>
                                        ) : (
                                            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                                                <Brain className="w-5 h-5 text-slate-500" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-white truncate">{skill.name}</h3>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                                skill.type === 'master'
                                                    ? 'bg-teal-500/20 text-teal-400'
                                                    : 'bg-indigo-500/20 text-indigo-400'
                                            }`}>
                                                {skill.type}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {(skill.tags_industry || []).map(tag => (
                                                <span key={tag} className="px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded text-[10px]">
                                                    {tag}
                                                </span>
                                            ))}
                                            {(skill.tags_department || []).map(tag => (
                                                <span key={tag} className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded text-[10px]">
                                                    {tag}
                                                </span>
                                            ))}
                                            {(skill.tags_industry || []).length === 0 && (skill.tags_department || []).length === 0 && skill.type !== 'master' && (
                                                <span className="text-[10px] text-slate-600 italic">Chưa gắn tag</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Priority */}
                                    <div className="text-center flex-shrink-0 hidden sm:block">
                                        <div className="text-xs text-slate-500">Priority</div>
                                        <div className="text-white font-bold">{skill.priority || 0}</div>
                                    </div>

                                    {/* Toggle */}
                                    <button
                                        onClick={() => handleToggle(skill.slug, skill.is_active)}
                                        className={`flex-shrink-0 transition-colors ${
                                            skill.is_active ? 'text-teal-400' : 'text-slate-600'
                                        }`}
                                        title={skill.is_active ? 'Đang bật' : 'Đang tắt'}
                                    >
                                        {skill.is_active ? (
                                            <ToggleRight className="w-8 h-8" />
                                        ) : (
                                            <ToggleLeft className="w-8 h-8" />
                                        )}
                                    </button>

                                    {/* Actions */}
                                    <div className="flex gap-2 flex-shrink-0">
                                        <Link
                                            to={`/admin/skill/${skill.slug}`}
                                            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(skill.slug, skill.name, skill.type)}
                                            className={`p-2 rounded-lg transition-colors ${
                                                skill.type === 'master'
                                                    ? 'text-slate-700 cursor-not-allowed'
                                                    : 'text-slate-400 hover:text-red-400 hover:bg-red-500/10'
                                            }`}
                                            disabled={skill.type === 'master'}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}
