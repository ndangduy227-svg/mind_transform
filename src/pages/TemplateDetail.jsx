import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, ExternalLink, FileText, Layers, ChevronLeft, ChevronRight, ArrowRight, Sparkles } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import Markdown from 'react-markdown';
import { isHTMLContent } from '../utils/contentRenderer';
import { templates as templatesService } from '../services/cmsService';
import { useModal } from '../context/ModalContext';

// Category & Difficulty metadata (shared with TemplateLibrary)
const CATEGORY_META = {
    'CRM': { color: 'from-teal-500 to-emerald-500', bgColor: 'bg-teal-500/10', textColor: 'text-teal-400', borderColor: 'border-teal-500/20' },
    'HR': { color: 'from-violet-500 to-purple-500', bgColor: 'bg-violet-500/10', textColor: 'text-violet-400', borderColor: 'border-violet-500/20' },
    'Project Management': { color: 'from-blue-500 to-cyan-500', bgColor: 'bg-blue-500/10', textColor: 'text-blue-400', borderColor: 'border-blue-500/20' },
    'Finance': { color: 'from-amber-500 to-orange-500', bgColor: 'bg-amber-500/10', textColor: 'text-amber-400', borderColor: 'border-amber-500/20' },
    'Operations': { color: 'from-rose-500 to-pink-500', bgColor: 'bg-rose-500/10', textColor: 'text-rose-400', borderColor: 'border-rose-500/20' },
    'Marketing': { color: 'from-indigo-500 to-blue-500', bgColor: 'bg-indigo-500/10', textColor: 'text-indigo-400', borderColor: 'border-indigo-500/20' },
    'Sales': { color: 'from-emerald-500 to-green-500', bgColor: 'bg-emerald-500/10', textColor: 'text-emerald-400', borderColor: 'border-emerald-500/20' },
};

