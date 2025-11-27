import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, CheckCircle2, Loader2, Send, ArrowRight } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import UnderstandingScore from '../components/MindAI/UnderstandingScore';
import { GEMINI_API_KEY, SCRIPT_URL } from '../config';

export default function MindAI() {
    const [step, setStep] = useState('input'); // input, chatting, submitting, success
    const [history, setHistory] = useState([]); // Array of { user: string, ai: string }
    const [currentInput, setCurrentInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [aiData, setAiData] = useState({ analysis: '', score: 0, next_question: '' });
    const [email, setEmail] = useState('');
    const chatEndRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [history, loading]);

    const handleStart = async (e) => {
        e.preventDefault();
        if (!currentInput.trim()) return;

        const firstInput = currentInput;
        setStep('chatting');
        setLoading(true);
        setCurrentInput('');

        await processAI(firstInput, []);
    };

    const handleReply = async (e) => {
        e.preventDefault();
        if (!currentInput.trim()) return;

        const input = currentInput;
        const newHistory = [...history, { user: input, ai: aiData.next_question }];
        setHistory(newHistory);
        setCurrentInput('');
        setLoading(true);

        await processAI(input, newHistory);
    };

    const processAI = async (input, currentHistory) => {
        try {
            // Construct Prompt
            let conversationContext = "";
            if (currentHistory.length > 0) {
                conversationContext = "Lịch sử hội thoại:\n" + currentHistory.map(h => `User: ${h.user}\nAI: ${h.ai}`).join("\n") + "\n";
            }

            const prompt = `
                Role: Bạn là "Business Transformation Manager" của Mind.Transform.
                Bạn không chỉ là người hỏi, bạn là một đối tác chiến lược: sắc sảo, thực tế và hướng tới giải pháp.

                MIND.TRANSFORM CORE VALUES & PHILOSOPHY:
                Hãy để các giá trị sau đây dẫn dắt cách bạn phân tích và đặt câu hỏi:
                1. Thực chiến (Pragmatism): Chúng ta là Agency tập trung vào phân tích và triển khai, không vẽ bánh vẽ. Mọi vấn đề cần được nhìn nhận dưới góc độ "Làm thế nào để áp dụng vào thực tế?".
                2. Trung lập về Công nghệ (Tech Agnostic): Chúng ta tận dụng các Product có sẵn trên thị trường để giải quyết bài toán, không cố bán một giải pháp duy nhất. Hãy tìm ra "nỗi đau" thực sự trước khi nói về công cụ.
                3. Đồng hành (Empathy): Luôn đặt mình vào vị trí của chủ doanh nghiệp để thấu hiểu áp lực của họ.
                4. Minh bạch (Integrity): Tư vấn thẳng thắn, không ngại chỉ ra điểm yếu trong quy trình hiện tại của khách hàng.

                Context:
                ${conversationContext}

                User Input mới nhất: "${input}"

                Task:
                1. Phân tích (Analyze):
                   - Đọc hiểu vấn đề của User qua lăng kính của Core Values (Ví dụ: Nếu User muốn làm app khổng lồ, hãy dùng tư duy "Thực chiến" để hỏi về tính khả thi và nguồn lực trước).
                   - Xác định User đang ở giai đoạn nào: Mơ hồ, Đã có kế hoạch, hay Đang gặp khủng hoảng?

                2. Đánh giá "Mức độ thấu hiểu" (Understanding Score 0-100%):
                   - < 50%: Thông tin còn sơ sài -> Cần hỏi rộng để nắm bối cảnh.
                   - 50-80%: Đã nắm được nỗi đau chính -> Cần hỏi sâu vào chi tiết (quy trình, nhân sự, budget).
                   - > 80%: Đã đủ dữ liệu để đề xuất giải pháp -> Gợi ý User kết thúc để nhận Proposal (nhưng không ép buộc).

                3. Phản hồi (Response):
                   - Tuyệt đối không trả lời chung chung như AI (chatGPT style).
                   - Short Analysis: Đưa ra một nhận định sắc bén thể hiện chuyên môn của Mind.Transform ngay lập tức.
                   - Next Question: Đặt 01 câu hỏi đắt giá nhất để khai thác thông tin ("Kill question").
                   - Tone: Chuyên nghiệp nhưng gần gũi (Professional & Conversational).

                Output Format (JSON only, no markdown, no explanation outside JSON):
                {
                  "analysis": "Nhận định ngắn gọn (1-2 câu), lồng ghép tư duy Core Value của Mind.Transform vào đây.",
                  "score": 0,
                  "next_question": "Câu hỏi tiếp theo (Ngắn gọn, trực diện, gợi mở)."
                }
            `;

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error.message);
            }

            let text = data.candidates[0].content.parts[0].text;
            text = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const result = JSON.parse(text);

            setAiData(result);
            setLoading(false);

        } catch (err) {
            console.error("AI Error:", err);
            alert("Lỗi kết nối AI: " + err.message);
            setLoading(false);
        }
    };

    const handleFinish = async (e) => {
        e.preventDefault();
        if (!email) return;

        setStep('submitting');
        try {
            await fetch(SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({
                    action: 'submit_research',
                    email,
                    history: [...history, { user: "FINISHED", ai: "FINISHED" }]
                })
            });
            setStep('success');
        } catch (err) {
            setStep('chatting'); // Revert on error
            alert("Có lỗi xảy ra. Vui lòng thử lại.");
        }
    };

    return (
        <>
            <Helmet>
                <title>Mind AI Agent | Tư vấn Chuyển đổi số</title>
            </Helmet>

            <div className="min-h-screen pt-24 pb-12 px-4 md:px-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black overflow-hidden relative">
                {/* Background */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-teal-500/10 blur-[120px] rounded-full pointer-events-none" />

                <div className="max-w-4xl mx-auto relative z-10">
                    <AnimatePresence mode="wait">
                        {step === 'input' && (
                            <motion.div
                                key="input"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="text-center py-10"
                            >
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-teal-400 text-sm font-medium mb-8">
                                    <Sparkles className="w-4 h-4" />
                                    Powered by Gemini 2.0 Flash
                                </div>
                                <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                                    Mind AI Agent
                                </h1>
                                <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-12">
                                    Tôi là Business Transformation Manager ảo của bạn. Hãy chia sẻ bất kỳ vấn đề nào doanh nghiệp đang gặp phải, tôi sẽ lắng nghe và phân tích cùng bạn.
                                </p>

                                <form onSubmit={handleStart} className="max-w-2xl mx-auto relative group">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-indigo-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000" />
                                    <div className="relative bg-slate-900 ring-1 ring-white/10 rounded-2xl p-2">
                                        <textarea
                                            value={currentInput}
                                            onChange={(e) => setCurrentInput(e.target.value)}
                                            placeholder="Ví dụ: Nhân viên của tôi tốn quá nhiều thời gian nhập liệu thủ công..."
                                            className="w-full h-32 bg-transparent text-white placeholder:text-slate-500 p-4 text-lg focus:outline-none resize-none"
                                        />
                                        <div className="flex justify-end px-4 pb-2">
                                            <button
                                                type="submit"
                                                disabled={!currentInput.trim()}
                                                className="bg-white text-slate-900 hover:bg-teal-50 disabled:opacity-50 px-6 py-2 rounded-xl font-bold transition-all flex items-center gap-2"
                                            >
                                                Bắt đầu tư vấn <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </motion.div>
                        )}

                        {step === 'chatting' && (
                            <motion.div
                                key="chatting"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8"
                            >
                                {/* Chat Area */}
                                <div className="flex flex-col h-[600px] bg-slate-900/50 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm">
                                    {/* Messages */}
                                    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                                        {history.map((msg, idx) => (
                                            <div key={idx} className="space-y-4">
                                                {/* User Msg */}
                                                <div className="flex justify-end">
                                                    <div className="bg-white/10 text-white px-5 py-3 rounded-2xl rounded-tr-none max-w-[80%]">
                                                        {msg.user}
                                                    </div>
                                                </div>
                                                {/* AI Msg (Previous) */}
                                                <div className="flex justify-start gap-3">
                                                    <div className="w-8 h-8 bg-teal-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                                                        <Brain className="w-4 h-4 text-teal-400" />
                                                    </div>
                                                    <div className="bg-slate-800/50 border border-white/5 text-slate-200 px-5 py-3 rounded-2xl rounded-tl-none max-w-[90%]">
                                                        {msg.ai}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Current AI Response */}
                                        {loading ? (
                                            <div className="flex justify-start gap-3">
                                                <div className="w-8 h-8 bg-teal-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <Brain className="w-4 h-4 text-teal-400" />
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-400 text-sm py-2">
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Đang phân tích vấn đề...
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex justify-start gap-3">
                                                <div className="w-8 h-8 bg-teal-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <Brain className="w-4 h-4 text-teal-400" />
                                                </div>
                                                <div className="space-y-2 max-w-[90%]">
                                                    {/* Analysis Box */}
                                                    {aiData.analysis && (
                                                        <div className="text-xs font-medium text-teal-400 uppercase tracking-wider mb-1">
                                                            Góc nhìn chuyên gia
                                                        </div>
                                                    )}
                                                    <div className="bg-slate-800/80 border border-teal-500/20 text-slate-200 px-5 py-4 rounded-2xl rounded-tl-none shadow-lg shadow-teal-900/10">
                                                        {aiData.analysis && (
                                                            <p className="text-slate-400 text-sm mb-3 italic border-l-2 border-teal-500/30 pl-3">
                                                                "{aiData.analysis}"
                                                            </p>
                                                        )}
                                                        <p className="font-medium text-white">
                                                            {aiData.next_question}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        <div ref={chatEndRef} />
                                    </div>

                                    {/* Input Area */}
                                    <div className="p-4 bg-slate-950 border-t border-white/5">
                                        <form onSubmit={handleReply} className="relative">
                                            <input
                                                type="text"
                                                value={currentInput}
                                                onChange={(e) => setCurrentInput(e.target.value)}
                                                placeholder="Nhập câu trả lời của bạn..."
                                                className="w-full bg-slate-900 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-white focus:outline-none focus:border-teal-500/50 transition-all"
                                                disabled={loading}
                                            />
                                            <button
                                                type="submit"
                                                disabled={!currentInput.trim() || loading}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-teal-400 hover:bg-teal-500/10 rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                <Send className="w-5 h-5" />
                                            </button>
                                        </form>
                                    </div>
                                </div>

                                {/* Sidebar Info */}
                                <div className="space-y-6">
                                    {/* Score Card */}
                                    <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-6 backdrop-blur-sm flex flex-col items-center text-center">
                                        <h3 className="text-sm font-medium text-slate-400 mb-4">Mức độ thấu hiểu</h3>
                                        <UnderstandingScore score={aiData.score} />
                                        <p className="text-xs text-slate-500 mt-4">
                                            Cung cấp thêm thông tin để AI hiểu rõ bối cảnh doanh nghiệp của bạn.
                                        </p>
                                    </div>

                                    {/* CTA Card */}
                                    <div className="bg-gradient-to-br from-teal-900/20 to-indigo-900/20 border border-white/10 rounded-3xl p-6">
                                        <h3 className="text-white font-bold mb-2">Đã đủ thông tin?</h3>
                                        <p className="text-sm text-slate-400 mb-4">
                                            Nếu bạn muốn nhận bản đề xuất giải pháp ngay bây giờ.
                                        </p>

                                        {!email ? (
                                            <div className="space-y-3">
                                                <input
                                                    type="email"
                                                    placeholder="Nhập email của bạn"
                                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500/50"
                                                    onChange={(e) => setEmail(e.target.value)}
                                                />
                                                <button
                                                    onClick={handleFinish}
                                                    disabled={!email}
                                                    className="w-full bg-white text-slate-900 font-bold py-2 rounded-lg text-sm hover:bg-teal-50 disabled:opacity-50 transition-colors"
                                                >
                                                    Kết thúc & Nhận Proposal
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={handleFinish}
                                                className="w-full bg-teal-500 text-white font-bold py-2 rounded-lg text-sm hover:bg-teal-400 transition-colors"
                                            >
                                                Xác nhận gửi
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 'submitting' && (
                            <motion.div
                                key="submitting"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-center justify-center py-20 text-center"
                            >
                                <Loader2 className="w-12 h-12 text-teal-500 animate-spin mb-6" />
                                <h3 className="text-xl font-medium text-white">Đang tổng hợp dữ liệu...</h3>
                            </motion.div>
                        )}

                        {step === 'success' && (
                            <motion.div
                                key="success"
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="bg-gradient-to-br from-teal-900/20 to-slate-900/50 border border-teal-500/30 rounded-3xl p-10 text-center max-w-2xl mx-auto"
                            >
                                <div className="w-20 h-20 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle2 className="w-10 h-10 text-teal-400" />
                                </div>
                                <h2 className="text-3xl font-bold text-white mb-4">Đã gửi yêu cầu thành công!</h2>
                                <p className="text-slate-300 mb-8 leading-relaxed">
                                    Cảm ơn bạn đã dành thời gian trao đổi. Dựa trên <strong>{history.length} điểm dữ liệu</strong> thu thập được, Mind.Transform sẽ xây dựng một bản Proposal chi tiết và gửi tới email <strong>{email}</strong> trong thời gian sớm nhất.
                                </p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-colors border border-white/10"
                                >
                                    Quay về trang chủ
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </>
    );
}
