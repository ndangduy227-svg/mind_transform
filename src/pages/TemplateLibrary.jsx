import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, ArrowRight, Filter, X, Layers, Sparkles, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { templates as templatesService } from '../services/cmsService';

// Category metadata with icons and colors
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

// Template Card Component
const TemplateCard = ({ name, slug, summary, category, industry, thumbnail, difficulty, delay = 0 }) => {
    const catMeta = getCategoryMeta(category);
    const diffMeta = getDifficultyMeta(difficulty);
    const industries = (industry || '').split(',').map(i => i.trim()).filter(Boolean);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, delay: delay * 0.05 }}
        >
            <Link to={`/templates/${slug}`} className="block h-full group">
                <div className="flex flex-col h-full bg-white/5 border border-white/5 rounded-2xl overflow-hidden hover:border-teal-500/30 transition-all duration-300 hover:bg-white/[0.07] hover:shadow-lg hover:shadow-teal-900/10">
                    {/* Thumbnail */}
                    <div className="h-48 bg-slate-800/50 relative overflow-hidden">
                        {thumbnail ? (
                            <img
                                src={thumbnail}
                                alt={name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                loading="lazy"
                            />
                        ) : (
                            <div className={`absolute inset-0 bg-gradient-to-br ${catMeta.color} opacity-10 group-hover:opacity-20 transition-opacity duration-500`}>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Layers className="w-16 h-16 text-white/20" />
                                </div>
                            </div>
                        )}
                        {/* Category badge */}
                        <div className="absolute top-4 left-4">
                            <span className={`px-3 py-1 text-xs font-medium ${catMeta.bgColor} ${catMeta.textColor} rounded-full border ${catMeta.borderColor}`}>
                                {category}
                            </span>
                        </div>
                        {/* Difficulty badge */}
                        {difficulty && (
                            <div className="absolute top-4 right-4">
                                <span className={`px-2 py-1 text-[10px] font-medium ${diffMeta.bg} ${diffMeta.color} rounded-full border ${diffMeta.border}`}>
                                    {diffMeta.label}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="p-6 flex-1 flex flex-col">
                        <h3 className="text-lg font-bold mb-2 text-white group-hover:text-teal-400 transition-colors line-clamp-2">
                            {name}
                        </h3>
                        <p className="text-slate-400 text-sm leading-relaxed mb-4 flex-1 line-clamp-3">
                            {summary}
                        </p>

                        {/* Industry tags */}
                        {industries.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-4">
                                {industries.slice(0, 3).map((ind, i) => (
                                    <span key={i} className="px-2 py-0.5 text-[10px] font-medium bg-white/5 text-slate-400 rounded-full border border-white/5">
                                        {ind}
                                    </span>
                                ))}
                                {industries.length > 3 && (
                                    <span className="px-2 py-0.5 text-[10px] text-slate-500 rounded-full">
                                        +{industries.length - 3}
                                    </span>
                                )}
                            </div>
                        )}

                        <div className="flex items-center gap-2 text-sm font-medium text-teal-400 group-hover:gap-3 transition-all mt-auto">
                            Xem chi tiết <ArrowRight className="w-4 h-4" />
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};

// Filter Pill Component
const FilterPill = ({ label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${active
                ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                : 'bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10 hover:text-white'
            }`}
    >
        {label}
    </button>
);

export default function TemplateLibrary() {
    const [allTemplates, setAllTemplates] = useState([]);
    const [filteredTemplates, setFilteredTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedIndustry, setSelectedIndustry] = useState('');
    const [selectedDifficulty, setSelectedDifficulty] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // Derived data
    const [categories, setCategories] = useState([]);
    const [industries, setIndustries] = useState([]);

    useEffect(() => {
        loadTemplates();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [allTemplates, searchTerm, selectedCategory, selectedIndustry, selectedDifficulty]);

    const loadTemplates = async () => {
        try {
            const [data, cats, inds] = await Promise.all([
                templatesService.getAll(),
                templatesService.getCategories(),
                templatesService.getIndustries(),
            ]);
            setAllTemplates(data);
            setCategories(cats);
            setIndustries(inds);
            setLoading(false);
        } catch (err) {
            console.error("Error loading templates:", err);
            setError("Không thể tải danh sách template. Vui lòng thử lại sau.");
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let result = [...allTemplates];

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(t =>
                (t.name || '').toLowerCase().includes(term) ||
                (t.summary || '').toLowerCase().includes(term)
            );
        }
        if (selectedCategory) {
            result = result.filter(t => t.category === selectedCategory);
        }
        if (selectedIndustry) {
            result = result.filter(t => {
                const inds = (t.industry || '').split(',').map(i => i.trim());
                return inds.includes(selectedIndustry);
            });
        }
        if (selectedDifficulty) {
            result = result.filter(t => t.difficulty === selectedDifficulty);
        }

        setFilteredTemplates(result);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedCategory('');
        setSelectedIndustry('');
        setSelectedDifficulty('');
    };

    const hasActiveFilters = searchTerm || selectedCategory || selectedIndustry || selectedDifficulty;

    return (
        <>
            <Helmet>
                <title>Thư viện Lark Templates | Mind.Transform</title>
                <meta name="description" content="Thư viện template Lark Suite miễn phí cho doanh nghiệp: CRM, HR, Project Management, Finance, Operations." />
                <link rel="canonical" href="https://mind-transform.vercel.app/templates" />
                <meta property="og:title" content="Thư viện Lark Templates | Mind.Transform" />
                <meta property="og:description" content="Thư viện template Lark Suite miễn phí cho doanh nghiệp." />
                <meta property="og:url" content="https://mind-transform.vercel.app/templates" />
                <meta property="og:type" content="website" />
                <meta name="twitter:card" content="summary_large_image" />
            </Helmet>

            <div className="py-20 px-6 min-h-screen">
                <div className="max-w-7xl mx-auto">
                    {/* Hero */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-16"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-sm font-medium mb-6">
                            <Sparkles className="w-4 h-4" />
                            Powered by Lark Suite
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">
                            Lark <span className="text-teal-400">Template</span> Library
                        </h1>
                        <p className="text-slate-400 max-w-2xl mx-auto text-lg mb-8">
                            Thư viện template Lark được thiết kế sẵn cho từng bài toán kinh doanh.
                            Chọn use case phù hợp, lấy template và bắt đầu triển khai ngay.
                        </p>

                        {/* Search */}
                        <div className="max-w-lg mx-auto relative">
                            <input
                                type="text"
                                placeholder="Tìm kiếm template... (ví dụ: CRM, quản lý kho...)"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-900 border border-white/10 rounded-full px-6 py-3.5 pl-12 text-white focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all"
                            />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors"
                                >
                                    <X className="w-4 h-4 text-slate-400" />
                                </button>
                            )}
                        </div>
                    </motion.div>

                    {/* Filter Section */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="mb-10"
                    >
                        {/* Filter toggle + Category pills */}
                        <div className="flex items-center gap-3 mb-4 flex-wrap">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border ${showFilters
                                        ? 'bg-white/10 text-white border-white/20'
                                        : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'
                                    }`}
                            >
                                <Filter className="w-4 h-4" />
                                Bộ lọc
                                <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                            </button>

                            <FilterPill label="Tất cả" active={!selectedCategory} onClick={() => setSelectedCategory('')} />
                            {categories.map(cat => (
                                <FilterPill
                                    key={cat}
                                    label={cat}
                                    active={selectedCategory === cat}
                                    onClick={() => setSelectedCategory(selectedCategory === cat ? '' : cat)}
                                />
                            ))}
                        </div>

                        {/* Extended Filters */}
                        <AnimatePresence>
                            {showFilters && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 space-y-4">
                                        {/* Industry */}
                                        {industries.length > 0 && (
                                            <div>
                                                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 block">Ngành nghề</label>
                                                <div className="flex flex-wrap gap-2">
                                                    <FilterPill label="Tất cả" active={!selectedIndustry} onClick={() => setSelectedIndustry('')} />
                                                    {industries.map(ind => (
                                                        <FilterPill
                                                            key={ind}
                                                            label={ind}
                                                            active={selectedIndustry === ind}
                                                            onClick={() => setSelectedIndustry(selectedIndustry === ind ? '' : ind)}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Difficulty */}
                                        <div>
                                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 block">Mức độ</label>
                                            <div className="flex flex-wrap gap-2">
                                                <FilterPill label="Tất cả" active={!selectedDifficulty} onClick={() => setSelectedDifficulty('')} />
                                                {['Beginner', 'Intermediate', 'Advanced'].map(diff => (
                                                    <FilterPill
                                                        key={diff}
                                                        label={getDifficultyMeta(diff).label}
                                                        active={selectedDifficulty === diff}
                                                        onClick={() => setSelectedDifficulty(selectedDifficulty === diff ? '' : diff)}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        {hasActiveFilters && (
                                            <button
                                                onClick={clearFilters}
                                                className="text-sm text-teal-400 hover:text-teal-300 flex items-center gap-1 transition-colors"
                                            >
                                                <X className="w-3 h-3" /> Xoá bộ lọc
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* Results */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 text-teal-500 animate-spin mb-4" />
                            <p className="text-slate-500 text-sm">Đang tải template...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center text-red-400 py-20">
                            {error}
                        </div>
                    ) : filteredTemplates.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-20"
                        >
                            <Layers className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">Không tìm thấy template</h3>
                            <p className="text-slate-500 mb-6">
                                {hasActiveFilters
                                    ? 'Thử thay đổi bộ lọc hoặc từ khoá tìm kiếm.'
                                    : 'Chưa có template nào được publish.'}
                            </p>
                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white rounded-full text-sm font-medium border border-white/10 transition-all"
                                >
                                    Xoá bộ lọc
                                </button>
                            )}
                        </motion.div>
                    ) : (
                        <>
                            {/* Count */}
                            <div className="flex items-center justify-between mb-6">
                                <p className="text-sm text-slate-500">
                                    Hiển thị <span className="text-white font-medium">{filteredTemplates.length}</span> template
                                    {hasActiveFilters && (
                                        <span> (đã lọc)</span>
                                    )}
                                </p>
                            </div>

                            {/* Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <AnimatePresence>
                                    {filteredTemplates.map((template, index) => (
                                        <TemplateCard key={template.slug || index} {...template} delay={index} />
                                    ))}
                                </AnimatePresence>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
