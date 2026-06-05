import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useModal } from '../context/ModalContext';
import {
  ArrowRight,
  MapPin,
  Target,
  Sprout,
  Rocket,
  CheckCircle2,
  Users,
  FileText,
  Headphones,
  GraduationCap,
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

/* ── Data ─────────────────────────────────────────── */

const steps = [
  {
    letter: 'M',
    title: 'MAP',
    titleVi: 'Đọc vị doanh nghiệp',
    free: true,
    definition:
      'Hiểu toàn cảnh doanh nghiệp trước khi đề xuất bất kỳ điều gì. Không giả định, không vào bán ngay.',
    icon: MapPin,
    activities: [
      'Phân tích lĩnh vực, quy mô, tổ chức thực tế',
      'Khảo sát hệ thống đang dùng (cả chính thức lẫn không chính thức)',
      'Phỏng vấn nhân sự core (2-3 người, 30-45 phút/người)',
      'Deep talk với BOD — nhu cầu, cam kết, ngân sách',
      'Architecture ngành — bản đồ kiến trúc vận hành điển hình',
    ],
    deliverable: 'MIND Map Report',
    deliverableDesc: 'Bản đồ toàn cảnh doanh nghiệp',
    commitments: [
      'Cung cấp thông tin trung thực về vận hành',
      'Cho phép phỏng vấn nhân sự core',
      'BOD dành thời gian deep talk (1-2 buổi)',
    ],
  },
  {
    letter: 'I',
    title: 'ISOLATE',
    titleVi: 'Chọn đúng điểm đau',
    free: true,
    definition:
      'Từ bản đồ Map, chọn đúng 1 điểm đau có impact cao, effort hợp lý. Chữa cái dễ chữa nhất, tạo niềm tin cho những bước lớn hơn.',
    icon: Target,
    activities: [
      'Xác định project cụ thể dựa trên data từ Map',
      'Đo baseline bằng data thật (ví dụ: sai lệch kho 15%)',
      'Thiết lập 2-3 hard metrics thành công',
      'Xây dựng timeline theo milestone',
      'Đóng gói Nurture plan + Drive plan',
    ],
    deliverable: 'MIND Blueprint',
    deliverableDesc: 'Proposal: scope, baseline, metrics, timeline, pricing',
    commitments: [
      'Review Blueprint nghiêm túc',
      'Feedback rõ ràng về scope, metrics, pricing',
      'Quyết định go/no-go trong thời gian hợp lý',
    ],
  },
  {
    letter: 'N',
    title: 'NURTURE',
    titleVi: 'Nuôi dưỡng giải pháp',
    free: false,
    definition:
      'Giải quyết điểm đau đã chọn và nuôi dưỡng giải pháp cho đến khi nó thực sự sống trong doanh nghiệp. Không phải setup xong rồi bỏ.',
    icon: Sprout,
    activities: [
      'Build: Setup, config, customize giải pháp kỹ thuật',
      'Bàn giao deliverables theo SOW',
      'Adopt: Training nhân sự, monitor adoption rate',
      'Xử lý resistance, adjust theo feedback thực tế',
      'Đảm bảo nhân viên thực sự dùng, sếp thực sự thấy kết quả',
    ],
    deliverable: 'Giải pháp live + Adoption Report',
    deliverableDesc: 'Tỷ lệ sử dụng, feedback, metrics so với baseline',
    commitments: [
      'Assign 1 internal owner phía doanh nghiệp',
      'Enforce adoption — yêu cầu nhân viên sử dụng',
      'Tham gia training, cung cấp feedback kịp thời',
    ],
  },
  {
    letter: 'D',
    title: 'DRIVE',
    titleVi: 'Thúc đẩy tăng trưởng toàn diện',
    free: false,
    definition:
      'Từ 1 điểm đã lành, zoom out cho sếp thấy bức tranh tổng thể. Drive không chỉ chữa 1 chỗ đau — mà lan tỏa khỏe toàn thân.',
    icon: Rocket,
    activities: [
      'Đo outcome metric cuối cùng — so sánh với baseline',
      'Cập nhật bản đồ tổng thể sau Nurture',
      'Tính ROI dự kiến cho mỗi module tiếp theo',
      'Xây dựng roadmap 6-12 tháng',
    ],
    deliverable: 'MIND Growth Roadmap',
    deliverableDesc: 'Bản đồ tăng trưởng dài hạn cho doanh nghiệp',
    commitments: [
      'Commit roadmap dài hạn nếu chọn tiếp tục',
      'Dành ngân sách cho phase tiếp theo',
      'Duy trì adoption từ Nurture',
    ],
  },
];

/* ── Hero MIND Diagram ────────────────────────────── */

function MINDHeroDiagram() {
  const [activeStep, setActiveStep] = useState(null);

  return (
    <div className="flex items-center justify-center gap-3 md:gap-6">
      {steps.map((step, i) => {
        const isActive = activeStep === i;
        return (
          <motion.div
            key={step.letter}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + i * 0.15, type: 'spring', stiffness: 150, damping: 15 }}
            className="relative cursor-pointer group"
            onMouseEnter={() => setActiveStep(i)}
            onMouseLeave={() => setActiveStep(null)}
          >
            {/* Glow ring */}
            <div
              className={`absolute inset-0 rounded-3xl transition-all duration-500 ${
                isActive ? 'bg-teal-500/10 shadow-[0_0_60px_rgba(45,225,194,0.2)]' : ''
              }`}
            />
            <div
              className={`relative w-24 h-24 md:w-32 md:h-32 lg:w-36 lg:h-36 rounded-3xl border-2 flex flex-col items-center justify-center transition-all duration-500 ${
                isActive
                  ? 'border-teal-400 bg-teal-500/10'
                  : 'border-white/10 bg-white/[0.03] hover:border-white/20'
              }`}
            >
              <span
                className={`text-4xl md:text-5xl lg:text-6xl font-extrabold leading-none transition-all duration-300 ${
                  isActive
                    ? 'text-teal-300 drop-shadow-[0_0_20px_rgba(45,225,194,0.5)]'
                    : 'text-transparent bg-clip-text bg-gradient-to-b from-teal-300 to-teal-600'
                }`}
              >
                {step.letter}
              </span>
              <span
                className={`text-[10px] md:text-xs font-bold tracking-wider mt-1 transition-colors duration-300 ${
                  isActive ? 'text-teal-300' : 'text-slate-500'
                }`}
              >
                {step.title}
              </span>
            </div>

            {/* Tooltip */}
            {isActive && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full mt-4 left-1/2 -translate-x-1/2 whitespace-nowrap px-5 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-sm text-white font-semibold shadow-2xl z-10"
              >
                {step.titleVi}
              </motion.div>
            )}

            {/* Arrow between letters */}
            {i < 3 && (
              <div className="absolute -right-2 md:-right-4 top-1/2 -translate-y-1/2 text-slate-700">
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

/* ── Step detail section ──────────────────────────── */

function StepSection({ step, index }) {
  const Icon = step.icon;

  return (
    <section className="py-20 md:py-36 px-6 border-t border-white/5 relative overflow-hidden">
      {/* Subtle background glow per step */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-teal-900/[0.06] rounded-full blur-[200px] -z-10" />

      <div className="max-w-7xl mx-auto">
        {/* Top: massive letter + title row */}
        <div className="flex flex-col md:flex-row items-start md:items-end gap-6 md:gap-10 mb-16">
          {/* MASSIVE letter */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, type: 'spring', stiffness: 120 }}
            className="relative"
          >
            <span className="text-[7rem] sm:text-[10rem] md:text-[14rem] lg:text-[16rem] font-extrabold leading-[0.8] text-transparent bg-clip-text bg-gradient-to-b from-teal-200 via-teal-400 to-teal-800 select-none drop-shadow-[0_0_60px_rgba(45,225,194,0.12)]">
              {step.letter}
            </span>
          </motion.div>

          {/* Title + badge */}
          <div className="pb-4 md:pb-8">
            <FadeIn delay={0.1}>
              <h3 className="text-base md:text-lg font-bold text-slate-500 tracking-[0.25em] uppercase mb-2">
                {step.title}
              </h3>
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] mb-5">
                {step.titleVi}
              </h2>
              <span
                className={`inline-block text-sm font-bold px-5 py-2 rounded-full ${
                  step.free
                    ? 'bg-teal-500/15 text-teal-300 border border-teal-500/25'
                    : 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/25'
                }`}
              >
                {step.free ? 'MIỄN PHÍ' : 'CÓ PHÍ'}
              </span>
            </FadeIn>
          </div>
        </div>

        {/* Definition */}
        <FadeIn delay={0.15}>
          <p className="text-xl md:text-2xl text-slate-300 leading-relaxed mb-16 max-w-4xl">
            {step.definition}
          </p>
        </FadeIn>

        {/* Three cards: activities, deliverable, commitments */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Activities */}
          <FadeIn delay={0.2}>
            <div className="p-8 md:p-10 rounded-2xl bg-white/[0.03] border border-white/[0.06] h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-teal-400" />
                </div>
                <h4 className="text-lg font-bold text-teal-300">Mindtransform làm</h4>
              </div>
              <ul className="space-y-4">
                {step.activities.map((act, i) => (
                  <li key={i} className="flex items-start gap-3 text-base text-slate-400 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400/50 flex-shrink-0 mt-2.5" />
                    {act}
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>

          {/* Deliverable */}
          <FadeIn delay={0.3}>
            <div className="p-8 md:p-10 rounded-2xl bg-white/[0.03] border border-white/[0.06] h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-cyan-400" />
                </div>
                <h4 className="text-lg font-bold text-cyan-300">Bạn nhận được</h4>
              </div>
              <div className="p-6 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                <p className="text-white font-bold text-lg mb-2">{step.deliverable}</p>
                <p className="text-base text-slate-500">{step.deliverableDesc}</p>
              </div>
            </div>
          </FadeIn>

          {/* Commitments */}
          <FadeIn delay={0.4}>
            <div className="p-8 md:p-10 rounded-2xl bg-white/[0.03] border border-white/[0.06] h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-amber-400" />
                </div>
                <h4 className="text-lg font-bold text-amber-300">Bạn cần cam kết</h4>
              </div>
              <ul className="space-y-4">
                {step.commitments.map((c, i) => (
                  <li key={i} className="flex items-start gap-3 text-base text-slate-400 leading-relaxed">
                    <CheckCircle2 className="w-5 h-5 text-amber-500/50 flex-shrink-0 mt-0.5" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

/* ── Page ─────────────────────────────────────────── */

export default function MINDFramework() {
  const { openForm } = useModal();

  return (
    <>
      <Helmet>
        <title>Phương pháp MIND — Mindtransform</title>
        <meta
          name="description"
          content="MIND Framework: 4 bước chuyển đổi có đo lường — Map, Isolate, Nurture, Drive. Phương pháp độc quyền của Mindtransform."
        />
      </Helmet>

      {/* ═══════════════════ HERO ═══════════════════ */}
      <section className="py-28 md:py-40 px-6 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-teal-900/15 rounded-full blur-[200px]" />
        </div>

        <div className="max-w-6xl mx-auto text-center">
          <FadeIn>
            <span className="text-teal-400 text-sm md:text-base font-bold tracking-[0.25em] uppercase">
              Methodology
            </span>
            <h1 className="mt-6 text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-extrabold tracking-tight leading-[0.95] mb-8">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-200 via-white to-teal-100">
                Phương pháp MIND
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-16">
              4 bước chuyển đổi có đo lường — từ hiểu rõ đến tăng trưởng
            </p>
          </FadeIn>

          <MINDHeroDiagram />
        </div>
      </section>

      {/* ═══════════════════ PHILOSOPHY ═══════════════════ */}
      <section className="py-28 md:py-36 px-6 border-t border-white/5 overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="relative">
              <div className="absolute -left-6 top-0 bottom-0 w-1.5 bg-gradient-to-b from-teal-400 to-transparent rounded-full" />
              <div className="space-y-10 pl-12">
                <blockquote className="text-2xl md:text-4xl text-slate-100 leading-[1.4] font-light">
                  Phần lớn doanh nghiệp nhỏ thất bại ở chuyển đổi số không phải vì thiếu công cụ — mà vì
                  chưa thay đổi cách nghĩ về vận hành.
                </blockquote>
                <p className="text-xl md:text-2xl text-slate-400 leading-relaxed">
                  MIND đặt tư duy trước công nghệ. Hiểu trước khi làm. Đo trước khi mở rộng. Chứng minh
                  trước khi cam kết.
                </p>
                <p className="text-xl md:text-2xl text-slate-400 leading-relaxed">
                  Mindtransform không gắn vào bất kỳ nền tảng hay công nghệ nào. Lark, KiotViet, Excel, quy
                  trình giấy — cái gì phù hợp thì dùng. MIND là phương pháp, không phải sản phẩm.
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════ STEP DETAILS ═══════════════════ */}
      {steps.map((step, i) => (
        <StepSection key={step.letter} step={step} index={i} />
      ))}

      {/* ═══════════════════ PRICING MODEL ═══════════════════ */}
      <section className="py-28 md:py-40 px-6 border-t border-white/5 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-teal-900/10 rounded-full blur-[180px] -z-10" />

        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <div className="text-center mb-20">
              <span className="text-teal-400 text-sm md:text-base font-bold tracking-[0.2em] uppercase">
                Mô hình tính phí
              </span>
              <h2 className="mt-6 text-4xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05]">
                Cam kết vào kết quả,
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-teal-100">
                  không phải lời hứa
                </span>
              </h2>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              {
                label: 'Build fee',
                pct: '35%',
                when: 'Khi bàn giao Nurture-Build',
                commit: 'Đúng SOW, đúng spec, đúng function',
                pctClass: 'text-teal-300',
                glowClass: 'group-hover:shadow-[0_0_40px_rgba(45,225,194,0.1)]',
              },
              {
                label: 'Outcome milestone 1',
                pct: '35%',
                when: 'Sau 1 tháng adoption ổn định',
                commit: 'Hệ thống vận hành ổn định',
                pctClass: 'text-cyan-300',
                glowClass: 'group-hover:shadow-[0_0_40px_rgba(34,211,238,0.1)]',
              },
              {
                label: 'Outcome milestone 2',
                pct: '30%',
                when: 'Sau đo kết quả (≈3 tháng)',
                commit: 'Metrics đạt ngưỡng cam kết',
                pctClass: 'text-emerald-300',
                glowClass: 'group-hover:shadow-[0_0_40px_rgba(52,211,153,0.1)]',
              },
            ].map((item, i) => (
              <FadeIn key={item.label} delay={i * 0.15}>
                <div className={`group p-10 rounded-2xl bg-white/[0.03] border border-white/[0.06] h-full transition-all duration-500 hover:bg-white/[0.05] ${item.glowClass}`}>
                  <span className={`text-5xl md:text-6xl font-extrabold ${item.pctClass} block mb-4`}>
                    {item.pct}
                  </span>
                  <h3 className="text-xl text-white font-bold mb-3">{item.label}</h3>
                  <p className="text-base text-slate-400 mb-5">{item.when}</p>
                  <div className="pt-5 border-t border-white/5">
                    <p className="text-sm text-slate-500">Cam kết: {item.commit}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.5}>
            <div className="text-center p-8 rounded-2xl bg-teal-500/5 border border-teal-500/10">
              <p className="text-lg text-slate-300 leading-relaxed">
                Map + Isolate + toàn bộ plan:{' '}
                <span className="text-teal-300 font-bold">hoàn toàn miễn phí</span>. Bạn chỉ trả khi
                chọn để Mindtransform thực thi — và chúng tôi commit vào kết quả.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════ POST-PROJECT ═══════════════════ */}
      <section className="py-28 md:py-40 px-6 border-t border-white/5 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <div className="text-center mb-20">
              <span className="text-teal-400 text-sm md:text-base font-bold tracking-[0.2em] uppercase">
                Sau dự án
              </span>
              <h2 className="mt-6 text-4xl md:text-6xl lg:text-7xl font-extrabold">Tiếp tục hành trình</h2>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <FadeIn delay={0.1}>
              <div className="group p-10 md:p-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-teal-500/25 transition-all duration-500 h-full">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-teal-500/10 flex items-center justify-center">
                    <Headphones className="w-7 h-7 text-teal-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Gói Retainer</h3>
                    <span className="text-sm text-teal-400 font-bold">Khuyến nghị</span>
                  </div>
                </div>
                <p className="text-lg text-slate-400 leading-relaxed mb-5">
                  Mindtransform tiếp tục đồng hành. Health check, fix issues, cải tiến, onboard nhân viên mới.
                </p>
                <p className="text-base text-slate-500">Phù hợp: DN không có team tech nội bộ.</p>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="group p-10 md:p-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-indigo-500/25 transition-all duration-500 h-full">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                    <GraduationCap className="w-7 h-7 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Gói Training & Handover</h3>
                  </div>
                </div>
                <p className="text-lg text-slate-400 leading-relaxed mb-5">
                  Mindtransform chuyển giao toàn bộ cho team bạn. Đào tạo chuyên sâu, tài liệu, handover.
                </p>
                <p className="text-base text-slate-500">Phù hợp: DN có team tech/BA sẵn.</p>
              </div>
            </FadeIn>
          </div>

          <FadeIn delay={0.3}>
            <div className="flex items-center justify-center gap-3 text-base md:text-lg text-slate-500">
              <svg width="24" height="24" viewBox="0 0 20 20" fill="none" className="text-teal-400">
                <path d="M10 2a8 8 0 1 1-6.93 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M3.07 6L1 3.5M3.07 6L5.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Cả 2 gói đều dẫn đến MIND vòng tiếp theo — module mới, tăng trưởng tiếp tục
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
              Bắt đầu từ Map —{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-teal-100">
                hoàn toàn miễn phí
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
