import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, CheckCircle2, Loader2, Send, ArrowRight, MessageSquare, ExternalLink, AlertTriangle } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import UnderstandingScore from '../components/MindAI/UnderstandingScore';
import TagSelector from '../components/admin/TagSelector';
import { INDUSTRIES, DEPARTMENTS, COMPANY_SIZES, MAX_CHAT_MESSAGES, ZALO_CONTACT } from '../constants/mindai';
import { supabase } from '../lib/supabase';
import { createChatRequest, createConsultationLead, normalizeAIResponse } from '../utils/consultation';

export default function MindAI() {
    const [step, setStep] = useState('intake'); // intake, chatting, submitting, success
    const [history, setHistory] = useState([]);
    const [currentInput, setCurrentInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [aiData, setAiData] = useState({ analysis: '', score: 0, next_question: '', suggested_links: [] });
    const [email, setEmail] = useState('');
    const [contactName, setContactName] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [chatError, setChatError] = useState('');
    const [submitError, setSubmitError] = useState('');
    const [pendingMessage, setPendingMessage] = useState('');
    const messageCount = history.length;
    const [showLimitModal, setShowLimitModal] = useState(false);
    const chatEndRef = useRef(null);

    // Intake form state
    const [intakeForm, setIntakeForm] = useState({
        industry: '',
        companySize: '',
        departments: [],
        website: '',
    });

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [history, loading]);

    const handleIntakeSubmit = async (e) => {
        e.preventDefault();
        if (!currentInput.trim() || loading) return;

        const firstMessage = currentInput;
        const newCount = 1;
        setStep('chatting');
        setLoading(true);
        setCurrentInput('');

        await processAI(firstMessage, [], newCount);
    };

    const handleReply = async (e) => {
        e.preventDefault();
        if (!currentInput.trim() || loading) return;

        if (messageCount >= MAX_CHAT_MESSAGES) {
            setShowLimitModal(true);
            return;
        }

        const input = currentInput;
        const newHistory = history;
        const newCount = messageCount + 1;
        setCurrentInput('');
        setLoading(true);

        await processAI(input, newHistory, newCount);
    };

    const processAI = async (input, currentHistory, count) => {
        setChatError('');
        setPendingMessage(input);
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(createChatRequest(input, currentHistory, intakeForm)),
                signal: AbortSignal.timeout(30000),
            });

            const result = await response.json();

            if (result.error === 'rate_limited') {
                setShowLimitModal(true);
                setChatError(result.message || 'Bạn đã hết lượt tư vấn.');
                setCurrentInput(input);
                return;
            }

            if (!response.ok) {
                throw new Error(result.error || 'Server error');
            }

            const answer = normalizeAIResponse(result);
            if (!answer.analysis && !answer.next_question) throw new Error('Chưa nhận được câu trả lời. Vui lòng thử lại.');
            setAiData(answer);
            setHistory([...currentHistory, { user: input, ai: [answer.analysis, answer.next_question].filter(Boolean).join('\n\n') }]);

            if (count >= MAX_CHAT_MESSAGES) {
                setShowLimitModal(true);
            }
        } catch (err) {
            setChatError(err.name === 'TimeoutError' ? 'Phản hồi mất quá lâu. Bạn có thể gửi lại nội dung bên dưới.' : 'Chưa kết nối được với Mind AI. Vui lòng thử lại hoặc liên hệ qua Zalo.');
            setCurrentInput(input);
        } finally {
            setLoading(false);
            setPendingMessage('');
        }
    };

    const handleFinish = async (e) => {
        e.preventDefault();
        if (loading || step === 'submitting' || !history.length) return;

        setSubmitError('');
        try {
            const lead = createConsultationLead({ name: contactName, email, phone: contactPhone, intakeForm, history });
            setStep('submitting');
            const { error } = await supabase.from('leads').insert([lead]);
            if (error) throw error;
            setStep('success');
        } catch (err) {
            setStep('chatting');
            setSubmitError('Chưa lưu được yêu cầu. Thông tin của bạn vẫn còn, vui lòng thử lại hoặc liên hệ qua Zalo.');
        }
    };

    const isIntakeValid = currentInput.trim() && intakeForm.industry && intakeForm.companySize;
    const isInputDisabled = loading || messageCount >= MAX_CHAT_MESSAGES;

    return (
        <>
            <Helmet>
                <title>Mind AI Agent | Tư vấn Chuyển đổi số miễn phí</title>
                <meta name="description" content="AI Agent tư vấn chuyển đổi số miễn phí cho doanh nghiệp. Phân tích vấn đề, đề xuất giải pháp từ Mind.Transform." />
                <link rel="canonical" href="https://mind-transform.vercel.app/mind-ai" />
                <meta property="og:title" content="Mind AI Agent | Tư vấn Chuyển đổi số" />
                <meta property="og:description" content="AI Agent tư vấn chuyển đổi số miễn phí cho doanh nghiệp." />
                <meta property="og:url" content="https://mind-transform.vercel.app/mind-ai" />
                <meta property="og:type" content="website" />
                <meta name="twitter:card" content="summary_large_image" />
            </Helmet>

            <div className="min-h-screen pt-24 pb-12 px-4 md:px-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black overflow-hidden relative">
                {/* Background glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-teal-500/10 blur-[120px] rounded-full pointer-events-none" />

                <div className="max-w-5xl mx-auto relative z-10">
                    <AnimatePresence mode="wait">
                        {/* ─────────────── INTAKE FORM ─────────────── */}
                        {step === 'intake' && (
                            <motion.div
                                key="intake"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="py-10"
                            >
                                {/* Hero header */}
                                <div className="text-center mb-10">
                                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-teal-400 text-sm font-medium mb-8">
                                        <Sparkles className="w-4 h-4" />
                                        Powered by Llama 3.3 70B
                                    </div>
                                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                                        Mind AI Agent
                                    </h1>
                                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                                        Tôi là Business Transformation Manager ảo của bạn. Hãy cho tôi biết về doanh nghiệp và vấn đề bạn đang gặp phải.
                                    </p>
                                </div>

                                {/* Intake form */}
                                <form onSubmit={handleIntakeSubmit} className="relative group">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-indigo-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000" />
                                    <div className="relative bg-slate-900/80 ring-1 ring-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-sm">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                            {/* Left column — form fields */}
                                            <div className="space-y-5">
                                                <h2 className="text-white font-semibold text-lg flex items-center gap-2 mb-1">
                                                    <Brain className="w-5 h-5 text-teal-400" />
                                                    Thông tin doanh nghiệp
                                                </h2>

                                                {/* Industry */}
                                                <div>
                                                    <label htmlFor="mindai-industry" className="block text-xs font-medium text-slate-400 mb-2">
                                                        Ngành nghề <span className="text-red-400">*</span>
                                                    </label>
                                                    <select
                                                        id="mindai-industry" required
                                                        value={intakeForm.industry}
                                                        onChange={(e) => setIntakeForm({ ...intakeForm, industry: e.target.value })}
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-teal-500/50 transition-all appearance-none cursor-pointer"
                                                    >
                                                        <option value="" disabled className="bg-slate-900 text-slate-400">
                                                            Chọn ngành nghề
                                                        </option>
                                                        {INDUSTRIES.map((ind) => (
                                                            <option key={ind} value={ind} className="bg-slate-900 text-white">
                                                                {ind}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {/* Company size */}
                                                <div>
                                                    <label htmlFor="mindai-size" className="block text-xs font-medium text-slate-400 mb-2">
                                                        Quy mô <span className="text-red-400">*</span>
                                                    </label>
                                                    <select
                                                        id="mindai-size" required
                                                        value={intakeForm.companySize}
                                                        onChange={(e) => setIntakeForm({ ...intakeForm, companySize: e.target.value })}
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-teal-500/50 transition-all appearance-none cursor-pointer"
                                                    >
                                                        <option value="" disabled className="bg-slate-900 text-slate-400">
                                                            Chọn quy mô
                                                        </option>
                                                        {COMPANY_SIZES.map((size) => (
                                                            <option key={size} value={size} className="bg-slate-900 text-white">
                                                                {size}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {/* Departments — pill multi-select */}
                                                <TagSelector
                                                    label="Phòng ban quan tâm"
                                                    options={DEPARTMENTS}
                                                    selected={intakeForm.departments}
                                                    onChange={(deps) => setIntakeForm({ ...intakeForm, departments: deps })}
                                                    columns={3}
                                                />

                                                {/* Website */}
                                                <div>
                                                    <label htmlFor="mindai-website" className="block text-xs font-medium text-slate-400 mb-2">
                                                        Website (tuỳ chọn)
                                                    </label>
                                                    <input
                                                        id="mindai-website" maxLength={500}
                                                        type="url"
                                                        value={intakeForm.website}
                                                        onChange={(e) => setIntakeForm({ ...intakeForm, website: e.target.value })}
                                                        placeholder="https://congty.vn"
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500/50 transition-all"
                                                    />
                                                </div>
                                            </div>

                                            {/* Right column — first question textarea */}
                                            <div className="flex flex-col">
                                                <h2 className="text-white font-semibold text-lg flex items-center gap-2 mb-4">
                                                    <MessageSquare className="w-5 h-5 text-teal-400" />
                                                    Câu hỏi của bạn
                                                </h2>
                                                <div className="flex-1 flex flex-col">
                                                    <textarea
                                                        aria-label="Câu hỏi của bạn" maxLength={4000}
                                                        value={currentInput}
                                                        onChange={(e) => setCurrentInput(e.target.value)}
                                                        placeholder="Ví dụ: Nhân viên của tôi tốn quá nhiều thời gian nhập liệu thủ công, tôi muốn tự động hoá quy trình..."
                                                        className="flex-1 min-h-[200px] w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-teal-500/50 resize-none transition-all"
                                                        required
                                                    />
                                                    <p className="text-xs text-slate-500 mt-2">
                                                        Mô tả chi tiết vấn đề để nhận phân tích chính xác hơn.
                                                    </p>
                                                </div>

                                                <button
                                                    type="submit"
                                                    disabled={!isIntakeValid}
                                                    className="mt-4 w-full bg-white text-slate-900 hover:bg-teal-50 disabled:opacity-40 disabled:cursor-not-allowed px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm"
                                                >
                                                    Bắt đầu tư vấn <ArrowRight className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </motion.div>
                        )}

                        {/* ─────────────── CHAT VIEW ─────────────── */}
                        {step === 'chatting' && (
                            <motion.div
                                key="chatting"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8"
                            >
                                {/* Chat area */}
                                <div className="flex flex-col h-[650px] bg-slate-900/50 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm">
                                    {/* Messages */}
                                    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                                        {(loading ? history : history.slice(0, -1)).map((msg, idx) => (
                                            <div key={idx} className="space-y-4">
                                                {/* User message */}
                                                <div className="flex justify-end">
                                                    <div className="bg-white/10 text-white px-5 py-3 rounded-2xl rounded-tr-none max-w-[80%]">
                                                        {msg.user}
                                                    </div>
                                                </div>
                                                {/* AI message (previous turn) */}
                                                <div className="flex justify-start gap-3">
                                                    <div className="w-8 h-8 bg-teal-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                                                        <Brain className="w-4 h-4 text-teal-400" />
                                                    </div>
                                                    <div className="bg-slate-800/50 border border-white/5 text-slate-200 px-5 py-3 rounded-2xl rounded-tl-none max-w-[90%] whitespace-pre-wrap break-words">
                                                        {msg.ai}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {((loading && pendingMessage) || (!loading && history.length > 0)) && (
                                            <div className="flex justify-end">
                                                <div className="bg-white/10 text-white px-5 py-3 rounded-2xl rounded-tr-none max-w-[80%] break-words">
                                                    {loading ? pendingMessage : history[history.length - 1].user}
                                                </div>
                                            </div>
                                        )}
                                        {chatError && <p role="alert" className="text-sm text-amber-300 bg-amber-500/10 rounded-xl p-4">{chatError}</p>}
                                        {/* Current AI response */}
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
                                        ) : (aiData.next_question || aiData.analysis) ? (
                                            <div className="flex justify-start gap-3">
                                                <div className="w-8 h-8 bg-teal-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <Brain className="w-4 h-4 text-teal-400" />
                                                </div>
                                                <div className="space-y-3 max-w-[90%]">
                                                    {/* Analysis box */}
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

                                                    {/* Suggested links */}
                                                    {aiData.suggested_links && aiData.suggested_links.length > 0 && (
                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                            {aiData.suggested_links.map((link, i) => (
                                                                <Link
                                                                    key={i}
                                                                    to={link.url}
                                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-teal-500/10 border border-white/10 hover:border-teal-500/30 rounded-lg text-xs text-slate-300 hover:text-teal-300 transition-all group"
                                                                >
                                                                    <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-teal-400 transition-colors" />
                                                                    {link.title}
                                                                    <ArrowRight className="w-3 h-3 opacity-0 -ml-1 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                                                                </Link>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ) : null}

                                        <div ref={chatEndRef} />
                                    </div>

                                    {/* Input area */}
                                    <div className="p-4 bg-slate-950 border-t border-white/5">
                                        {isInputDisabled && !loading ? (
                                            <div className="flex items-center justify-center gap-2 text-slate-400 text-sm py-3">
                                                <AlertTriangle className="w-4 h-4 text-amber-400" />
                                                Bạn đã dùng hết {MAX_CHAT_MESSAGES} lượt tư vấn miễn phí.
                                            </div>
                                        ) : (
                                            <form onSubmit={handleReply} className="relative">
                                                <input
                                                    aria-label="Câu trả lời của bạn" maxLength={4000}
                                                    type="text"
                                                    value={currentInput}
                                                    onChange={(e) => setCurrentInput(e.target.value)}
                                                    placeholder="Nhập câu trả lời của bạn..."
                                                    className="w-full bg-slate-900 border border-white/10 rounded-xl pl-4 pr-24 py-3 text-white focus:outline-none focus:border-teal-500/50 transition-all"
                                                    disabled={loading}
                                                />
                                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                                    <span className="text-xs text-slate-500 tabular-nums">
                                                        {messageCount}/{MAX_CHAT_MESSAGES} lượt
                                                    </span>
                                                    <button
                                                        type="submit"
                                                        aria-label="Gửi câu trả lời"
                                                        disabled={!currentInput.trim() || loading}
                                                        className="p-2 text-teal-400 hover:bg-teal-500/10 rounded-lg transition-colors disabled:opacity-50"
                                                    >
                                                        <Send className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </form>
                                        )}
                                    </div>
                                </div>

                                {/* Sidebar */}
                                <div className="space-y-6">
                                    {/* Score card */}
                                    <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-6 backdrop-blur-sm flex flex-col items-center text-center">
                                        <h3 className="text-sm font-medium text-slate-400 mb-4">Mức độ thấu hiểu</h3>
                                        <UnderstandingScore score={aiData.score} />
                                        <p className="text-xs text-slate-500 mt-4">
                                            Cung cấp thêm thông tin để AI hiểu rõ bối cảnh doanh nghiệp của bạn.
                                        </p>
                                    </div>

                                    {/* Message counter card */}
                                    <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-6 backdrop-blur-sm">
                                        <h3 className="text-sm font-medium text-slate-400 mb-3">Lượt tư vấn</h3>
                                        <div className="flex items-center gap-2 mb-2">
                                            {Array.from({ length: MAX_CHAT_MESSAGES }).map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                                                        i < messageCount ? 'bg-teal-500' : 'bg-white/10'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-xs text-slate-500">
                                            Đã dùng {messageCount}/{MAX_CHAT_MESSAGES} lượt miễn phí
                                        </p>
                                    </div>

                                    {/* CTA — Finish & receive proposal */}
                                    <div className="bg-gradient-to-br from-teal-900/20 to-indigo-900/20 border border-white/10 rounded-3xl p-6">
                                        <h3 className="text-white font-bold mb-2">Đã đủ thông tin?</h3>
                                        <p className="text-sm text-slate-400 mb-4">
                                            Để lại thông tin để Mindtransform xem bối cảnh và liên hệ về bước tiếp theo.
                                        </p>

                                        <form className="space-y-3" onSubmit={handleFinish}>
                                                <label className="block text-sm text-slate-300" htmlFor="mindai-name">Họ và tên</label>
                                                <input id="mindai-name" type="text" required maxLength={150} autoComplete="name"
                                                    value={contactName} onChange={e => setContactName(e.target.value)}
                                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
                                                <label className="block text-sm text-slate-300" htmlFor="mindai-email">Email</label>
                                                <input
                                                    id="mindai-email"
                                                    type="email"
                                                    required
                                                    autoComplete="email"
                                                    maxLength={254}
                                                    value={email}
                                                    placeholder="Nhập email của bạn"
                                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500/50"
                                                    onChange={(e) => setEmail(e.target.value)}
                                                />
                                                <label className="block text-sm text-slate-300" htmlFor="mindai-phone">Số điện thoại / Zalo (không bắt buộc)</label>
                                                <input id="mindai-phone" type="tel" autoComplete="tel" maxLength={30}
                                                    value={contactPhone} onChange={e => setContactPhone(e.target.value)}
                                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
                                                <p className="text-xs text-slate-400">Khi gửi, bạn đồng ý để Mindtransform dùng thông tin và nội dung tư vấn này để liên hệ về yêu cầu của bạn.</p>
                                                {submitError && <p role="alert" className="text-sm text-amber-300">{submitError}</p>}
                                                <button
                                                    type="submit"
                                                    disabled={loading || !history.length || !email.trim() || !contactName.trim()}
                                                    className="w-full bg-white text-slate-900 font-bold py-2 rounded-lg text-sm hover:bg-teal-50 disabled:opacity-50 transition-colors"
                                                >
                                                    Gửi yêu cầu tư vấn
                                                </button>
                                        </form>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* ─────────────── SUBMITTING ─────────────── */}
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

                        {/* ─────────────── SUCCESS ─────────────── */}
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
                                    Mindtransform đã lưu yêu cầu cùng <strong>{history.length} lượt trao đổi</strong>. Chúng tôi sẽ xem xét thông tin và liên hệ qua email <strong>{email}</strong> để thống nhất bước tiếp theo.
                                </p>
                                <Link to="/"
                                    className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-colors border border-white/10"
                                >
                                    Quay về trang chủ
                                </Link>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* ─────────────── SESSION LIMIT MODAL ─────────────── */}
                <AnimatePresence>
                    {showLimitModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        >
                            {/* Backdrop */}
                            <div
                                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                                onClick={() => setShowLimitModal(false)}
                            />

                            {/* Modal */}
                            <motion.div
                                role="dialog" aria-modal="true" aria-labelledby="mindai-limit-title"
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="relative bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl shadow-black/50"
                            >
                                <div className="w-16 h-16 bg-amber-500/15 rounded-full flex items-center justify-center mx-auto mb-5">
                                    <AlertTriangle className="w-8 h-8 text-amber-400" />
                                </div>
                                <h3 id="mindai-limit-title" className="text-2xl font-bold text-white mb-3">
                                    Đã hết lượt tư vấn
                                </h3>
                                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                                    {chatError || `Bạn đã sử dụng hết ${MAX_CHAT_MESSAGES} lượt tư vấn miễn phí. Bạn có thể xem lại hội thoại và gửi yêu cầu, hoặc liên hệ qua Zalo.`}
                                </p>

                                <div className="space-y-3">
                                    <button onClick={() => setShowLimitModal(false)}
                                        className="w-full bg-white text-slate-950 font-bold py-3 rounded-xl text-sm">
                                        Xem lại & gửi yêu cầu
                                    </button>
                                    <a
                                        href={`https://zalo.me/${ZALO_CONTACT}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 w-full bg-teal-500 hover:bg-teal-400 text-white font-bold py-3 rounded-xl transition-colors text-sm"
                                    >
                                        <MessageSquare className="w-4 h-4" />
                                        Liên hệ Zalo: {ZALO_CONTACT}
                                    </a>
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="w-full bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl font-medium transition-colors border border-white/10 text-sm"
                                    >
                                        Bắt đầu lại (xóa hội thoại)
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
}
