import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, User, ArrowRight, Loader2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getGoogleDriveImageUrl } from '../utils/imageHelper';

// URL Google Apps Script
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzTOHDWp8w7M5RtSXxA_lqkQTA_1pqGw_xyO_bPkj0I32P7ck5U5GGe4fBE77ZAM9xEhg/exec";

// Category Descriptions
const CATEGORY_INFO = {
    "Strategy": {
        title: "Chiến lược & Tư duy",
        desc: "Định hình tầm nhìn và lộ trình chuyển đổi số phù hợp với mô hình kinh doanh."
    },
    "Technology": {
        title: "Công nghệ & Giải pháp",
        desc: "Cập nhật các xu hướng công nghệ mới và đánh giá các giải pháp phần mềm."
    },
    "Methodology": {
        title: "Phương pháp luận",
        desc: "Các phương pháp quản trị hiện đại: Agile, Lean, Design Thinking..."
    },
    "Data": {
        title: "Dữ liệu & Phân tích",
        desc: "Khai thác sức mạnh của dữ liệu để ra quyết định chính xác."
    },
    "Case Study": {
        title: "Câu chuyện thành công",
        desc: "Bài học thực tế từ các dự án chuyển đổi số đã triển khai."
    }
};

const BlogPostCard = ({ title, summary, category, date, author, slug, image }) => (
    <Link to={`/blog/${slug}`} className="block h-full min-w-[300px] md:min-w-[350px] snap-start">
        <div className="group flex flex-col h-full bg-white/5 border border-white/5 rounded-2xl overflow-hidden hover:border-teal-500/30 transition-all hover:bg-white/[0.07]">
            <div className="h-48 bg-slate-800/50 relative overflow-hidden">
                {image ? (
                    <img
                        src={getGoogleDriveImageUrl(image)}
                        alt={title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-900/20 to-indigo-900/20 group-hover:scale-105 transition-transform duration-700" />
                )}
                <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 text-xs font-medium bg-teal-500/10 text-teal-400 rounded-full border border-teal-500/20">
                        {category}
                    </span>
                </div>
            </div>
            <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                    <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(date).toLocaleDateString('vi-VN')}
                    </div>
                    <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {author}
                    </div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-white group-hover:text-teal-400 transition-colors line-clamp-2">
                    {title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6 flex-1 line-clamp-3">
                    {summary}
                </p>
                <div className="flex items-center gap-2 text-sm font-medium text-teal-400 group-hover:gap-3 transition-all mt-auto">
                    Đọc tiếp <ArrowRight className="w-4 h-4" />
                </div>
            </div>
        </div>
    </Link>
);

const CategorySection = ({ category, posts }) => {
    const info = CATEGORY_INFO[category] || { title: category, desc: `Các bài viết về ${category}` };
    const scrollRef = React.useRef(null);

    const scroll = (direction) => {
        if (scrollRef.current) {
            const { current } = scrollRef;
            const scrollAmount = direction === 'left' ? -400 : 400;
            current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    if (posts.length === 0) return null;

    return (
        <div className="mb-16">
            <div className="flex items-end justify-between mb-6">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <span className="w-2 h-8 bg-teal-500 rounded-full inline-block"></span>
                        {info.title}
                    </h2>
                    <p className="text-slate-400 text-sm md:text-base max-w-2xl">
                        {info.desc}
                    </p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => scroll('left')} className="p-2 rounded-full border border-white/10 hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button onClick={() => scroll('right')} className="p-2 rounded-full border border-white/10 hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div
                ref={scrollRef}
                className="flex gap-6 overflow-x-auto pb-6 snap-x snap-mandatory custom-scrollbar scroll-smooth"
            >
                {posts.map((post, index) => (
                    <BlogPostCard key={index} {...post} />
                ))}
            </div>
        </div>
    );
};

export default function Blog() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetch(SCRIPT_URL)
            .then(res => res.json())
            .then(data => {
                const sortedData = Array.isArray(data) ? data.sort((a, b) => new Date(b.date) - new Date(a.date)) : [];
                setPosts(sortedData);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching posts:", err);
                setError("Không thể tải bài viết. Vui lòng thử lại sau.");
                setLoading(false);
            });
    }, []);

    // Filter posts by search term
    const filteredPosts = posts.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.summary.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Group posts by category
    const groupedPosts = filteredPosts.reduce((acc, post) => {
        const cat = post.category || 'Uncategorized';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(post);
        return acc;
    }, {});

    // Get list of categories (prioritize defined ones)
    const categories = [...Object.keys(CATEGORY_INFO), ...Object.keys(groupedPosts).filter(c => !CATEGORY_INFO[c])];

    return (
        <div className="py-20 px-6 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">
                        Góc nhìn <span className="text-teal-400">Mind.Transform</span>
                    </h1>
                    <p className="text-slate-400 max-w-2xl mx-auto text-lg mb-8">
                        Chia sẻ kiến thức, kinh nghiệm và góc nhìn về Chuyển đổi số, Quản trị và Công nghệ.
                    </p>

                    {/* Search Box */}
                    <div className="max-w-md mx-auto relative">
                        <input
                            type="text"
                            placeholder="Bạn đang tìm kiếm gì? (ví dụ: Lark Suite, CRM...)"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-900 border border-white/10 rounded-full px-6 py-3 pl-12 text-white focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all"
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    </div>
                </motion.div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
                    </div>
                ) : error ? (
                    <div className="text-center text-red-400 py-20">
                        {error}
                    </div>
                ) : filteredPosts.length === 0 ? (
                    <div className="text-center text-slate-500 py-20">
                        Không tìm thấy bài viết nào phù hợp.
                    </div>
                ) : (
                    <div className="space-y-8">
                        {categories.map(category => (
                            groupedPosts[category] && groupedPosts[category].length > 0 && (
                                <CategorySection
                                    key={category}
                                    category={category}
                                    posts={groupedPosts[category]}
                                />
                            )
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
