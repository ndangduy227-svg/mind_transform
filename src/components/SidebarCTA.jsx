import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useModal } from '../context/ModalContext';

export default function SidebarCTA() {
    const { openForm } = useModal();

    return (
        <div className="bg-gradient-to-br from-teal-900/20 to-slate-900/50 border border-teal-500/20 rounded-2xl p-6 sticky top-24">
            <h3 className="text-xl font-bold text-white mb-3">
                Mind<span className="text-teal-400">.Transform</span>
            </h3>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                Đối tác tư vấn và triển khai Chuyển đổi số toàn diện cho doanh nghiệp SME. Giúp bạn tối ưu quy trình, nâng cao hiệu suất và tăng trưởng bền vững.
            </p>
            <button
                onClick={openForm}
                className="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 group"
            >
                Liên hệ tư vấn
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
        </div>
    );
}
