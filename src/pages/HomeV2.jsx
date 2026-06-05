import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useModal } from '../context/ModalContext';
import {
  ChevronDown,
  ArrowRight,
  ShoppingBag,
  Coffee,
  Sparkles,
  Car,
  Globe,
  CheckCircle2,
} from 'lucide-react';

/* ── Animation primitives ─────────────────────────── */

const FadeIn = ({ children, delay = 0, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 32 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-80px' }}
    transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

const SlideIn = ({ children, delay = 0, direction = 'left' }) => (
  <motion.div
    initial={{ opacity: 0, x: direction === 'left' ? -60 : 60 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true, margin: '-80px' }}
    transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
);

/* ── Glowing MIND letter component ────────────────── */

function MINDLetter({ letter, label, labelVi, free, delay = 0, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex flex-col items-center text-center"
    >
      {/* Glow backdrop */}
      <div className="absolute -inset-4 bg-teal-500/[0.06] rounded-3xl blur-2xl group-hover:bg-teal-500/[0.12] transition-all duration-700 opacity-0 group-hover:opacity-100" />

      {/* Giant letter */}
      <div className="relative mb-5">
        <span className="text-[5rem] sm:text-[7rem] md:text-[9rem] lg:text-[10rem] font-extrabold leading-none text-transparent bg-clip-text bg-gradient-to-b from-teal-200 via-teal-400 to-teal-700 select-none drop-shadow-[0_0_40px_rgba(45,225,194,0.15)] group-hover:drop-shadow-[0_0_60px_rgba(45,225,194,0.3)] transition-all duration-500">
          {letter}
        </span>
      </div>

      {/* Label */}
      <h3 className="text-sm md:text-base font-bold tracking-[0.2em] text-slate-400 uppercase mb-2">
        {label}
      </h3>
      <p className="text-lg md:text-xl font-bold text-white mb-3">{labelVi}</p>

      {/* Badge */}
      <span
        className={`text-xs font-bold px-4 py-1.5 rounded-full ${
          free
            ? 'bg-teal-500/15 text-teal-300 border border-teal-500/25'
            : 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/25'
        }`}
      >
        {free ? 'MIỄN PHÍ' : 'CÓ PHÍ'}
      </span>
    </motion.div>
  );
}

/* ── Data ─────────────────────────────────────────── */

const mindSteps = [
  { letter: 'M', label: 'MAP', labelVi: 'Đọc vị doanh nghiệp', free: true },
  { letter: 'I', label: 'ISOLATE', labelVi: 'Chọn đúng điểm đau', free: true },
  { letter: 'N', label: 'NURTURE', labelVi: 'Nuôi dưỡng giải pháp', free: false },
  { letter: 'D', label: 'DRIVE', labelVi: 'Thúc đẩy tăng trưởng', free: false },
];

const painPoints = [
  'Mua KiotViet nhưng nhân viên vẫn ghi tay',
  'Có Zalo group nhưng vẫn phải hỏi từng người',
  'Setup Excel nhưng không ai nhập',
];

const industries = [
  {
    name: 'Bán lẻ chuỗi',
    icon: ShoppingBag,
    useCases: ['Báo cáo doanh thu tự động', 'Quản lý kho đa chi nhánh', 'Checklist mở/đóng cửa'],
  },
  {
    name: 'F&B / Cafe / Trà',
    icon: Coffee,
    useCases: ['Quản lý nguyên liệu', 'Checklist vệ sinh', 'Báo cáo ca làm việc'],
  },
  {
    name: 'Spa / Beauty',
    icon: Sparkles,
    useCases: ['Quản lý lịch hẹn', 'Theo dõi liệu trình', 'Đánh giá nhân viên'],
  },
  {
    name: 'Gara / Dịch vụ ô tô',
    icon: Car,
    useCases: ['Tiếp nhận xe', 'Quản lý phụ tùng', 'Lịch sử sửa chữa'],
  },
  {
    name: 'Online operations',
    icon: Globe,
    useCases: ['Quản lý đơn hàng', 'Theo dõi vận chuyển', 'Chăm sóc khách hàng'],
  },
];

/* ── Page ─────────────────────────────────────────── */

export default function HomeV2() {
  const { openForm } = useModal();
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);

  return (
    <>
      <Helmet>
        <title>Mind.Transform — Mind dẫn dắt. Kết quả chứng minh.</title>
        <meta
          name="description"
          content="Mindtransform giúp doanh nghiệp nhỏ vận hành rõ ràng hơn — bắt đầu từ hiểu đúng vấn đề, giải quyết 1 điểm cụ thể, đo kết quả trước-sau."
        />
      </Helmet>

      {/* ═══════════════════ HERO ═══════════════════ */}
      <section className="relative min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-6 overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-teal-900/20 rounded-full blur-[180px]" />
          <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-900/10 rounded-full blur-[140px]" />
        </div>

        <motion.div style={{ opacity: heroOpacity }} className="max-w-6xl mx-auto text-center space-y-10">
          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-extrabold tracking-tight leading-[0.95]"
          >
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.3 }}
              className="text-transparent bg-clip-text bg-gradient-to-r from-teal-200 via-white to-teal-100 block"
            >
              Mind dẫn dắt.
            </motion.span>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.8 }}
              className="text-slate-600 block mt-2"
            >
              Kết quả chứng minh.
            </motion.span>
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3, duration: 0.9 }}
            className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed"
          >
            Mindtransform giúp doanh nghiệp nhỏ vận hành rõ ràng hơn — bắt đầu từ hiểu đúng vấn đề,
            giải quyết 1 điểm cụ thể, đo kết quả trước-sau, mở rộng khi đã chứng minh giá trị.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.7, duration: 0.7 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-2"
          >
            <Link
              to="/mind-framework"
              className="group px-10 py-5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-full font-bold text-lg hover:shadow-xl hover:shadow-teal-500/30 transition-all flex items-center gap-3"
            >
              Tìm hiểu phương pháp MIND
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
            </Link>
            <button
              onClick={openForm}
              className="px-10 py-5 border border-white/15 hover:border-white/40 rounded-full font-semibold text-lg transition-all hover:bg-white/5 text-white"
            >
              Nhận tư vấn miễn phí
            </button>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2, duration: 1 }}
          className="absolute bottom-10 animate-bounce text-slate-600"
        >
          <ChevronDown className="w-7 h-7" />
        </motion.div>
      </section>

      {/* ═══════════════════ PAIN POINTS ═══════════════════ */}
      <section className="py-28 md:py-40 px-6 border-t border-white/5 overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="text-center mb-20">
              <span className="text-teal-400 text-sm md:text-base font-bold tracking-[0.2em] uppercase">
                Vấn đề thực tế
              </span>
              <h2 className="mt-6 text-4xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05]">
                Công cụ không thiếu.
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-teal-100">
                  Tư duy vận hành mới thiếu.
                </span>
              </h2>
            </div>
          </FadeIn>

          <div className="space-y-8 max-w-4xl mx-auto">
            {painPoints.map((point, i) => (
              <FadeIn key={i} delay={i * 0.15}>
                <div className="group flex items-start gap-6 p-8 md:p-10 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-rose-500/20 transition-all duration-500 hover:bg-white/[0.05]">
                  <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center">
                    <span className="text-rose-400 text-2xl font-extrabold">{i + 1}</span>
                  </div>
                  <p className="text-xl md:text-2xl text-slate-200 leading-relaxed pt-2">
                    "{point}"
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.5}>
            <p className="text-center text-2xl md:text-3xl text-slate-400 mt-16 max-w-3xl mx-auto leading-relaxed">
              Công cụ đầy, vận hành vẫn rối —{' '}
              <span className="text-white font-bold">vì chưa thay đổi cách nghĩ.</span>
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════ MIND FRAMEWORK PREVIEW ═══════════════════ */}
      <section className="py-28 md:py-40 px-6 border-t border-white/5 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-teal-900/10 rounded-full blur-[200px] -z-10" />

        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <div className="text-center mb-24">
              <span className="text-teal-400 text-sm md:text-base font-bold tracking-[0.2em] uppercase">
                Phương pháp độc quyền
              </span>
              <h2 className="mt-6 text-4xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05]">
                Phương pháp{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-teal-100">
                  MIND
                </span>
              </h2>
              <p className="mt-6 text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto">
                4 bước chuyển đổi có đo lường
              </p>
            </div>
          </FadeIn>

          {/* Giant MIND letters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6 lg:gap-10 mb-16">
            {mindSteps.map((step, i) => (
              <MINDLetter
                key={step.letter}
                letter={step.letter}
                label={step.label}
                labelVi={step.labelVi}
                free={step.free}
                delay={i * 0.12}
                index={i}
              />
            ))}
          </div>

          {/* Loop indicator */}
          <FadeIn delay={0.6}>
            <div className="flex items-center justify-center gap-3 text-base md:text-lg text-slate-500 mb-12">
              <svg width="24" height="24" viewBox="0 0 20 20" fill="none" className="text-teal-400">
                <path d="M10 2a8 8 0 1 1-6.93 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M3.07 6L1 3.5M3.07 6L5.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              MIND là vòng lặp — Drive dẫn ngược về Map cho module tiếp theo
            </div>
          </FadeIn>

          <FadeIn delay={0.7}>
            <div className="text-center">
              <Link
                to="/mind-framework"
                className="group inline-flex items-center gap-3 px-10 py-5 rounded-full border border-teal-500/30 text-teal-300 font-bold text-lg hover:bg-teal-500/10 hover:border-teal-500/50 transition-all duration-300"
              >
                Xem chi tiết phương pháp MIND
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════ COMMITMENT — SKIN IN THE GAME ═══════════════════ */}
      <section className="py-28 md:py-40 px-6 border-t border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 lg:gap-24 items-center">
            <SlideIn direction="left">
              <div>
                <span className="text-teal-400 text-sm md:text-base font-bold tracking-[0.2em] uppercase">
                  Cam kết thật
                </span>
                <h2 className="mt-6 text-4xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] mb-8">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-white">
                    65%
                  </span>{' '}
                  phí gắn vào
                  <br />
                  kết quả thật
                </h2>
                <p className="text-xl md:text-2xl text-slate-400 leading-relaxed mb-10">
                  Mindtransform chia phí thành 2 phần: 35% cho bàn giao đúng cam kết, 65% chỉ nhận khi kết
                  quả đo được bằng data thật.
                </p>
                <div className="space-y-5">
                  {[
                    { text: 'Toàn bộ Map + Isolate + Plan:', highlight: 'Miễn phí' },
                    { text: 'Outcome đo bằng data từ KiotViet, Lark, POS —', highlight: 'không phải cảm nhận' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <CheckCircle2 className="w-6 h-6 text-teal-400 flex-shrink-0 mt-1" />
                      <span className="text-lg text-slate-300">
                        {item.text}{' '}
                        <span className="text-teal-300 font-bold">{item.highlight}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </SlideIn>

            <SlideIn direction="right" delay={0.2}>
              <div className="relative">
                <div className="p-10 rounded-3xl bg-white/[0.03] border border-white/[0.08]">
                  <div className="space-y-8">
                    {[
                      { label: 'Build fee — bàn giao đúng SOW', pct: 35, color: 'from-teal-500 to-teal-400' },
                      { label: 'Outcome — adoption ổn định', pct: 35, color: 'from-cyan-500 to-cyan-400' },
                      { label: 'Outcome — metrics đạt ngưỡng', pct: 30, color: 'from-emerald-500 to-emerald-400' },
                    ].map((item, i) => (
                      <div key={item.label}>
                        <div className="flex justify-between text-base mb-3">
                          <span className="text-slate-300 font-medium">{item.label}</span>
                          <span className="text-white font-bold text-lg">{item.pct}%</span>
                        </div>
                        <div className="h-4 bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${item.pct}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.2, delay: 0.3 + i * 0.2, ease: 'easeOut' }}
                            className={`h-full bg-gradient-to-r ${item.color} rounded-full`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 pt-6 border-t border-white/5">
                    <p className="text-sm text-slate-500 leading-relaxed">
                      Metrics xác định tại Isolate, đo bằng data khách quan. Không đạt 50% metric → không
                      nhận outcome fee.
                    </p>
                  </div>
                </div>
              </div>
            </SlideIn>
          </div>
        </div>
      </section>

      {/* ═══════════════════ INDUSTRIES ═══════════════════ */}
      <section className="py-28 md:py-40 px-6 border-t border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <div className="text-center mb-20">
              <span className="text-teal-400 text-sm md:text-base font-bold tracking-[0.2em] uppercase">
                Giải pháp theo ngành
              </span>
              <h2 className="mt-6 text-4xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05]">
                Bắt đầu từ{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-teal-100">
                  1 quy trình đang đau
                </span>
              </h2>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {industries.map((ind, i) => {
              const Icon = ind.icon;
              return (
                <FadeIn key={ind.name} delay={i * 0.1}>
                  <div className="group p-8 md:p-10 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-teal-500/25 transition-all duration-500 hover:bg-white/[0.05] h-full">
                    <Icon className="w-10 h-10 text-teal-400 mb-6" />
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-5">{ind.name}</h3>
                    <ul className="space-y-3">
                      {ind.useCases.map((uc) => (
                        <li key={uc} className="flex items-start gap-3 text-base text-slate-400">
                          <span className="w-2 h-2 rounded-full bg-teal-500/50 flex-shrink-0 mt-2" />
                          {uc}
                        </li>
                      ))}
                    </ul>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════ CASE STUDY PLACEHOLDER ═══════════════════ */}
      <section className="py-28 md:py-40 px-6 border-t border-white/5 overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="text-center p-16 md:p-20 rounded-3xl bg-white/[0.02] border border-dashed border-white/10">
              <div className="flex items-center justify-center gap-5 mb-10">
                {['M', 'I', 'N', 'D'].map((letter) => (
                  <span
                    key={letter}
                    className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl font-extrabold text-teal-400"
                  >
                    {letter}
                  </span>
                ))}
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-5">Case Study đang triển khai</h3>
              <p className="text-lg text-slate-400 max-w-lg mx-auto leading-relaxed">
                Dự án đầu tiên đang triển khai. Case study sẽ được cập nhật theo cấu trúc MIND: Map →
                Isolate → Nurture → Drive.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════ FINAL CTA ═══════════════════ */}
      <section className="py-28 md:py-40 px-6 border-t border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-teal-900/15 rounded-full blur-[200px]" />
        </div>

        <div className="max-w-4xl mx-auto text-center">
          <FadeIn>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-8 leading-[1.05]">
              Nhận bản đồ doanh nghiệp{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-teal-100">
                miễn phí
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
              Mindtransform Map toàn bộ bối cảnh vận hành của bạn — miễn phí, không ràng buộc. Bạn quyết
              định bước tiếp theo.
            </p>
            <button
              onClick={openForm}
              className="group px-12 py-5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-full font-bold text-xl hover:shadow-xl hover:shadow-teal-500/30 transition-all inline-flex items-center gap-3"
            >
              Đăng ký nhận MIND Map Report
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1.5 transition-transform" />
            </button>
            <p className="mt-8 text-base text-slate-600">
              Không spam. Không bán data. Chỉ tư vấn khi bạn sẵn sàng.
            </p>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
