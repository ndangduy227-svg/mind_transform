import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Zap, Layers, ArrowRight, ChevronDown } from 'lucide-react';

const FadeIn = ({ children, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay }}
    >
        {children}
    </motion.div>
);

export default function Home() {
    return (
        <>
            {/* Hero Section */}
            <section className="relative h-[calc(100vh-80px)] flex flex-col items-center justify-center px-6 overflow-hidden">
                {/* Background Gradient Blob */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-teal-900/20 rounded-full blur-[120px] -z-10" />

                <div className="max-w-5xl mx-auto text-center space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1 }}
                    >
                        <h1 className="text-6xl md:text-8xl font-bold tracking-tight leading-[1.1]">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-200 to-white">Mind leads.</span>
                            <br />
                            <span className="text-slate-500">Transform delivers.</span>
                        </h1>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 1 }}
                        className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed"
                    >
                        Đổi mới bắt đầu từ tư duy. Chúng tôi giúp doanh nghiệp định hình chiến lược vận hành tinh gọn trước khi chạm vào công nghệ.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1, duration: 1 }}
                        className="pt-8"
                    >
                        <button className="group relative px-8 py-4 bg-white text-slate-950 rounded-full font-semibold hover:bg-teal-50 transition-all flex items-center mx-auto gap-2">
                            Bắt đầu hành trình
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 1 }}
                    className="absolute bottom-10 animate-bounce text-slate-600"
                >
                    <ChevronDown className="w-6 h-6" />
                </motion.div>
            </section>

            {/* Philosophy Section */}
            <section className="py-32 px-6 border-t border-white/5 bg-slate-950">
                <div className="max-w-7xl mx-auto">
                    <FadeIn>
                        <div className="mb-20">
                            <span className="text-teal-500 text-sm font-bold tracking-widest uppercase">Triết lý của chúng tôi</span>
                            <h2 className="mt-4 text-4xl md:text-5xl font-bold max-w-3xl leading-tight">
                                Không thể <span className="text-slate-500 line-through decoration-teal-500/50">Transform</span> nếu <span className="text-teal-400">Mind</span> chưa rõ ràng.
                            </h2>
                        </div>
                    </FadeIn>

                    <div className="grid md:grid-cols-3 gap-12">
                        {/* Card 1 */}
                        <FadeIn delay={0.2}>
                            <div className="group p-8 rounded-2xl bg-white/5 border border-white/5 hover:border-teal-500/30 transition-all hover:bg-white/[0.07]">
                                <Brain className="w-10 h-10 text-teal-400 mb-6" />
                                <h3 className="text-xl font-bold mb-3">Mindset & Lean 6 Sigma</h3>
                                <p className="text-slate-400 leading-relaxed">
                                    Phân tích tận gốc vấn đề (Root Cause Analysis). Loại bỏ lãng phí trước khi số hóa. Chúng tôi không tự động hóa sự hỗn loạn.
                                </p>
                            </div>
                        </FadeIn>

                        {/* Card 2 */}
                        <FadeIn delay={0.4}>
                            <div className="group p-8 rounded-2xl bg-white/5 border border-white/5 hover:border-indigo-500/30 transition-all hover:bg-white/[0.07]">
                                <Layers className="w-10 h-10 text-indigo-400 mb-6" />
                                <h3 className="text-xl font-bold mb-3">Agile Strategy</h3>
                                <p className="text-slate-400 leading-relaxed">
                                    Chia nhỏ mục tiêu. Triển khai theo giai đoạn để tạo ra "Small Wins". Linh hoạt điều chỉnh thay vì kế hoạch cứng nhắc.
                                </p>
                            </div>
                        </FadeIn>

                        {/* Card 3 */}
                        <FadeIn delay={0.6}>
                            <div className="group p-8 rounded-2xl bg-white/5 border border-white/5 hover:border-blue-500/30 transition-all hover:bg-white/[0.07]">
                                <Zap className="w-10 h-10 text-blue-400 mb-6" />
                                <h3 className="text-xl font-bold mb-3">Transform & Tech</h3>
                                <p className="text-slate-400 leading-relaxed">
                                    Low-code & Automation (Lark, n8n, AI). Công nghệ phục vụ con người, giải quyết bài toán thực tế với chi phí tối ưu.
                                </p>
                            </div>
                        </FadeIn>
                    </div>
                </div>
            </section>

            {/* Quote / Transition */}
            <section className="py-24 px-6 bg-gradient-to-b from-slate-950 to-slate-900 border-t border-white/5">
                <div className="max-w-4xl mx-auto text-center">
                    <FadeIn>
                        <p className="text-2xl md:text-3xl font-light italic text-slate-300">
                            "Giá trị lớn nhất Mind.Transform mang lại không phải phần mềm, mà là định hướng, chiến lược và tư duy vận hành chuẩn."
                        </p>
                    </FadeIn>
                </div>
            </section>
        </>
    );
}
