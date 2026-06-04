import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useModal } from '../context/ModalContext';
import {
  ChevronDown,
  ArrowRight,
  MapPin,
  Target,
  Sprout,
  Rocket,
  ShoppingBag,
  Coffee,
  Sparkles,
  Car,
  Globe,
  CheckCircle2,
} from 'lucide-react';

const FadeIn = ({ children, delay = 0, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ duration: 0.7, delay, ease: [0.25, 0.1, 0.25, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

const SlideIn = ({ children, delay = 0, direction = 'left' }) => (
  <motion.div
    initial={{ opacity: 0, x: direction === 'left' ? -40 : 40 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ duration: 0.7, delay, ease: [0.25, 0.1, 0.25, 1] }}
  >
    {children}
  </motion.div>
);

const mindSteps = [
  {
    letter: 'M',
    title: 'MAP',
    titleVi: 'Đọc vị doanh nghiệp',
    desc: 'Hiểu rõ bối cảnh, quy trình, con người trước khi đề xuất',
    color: 'teal',
    icon: MapPin,
    free: true,
  },
  {
    letter: 'I',
    title: 'ISOLATE',
    titleVi: 'Chọn đúng điểm đau',
    desc: 'Cô lập 1 vấn đề cụ thể, đo baseline, tạo hiệu ứng lan tỏa',
    color: 'teal',
    icon: Target,
    free: true,
  },
  {
    letter: 'N',
    title: 'NURTURE',
    titleVi: 'Nuôi dưỡng giải pháp',
    desc: 'Triển khai + nuôi cho đến khi giải pháp thực sự sống trong DN',
    color: 'indigo',
    icon: Sprout,
    free: false,
  },
  {
    letter: 'D',
    title: 'DRIVE',
    titleVi: 'Thúc đẩy tăng trưởng',
    desc: 'Từ 1 điểm đã lành, mở rộng ra toàn hệ thống',
    color: 'indigo',
    icon: Rocket,
    free: false,
  },
];

const painPoints = [
  { text: 'Mua KiotViet nhưng nhân viên vẫn ghi tay', delay: 0.1 },
  { text: 'Có Zalo group nhưng vẫn phải hỏi từng người', delay: 0.25 },
  { text: 'Setup Excel nhưng không ai nhập', delay: 0.4 },
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

export default function HomeV2() {
  const { openForm } = useModal();
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  return (
    <>
      <Helmet>
        <title>Mind.Transform — Mind dẫn dắt. Kết quả chứng minh.</title>
        <meta
          name="description"
          content="Mindtransform giúp doanh nghiệp nhỏ vận hành rõ ràng hơn — bắt đầu từ hiểu đúng vấn đề, giải quyết 1 điểm cụ thể, đo kết quả trước-sau."
        />
      </Helmet>

      {/* ===== HERO ===== */}
      <section className="relative min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-6 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-900/20 rounded-full blur-[150px]" />
          <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-indigo-900/15 rounded-full blur-[120px]" />
        </div>

        <motion.div style={{ opacity: heroOpacity }} className="max-w-5xl mx-auto text-center space-y-8">
          <div className="overflow-hidden">
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-5xl sm:text-6xl md:text-8xl font-bold tracking-tight leading-[1.1]"
            >
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-transparent bg-clip-text bg-gradient-to-r from-teal-200 to-white"
              >
                Mind dẫn dắt.
              </motion.span>
              <br />
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.7 }}
                className="text-slate-500"
              >
                Kết quả chứng minh.
              </motion.span>
            </motion.h1>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            Mindtransform giúp doanh nghiệp nhỏ vận hành rõ ràng hơn — bắt đầu từ hiểu đúng vấn đề,
            giải quyết 1 điểm cụ thể, đo kết quả trước-sau, mở rộng khi đã chứng minh giá trị.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Link
              to="/mind-framework"
              className="group px-8 py-4 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-full font-semibold hover:shadow-lg hover:shadow-teal-500/25 transition-all flex items-center gap-2"
            >
              Tìm hiểu phương pháp MIND
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button
              onClick={openForm}
              className="px-8 py-4 border border-white/10 hover:border-white/30 rounded-full font-medium transition-all hover:bg-white/5 text-white"
            >
              Nhận tư vấn miễn phí
            </button>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-8 animate-bounce text-slate-600"
        >
          <ChevronDown className="w-6 h-6" />
        </motion.div>
      </section>

      {/* ===== PAIN POINTS ===== */}
      <section className="py-24 md:py-32 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="text-teal-500 text-sm font-bold tracking-widest uppercase">
                Vấn đề thực tế
              </span>
              <h2 className="mt-4 text-3xl md:text-5xl font-bold leading-tight">
                Công cụ không thiếu.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-teal-200">
                  Tư duy vận hành mới thiếu.
                </span>
              </h2>
            </div>
          </FadeIn>

          <div className="space-y-6 max-w-3xl mx-auto">
            {painPoints.map((point, i) => (
              <FadeIn key={i} delay={point.delay}>
                <div className="group flex items-start gap-5 p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-rose-500/20 transition-all hover:bg-white/[0.05]">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center mt-0.5">
                    <span className="text-rose-400 text-lg font-bold">{i + 1}</span>
                  </div>
                  <p className="text-lg md:text-xl text-slate-300 leading-relaxed">"{point.text}"</p>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.5}>
            <p className="text-center text-xl md:text-2xl text-slate-400 mt-12 max-w-2xl mx-auto">
              Công cụ đầy, vận hành vẫn rối —{' '}
              <span className="text-white font-semibold">vì chưa thay đổi cách nghĩ.</span>
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ===== MIND FRAMEWORK PREVIEW ===== */}
      <section className="py-24 md:py-32 px-6 border-t border-white/5 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-teal-900/10 rounded-full blur-[150px] -z-10" />

        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="text-teal-500 text-sm font-bold tracking-widest uppercase">
                Phương pháp độc quyền
              </span>
              <h2 className="mt-4 text-3xl md:text-5xl font-bold">
                Phương pháp MIND —{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-teal-200">
                  4 bước chuyển đổi có đo lường
                </span>
              </h2>
            </div>
          </FadeIn>

          {/* Desktop: horizontal cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {mindSteps.map((step, i) => (
              <FadeIn key={step.letter} delay={i * 0.15}>
                <div className="group relative p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-teal-500/30 transition-all hover:bg-white/[0.06] h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-teal-300 to-teal-600">
                      {step.letter}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-slate-500 tracking-wider">{step.title}</div>
                      <div className="text-sm font-semibold text-white">{step.titleVi}</div>
                    </div>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed mb-4">{step.desc}</p>
                  <span
                    className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full ${
                      step.free
                        ? 'bg-teal-500/15 text-teal-400 border border-teal-500/20'
                        : 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20'
                    }`}
                  >
                    {step.free ? 'FREE' : 'PAID'}
                  </span>

                  {/* Connecting arrow (hidden on last + mobile) */}
                  {i < 3 && (
                    <div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 z-10 text-slate-600">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  )}
                </div>
              </FadeIn>
            ))}
          </div>

          {/* Circular loop indicator */}
          <FadeIn delay={0.6}>
            <div className="flex items-center justify-center gap-2 text-sm text-slate-500 mb-10">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-teal-500">
                <path
                  d="M10 2a8 8 0 1 1-6.93 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path d="M3.07 6L1 3.5M3.07 6L5.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              MIND là vòng lặp — Drive dẫn ngược về Map cho module tiếp theo
            </div>
          </FadeIn>

          <FadeIn delay={0.7}>
            <div className="text-center">
              <Link
                to="/mind-framework"
                className="group inline-flex items-center gap-2 text-teal-400 font-semibold hover:text-teal-300 transition-colors"
              >
                Xem chi tiết phương pháp MIND
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ===== COMMITMENT — SKIN IN THE GAME ===== */}
      <section className="py-24 md:py-32 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <SlideIn direction="left">
              <div>
                <span className="text-teal-500 text-sm font-bold tracking-widest uppercase">
                  Cam kết thật
                </span>
                <h2 className="mt-4 text-3xl md:text-5xl font-bold leading-tight mb-6">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-white">
                    65%
                  </span>{' '}
                  phí gắn vào kết quả thật
                </h2>
                <p className="text-lg text-slate-400 leading-relaxed mb-8">
                  Mindtransform chia phí thành 2 phần: 35% cho bàn giao đúng cam kết, 65% chỉ nhận khi kết
                  quả đo được bằng data thật. Chúng tôi không bán lời hứa.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300">
                      Toàn bộ Map + Isolate + Plan:{' '}
                      <span className="text-teal-400 font-semibold">Miễn phí</span>
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300">
                      Outcome đo bằng data từ KiotViet, Lark, POS — không phải cảm nhận
                    </span>
                  </div>
                </div>
              </div>
            </SlideIn>

            <SlideIn direction="right" delay={0.2}>
              <div className="relative">
                {/* Pricing visual */}
                <div className="p-8 rounded-2xl bg-white/[0.03] border border-white/5">
                  <div className="space-y-5">
                    {/* Build fee */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-400">Build fee — bàn giao đúng SOW</span>
                        <span className="text-white font-semibold">35%</span>
                      </div>
                      <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: '35%' }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                          className="h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full"
                        />
                      </div>
                    </div>
                    {/* Outcome milestone 1 */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-400">Outcome — adoption ổn định</span>
                        <span className="text-white font-semibold">35%</span>
                      </div>
                      <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: '35%' }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                          className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full"
                        />
                      </div>
                    </div>
                    {/* Outcome milestone 2 */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-400">Outcome — metrics đạt ngưỡng</span>
                        <span className="text-white font-semibold">30%</span>
                      </div>
                      <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: '30%' }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.7, ease: 'easeOut' }}
                          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-white/5">
                    <p className="text-xs text-slate-500 leading-relaxed">
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

      {/* ===== INDUSTRIES ===== */}
      <section className="py-24 md:py-32 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="text-teal-500 text-sm font-bold tracking-widest uppercase">
                Giải pháp theo ngành
              </span>
              <h2 className="mt-4 text-3xl md:text-5xl font-bold">
                Bắt đầu từ{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-teal-200">
                  1 quy trình đang đau
                </span>
              </h2>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {industries.map((ind, i) => {
              const Icon = ind.icon;
              return (
                <FadeIn key={ind.name} delay={i * 0.1}>
                  <div className="group p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-teal-500/20 transition-all hover:bg-white/[0.05] h-full">
                    <Icon className="w-8 h-8 text-teal-400 mb-4" />
                    <h3 className="text-lg font-bold text-white mb-3">{ind.name}</h3>
                    <ul className="space-y-2">
                      {ind.useCases.map((uc) => (
                        <li key={uc} className="flex items-start gap-2 text-sm text-slate-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-500/50 flex-shrink-0 mt-1.5" />
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

      {/* ===== CASE STUDY PLACEHOLDER ===== */}
      <section className="py-24 md:py-32 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <div className="text-center p-12 rounded-2xl bg-white/[0.02] border border-dashed border-white/10">
              <div className="flex items-center justify-center gap-3 mb-6">
                {['M', 'I', 'N', 'D'].map((letter, i) => (
                  <span
                    key={letter}
                    className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-sm font-bold text-teal-400"
                  >
                    {letter}
                  </span>
                ))}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Case Study đang triển khai</h3>
              <p className="text-slate-400 max-w-lg mx-auto">
                Dự án đầu tiên đang triển khai. Case study sẽ được cập nhật theo cấu trúc MIND: Map →
                Isolate → Nurture → Drive.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="py-24 md:py-32 px-6 border-t border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-teal-900/15 rounded-full blur-[150px]" />
        </div>

        <div className="max-w-3xl mx-auto text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Nhận bản đồ doanh nghiệp{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-teal-200">
                miễn phí
              </span>
            </h2>
            <p className="text-lg text-slate-400 mb-10 max-w-xl mx-auto">
              Mindtransform Map toàn bộ bối cảnh vận hành của bạn — miễn phí, không ràng buộc. Bạn quyết
              định bước tiếp theo.
            </p>
            <button
              onClick={openForm}
              className="group px-10 py-4 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-full font-semibold text-lg hover:shadow-lg hover:shadow-teal-500/25 transition-all inline-flex items-center gap-2"
            >
              Đăng ký nhận MIND Map Report
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="mt-6 text-sm text-slate-600">
              Không spam. Không bán data. Chỉ tư vấn khi bạn sẵn sàng.
            </p>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
