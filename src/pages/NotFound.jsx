import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export default function NotFound() {
    return <section className="min-h-[65vh] flex flex-col items-center justify-center text-center px-6">
        <Helmet><title>Không tìm thấy trang | Mindtransform</title><meta name="robots" content="noindex" /></Helmet>
        <p className="text-teal-400 mb-4">404</p>
        <h1 className="text-3xl font-bold text-white mb-4">Không tìm thấy trang</h1>
        <p className="text-slate-400 mb-8">Đường dẫn có thể đã thay đổi. Bạn có thể quay về trang chủ hoặc xem thư viện template.</p>
        <div className="flex flex-wrap justify-center gap-4">
            <Link to="/" className="rounded-xl bg-white text-slate-950 px-6 py-3 font-medium">Về trang chủ</Link>
            <Link to="/templates" className="rounded-xl border border-white/20 px-6 py-3 text-white">Xem templates</Link>
        </div>
    </section>;
}
