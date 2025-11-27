import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, CheckCircle, Loader2 } from 'lucide-react';

export default function LeadForm({ isOpen, onClose }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        company: '',
        need: ''
    });

    // Thay URL này bằng URL bạn nhận được sau khi deploy Apps Script
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzTOHDWp8w7M5RtSXxA_lqkQTA_1pqGw_xyO_bPkj0I32P7ck5U5GGe4fBE77ZAM9xEhg/exec";

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Tạo form data để gửi
        const form = new FormData();
        form.append('name', formData.name);
        form.append('phone', formData.phone);
        form.append('email', formData.email);
        form.append('company', formData.company);
        form.append('need', formData.need);

        try {
            // Gửi request đến Google Apps Script
            // Lưu ý: mode 'no-cors' là cần thiết khi gửi từ browser đến Google Script
            await fetch(SCRIPT_URL, {
                method: 'POST',
                body: form,
                mode: 'no-cors'
            });

            // Giả lập delay một chút cho mượt
            await new Promise(resolve => setTimeout(resolve, 1000));

            setIsSuccess(true);
            setFormData({ name: '', phone: '', email: '', company: '', need: '' });

            // Tự động đóng sau 3s
            setTimeout(() => {
                setIsSuccess(false);
                onClose();
            }, 3000);

        } catch (error) {
            console.error("Error submitting form", error);
            alert("Có lỗi xảy ra. Vui lòng thử lại sau.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[60]"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 flex items-center justify-center z-[70] p-4 pointer-events-none"
                    >
                        <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl pointer-events-auto relative">

                            {/* Success Overlay */}
                            <AnimatePresence>
                                {isSuccess && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute inset-0 bg-slate-900 z-10 flex flex-col items-center justify-center text-center p-8"
                                    >
                                        <motion.div
                                            initial={{ scale: 0.5 }}
                                            animate={{ scale: 1 }}
                                            className="w-20 h-20 bg-teal-500/10 rounded-full flex items-center justify-center mb-6"
                                        >
                                            <CheckCircle className="w-10 h-10 text-teal-500" />
                                        </motion.div>
                                        <h3 className="text-2xl font-bold text-white mb-2">Đã gửi thành công!</h3>
                                        <p className="text-slate-400">Cảm ơn bạn đã quan tâm. Chúng tôi sẽ liên hệ lại trong thời gian sớm nhất.</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Header */}
                            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-900/50">
                                <div>
                                    <h3 className="text-xl font-bold text-white">Kết nối với Mind.Transform</h3>
                                    <p className="text-slate-400 text-sm mt-1">Để lại thông tin, chúng tôi sẽ liên hệ trong 24h.</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400 hover:text-white"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Form */}
                            <form className="p-6 space-y-4" onSubmit={handleSubmit}>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">Họ và tên</label>
                                        <input
                                            required
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            type="text"
                                            className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all"
                                            placeholder="Nguyễn Văn A"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">Số điện thoại</label>
                                        <input
                                            required
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            type="tel"
                                            className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all"
                                            placeholder="0901234567"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Email công việc</label>
                                    <input
                                        required
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        type="email"
                                        className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all"
                                        placeholder="name@company.com"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Doanh nghiệp / Tổ chức</label>
                                    <input
                                        name="company"
                                        value={formData.company}
                                        onChange={handleChange}
                                        type="text"
                                        className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all"
                                        placeholder="Tên công ty của bạn"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Nhu cầu tư vấn</label>
                                    <textarea
                                        name="need"
                                        value={formData.need}
                                        onChange={handleChange}
                                        rows={3}
                                        className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all resize-none"
                                        placeholder="Mô tả ngắn gọn vấn đề bạn đang gặp phải..."
                                    />
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-white text-slate-950 font-bold py-3 rounded-xl hover:bg-teal-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Đang gửi...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-4 h-4" />
                                                Gửi thông tin
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