const DIFFICULTY_META = {
    'Beginner': { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: '🟢 Cơ bản' },
    'Intermediate': { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: '🟡 Trung bình' },
    'Advanced': { color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', label: '🔴 Nâng cao' },
};

function getCategoryMeta(category) {
    return CATEGORY_META[category] || { color: 'from-slate-500 to-slate-400', bgColor: 'bg-slate-500/10', textColor: 'text-slate-400', borderColor: 'border-slate-500/20' };
}

function getDifficultyMeta(difficulty) {
    return DIFFICULTY_META[difficulty] || { color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20', label: difficulty };
}

// Screenshot Gallery Component
function ScreenshotGallery({ screenshots, name }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const images = (screenshots || '').split(',').map(s => s.trim()).filter(Boolean);

    if (images.length === 0) return null;

    const goTo = (index) => {
        setCurrentIndex(Math.max(0, Math.min(images.length - 1, index)));
    };

    return (
        <div className="mb-10">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Layers className="w-5 h-5 text-teal-400" />
                Screenshots
            </h2>
            <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-slate-900/50">
                <img
                    src={images[currentIndex]}
                    alt={`${name} screenshot ${currentIndex + 1}`}
                    className="w-full h-auto max-h-[500px] object-contain mx-auto"
                />
                {images.length > 1 && (
                    <>
                        <button
                            onClick={() => goTo(currentIndex - 1)}
                            disabled={currentIndex === 0}
                            className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors disabled:opacity-30"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => goTo(currentIndex + 1)}
                            disabled={currentIndex === images.length - 1}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors disabled:opacity-30"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                            {images.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => goTo(i)}
                                    className={`w-2 h-2 rounded-full transition-all ${i === currentIndex ? 'bg-teal-400 w-6' : 'bg-white/30 hover:bg-white/50'}`}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
            {/* Thumbnail strip */}
            {images.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-2 custom-scrollbar">
                    {images.map((img, i) => (
                        <button
                            key={i}
                            onClick={() => goTo(i)}
                            className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${i === currentIndex ? 'border-teal-500' : 'border-transparent opacity-50 hover:opacity-80'}`}
                        >
                            <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// Related Template Card
function RelatedCard({ name, slug, summary, category, thumbnail }) {
    const catMeta = getCategoryMeta(category);
    return (
        <Link to={`/templates/${slug}`} className="block group">
            <div className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-teal-500/20 hover:bg-white/[0.07] transition-all">
                <div className="w-20 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-slate-800">
                    {thumbnail ? (
                        <img src={thumbnail} alt={name} className="w-full h-full object-cover" />
                    ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${catMeta.color} opacity-20 flex items-center justify-center`}>
                            <Layers className="w-6 h-6 text-white/30" />
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-white group-hover:text-teal-400 transition-colors truncate">
                        {name}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">{summary}</p>
                </div>
            </div>
        </Link>
    );
}

export default function TemplateDetail() {
    const { slug } = useParams();
    const { openForm } = useModal();
    const [template, setTemplate] = useState(null);
    const [related, setRelated] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        setError(null);

        Promise.all([
            templatesService.getBySlug(slug),
            templatesService.getRelated(slug, 3),
        ])
            .then(([tmpl, rel]) => {
                if (tmpl) {
                    setTemplate(tmpl);
                    setRelated(rel);
                } else {
                    setError("Template không tồn tại.");
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching template:", err);
                setError("Không thể tải template.");
                setLoading(false);
            });
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
            </div>
        );
    }

    if (error || !template) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
                <Layers className="w-16 h-16 text-slate-700 mb-4" />
                <h2 className="text-2xl font-bold text-white mb-4">Oops!</h2>
                <p className="text-slate-400 mb-8">{error || "Không tìm thấy template."}</p>
                <Link to="/templates" className="text-teal-400 hover:text-teal-300 flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Quay lại Template Library
                </Link>
            </div>
        );
    }

    const catMeta = getCategoryMeta(template.category);
    const diffMeta = getDifficultyMeta(template.difficulty);
    const industries = (template.industry || '').split(',').map(i => i.trim()).filter(Boolean);

    return (
        <>
            <Helmet>
                <title>{template.name} | Lark Template | Mind.Transform</title>
                <meta name="description" content={template.summary} />
                <meta property="og:title" content={`${template.name} — Lark Template`} />
                <meta property="og:description" content={template.summary} />
                {template.thumbnail && <meta property="og:image" content={template.thumbnail} />}
            </Helmet>

            <div className="min-h-screen py-20 px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-12">
                    {/* Main Content */}
                    <div className="min-w-0">
                        <Link to="/templates" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors">
                            <ArrowLeft className="w-4 h-4" /> Quay lại Template Library
                        </Link>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            {/* Header */}
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                <span className={`px-3 py-1 text-xs font-medium ${catMeta.bgColor} ${catMeta.textColor} rounded-full border ${catMeta.borderColor}`}>
                                    {template.category}
                                </span>
                                {template.difficulty && (
                                    <span className={`px-3 py-1 text-xs font-medium ${diffMeta.bg} ${diffMeta.color} rounded-full border ${diffMeta.border}`}>
                                        {diffMeta.label}
                                    </span>
                                )}
                                {industries.map((ind, i) => (
                                    <span key={i} className="px-2 py-1 text-[10px] font-medium bg-white/5 text-slate-400 rounded-full border border-white/5">
                                        {ind}
                                    </span>
                                ))}
                            </div>

                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                                {template.name}
                            </h1>

                            <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                                {template.summary}
                            </p>

                            {/* Hero Image */}
                            {template.thumbnail && (
                                <div className="rounded-2xl overflow-hidden mb-10 border border-white/10">
                                    <img src={template.thumbnail} alt={template.name} className="w-full h-auto object-cover" />
                                </div>
                            )}

                            {/* Screenshots Gallery */}
                            <ScreenshotGallery screenshots={template.screenshots} name={template.name} />

                            {/* Use Case Section */}
                            {template.use_case && (
                                <div className="mb-10">
                                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                        <Sparkles className="w-5 h-5 text-teal-400" />
                                        Bài toán giải quyết
                                    </h2>
                                    <div className="bg-gradient-to-br from-teal-900/10 to-indigo-900/10 border border-white/5 rounded-2xl p-6">
                                        <div className="prose prose-invert prose-sm max-w-none prose-headings:text-white prose-a:text-teal-400 prose-strong:text-white">
                                            {isHTMLContent(template.use_case) ? (
                                                <div dangerouslySetInnerHTML={{ __html: template.use_case }} />
                                            ) : (
                                                <Markdown>{template.use_case}</Markdown>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Description Section */}
                            {template.description && (
                                <div className="mb-10">
                                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-teal-400" />
                                        Mô tả chi tiết
                                    </h2>
                                    <div className="prose prose-invert prose-lg max-w-none prose-headings:text-white prose-a:text-teal-400 hover:prose-a:text-teal-300 prose-strong:text-white">
                                        {isHTMLContent(template.description) ? (
                                            <div dangerouslySetInnerHTML={{ __html: template.description }} />
                                        ) : (
                                            <Markdown>{template.description}</Markdown>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Mobile CTA (shown on mobile only) */}
                            <div className="lg:hidden space-y-3 mt-8 mb-10">
                                {template.template_link && (
                                    <a
                                        href={template.template_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block w-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold py-4 px-6 rounded-xl text-center hover:shadow-lg hover:shadow-teal-500/20 transition-all flex items-center justify-center gap-2"
                                    >
                                        <ExternalLink className="w-5 h-5" /> Lấy Template
                                    </a>
                                )}
                                {template.form_link ? (
                                    <a
                                        href={template.form_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block w-full bg-white/5 border border-white/10 text-white font-bold py-4 px-6 rounded-xl text-center hover:bg-white/10 transition-all"
                                    >
                                        Đăng ký tư vấn triển khai
                                    </a>
                                ) : (
                                    <button
                                        onClick={openForm}
                                        className="w-full bg-white/5 border border-white/10 text-white font-bold py-4 px-6 rounded-xl text-center hover:bg-white/10 transition-all"
                                    >
                                        Đăng ký tư vấn triển khai
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </div>

                    {/* Sidebar */}
                    <div className="hidden lg:block space-y-6">
                        {/* CTA Card */}
                        <div className="sticky top-24 space-y-6">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 rounded-2xl p-6 shadow-xl"
                            >
                                <h3 className="text-lg font-bold text-white mb-4">Bắt đầu ngay</h3>

                                {template.template_link && (
                                    <a
                                        href={template.template_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group block w-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold py-3.5 px-6 rounded-xl text-center hover:shadow-lg hover:shadow-teal-500/20 transition-all mb-3 flex items-center justify-center gap-2"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        Lấy Template
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </a>
                                )}

                                {template.form_link ? (
                                    <a
                                        href={template.form_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block w-full bg-white/5 border border-white/10 text-white font-medium py-3 px-6 rounded-xl text-center hover:bg-white/10 transition-all text-sm"
                                    >
                                        📝 Đăng ký tư vấn triển khai
                                    </a>
                                ) : (
                                    <button
                                        onClick={openForm}
                                        className="w-full bg-white/5 border border-white/10 text-white font-medium py-3 px-6 rounded-xl text-center hover:bg-white/10 transition-all text-sm"
                                    >
                                        📝 Đăng ký tư vấn triển khai
                                    </button>
                                )}

                                <div className="mt-5 pt-5 border-t border-white/5 space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Danh mục</span>
                                        <span className={`font-medium ${catMeta.textColor}`}>{template.category}</span>
                                    </div>
                                    {template.difficulty && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">Mức độ</span>
                                            <span className={`font-medium ${diffMeta.color}`}>{diffMeta.label}</span>
                                        </div>
                                    )}
                                    {industries.length > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">Ngành</span>
                                            <span className="font-medium text-slate-300 text-right max-w-[180px]">{industries.join(', ')}</span>
                                        </div>
                                    )}
                                </div>
                            </motion.div>

                            {/* Related Templates */}
                            {related.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5, delay: 0.4 }}
                                    className="bg-slate-900/50 border border-white/5 rounded-2xl p-6"
                                >
                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Template liên quan</h3>
                                    <div className="space-y-3">
                                        {related.map((rel, i) => (
                                            <RelatedCard key={rel.slug || i} {...rel} />
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
