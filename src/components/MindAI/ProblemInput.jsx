import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function ProblemInput({ onSubmit }) {
    const [text, setText] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (text.trim()) {
            onSubmit(text);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full"
        >
            <form onSubmit={handleSubmit} className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-indigo-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
                <div className="relative bg-slate-900 ring-1 ring-white/10 rounded-2xl p-2">
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Ví dụ: Quy trình quản lý kho hiện tại đang làm thủ công bằng Excel, số liệu thường xuyên bị lệch, nhân viên mất nhiều thời gian kiểm kê..."
                        className="w-full h-48 bg-transparent text-white placeholder:text-slate-500 p-6 text-lg focus:outline-none resize-none"
                    />
                    <div className="flex justify-between items-center px-6 pb-4 pt-2">
                        <span className="text-xs text-slate-500">
                            AI sẽ phân tích vấn đề của bạn để đưa ra các câu hỏi chuyên sâu.
                        </span>
                        <button
                            type="submit"
                            disabled={!text.trim()}
                            className="bg-white text-slate-900 hover:bg-teal-50 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 group/btn"
                        >
                            <Sparkles className="w-4 h-4 text-teal-600" />
                            Phân tích ngay
                            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </form>

            {/* Quick Suggestions */}
            <div className="mt-8 flex flex-wrap gap-3 justify-center">
                <p className="w-full text-center text-slate-500 text-sm mb-2">Hoặc chọn vấn đề phổ biến:</p>
                {[
                    "Quản lý nhân sự rời rạc, chấm công tính lương thủ công",
                    "Dữ liệu khách hàng nằm rải rác, không chăm sóc được",
                    "Quy trình duyệt chi nội bộ rườm rà, tốn thời gian",
                    "Không nắm được tồn kho theo thời gian thực"
                ].map((item, index) => (
                    <button
                        key={index}
                        onClick={() => setText(item)}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full text-sm text-slate-300 transition-colors"
                    >
                        {item}
                    </button>
                ))}
            </div>
        </motion.div>
    );
}
