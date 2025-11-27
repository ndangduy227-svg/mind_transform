import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Send } from 'lucide-react';

export default function QuestionForm({ questions, onSubmit }) {
    const [answers, setAnswers] = useState({});
    const [email, setEmail] = useState('');

    const handleAnswerChange = (index, value) => {
        setAnswers(prev => ({
            ...prev,
            [`question_${index}`]: {
                question: questions[index],
                answer: value
            }
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (email && Object.keys(answers).length > 0) {
            onSubmit(answers, email);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full bg-slate-900/50 border border-white/10 rounded-3xl p-8 backdrop-blur-sm"
        >
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="w-8 h-8 bg-teal-500/20 text-teal-400 rounded-lg flex items-center justify-center text-sm font-bold">AI</span>
                Câu hỏi làm rõ vấn đề
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
                {questions.map((q, index) => (
                    <div key={index} className="space-y-2">
                        <label className="block text-sm font-medium text-slate-300">
                            {index + 1}. {q}
                        </label>
                        <input
                            type="text"
                            required
                            onChange={(e) => handleAnswerChange(index, e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all"
                            placeholder="Câu trả lời của bạn..."
                        />
                    </div>
                ))}

                <div className="pt-6 border-t border-white/10">
                    <label className="block text-sm font-medium text-white mb-2">
                        Email nhận bản Research & Proposal
                    </label>
                    <div className="flex gap-4">
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all"
                            placeholder="name@company.com"
                        />
                        <button
                            type="submit"
                            className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-8 py-3 rounded-xl transition-all flex items-center gap-2"
                        >
                            Gửi & Nhận kết quả
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                    <p className="text-xs text-slate-500 mt-3">
                        *Mind.Transform cam kết bảo mật thông tin doanh nghiệp của bạn.
                    </p>
                </div>
            </form>
        </motion.div>
    );
}
