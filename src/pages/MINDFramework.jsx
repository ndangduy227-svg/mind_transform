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

function MINDCircleDiagram() {
  const [activeStep, setActiveStep] = useState(null);
  const radius = 120;
  const center = 160;
  const positions = [
    { angle: -90, label: 'M' },
    { angle: 0, label: 'I' },
    { angle: 90, label: 'N' },
    { angle: 180, label: 'D' },
  ];

  return (
    <div className="flex justify-center">
      <svg viewBox="0 0 320 320" className="w-64 h-64 md:w-80 md:h-80">
        {/* Circular path */}
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(45,225,194,0.15)"
          strokeWidth="2"
          strokeDasharray="4 6"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: 'easeInOut' }}
        />

        {/* Arrow indicators on the circle */}
        {positions.map((pos, i) => {
          const midAngle = ((pos.angle + positions[(i + 1) % 4].angle) / 2 + (i === 3 ? 360 : 0)) * (Math.PI / 180);
          const arrowAngle = i === 3
            ? (((180 + -90 + 360) / 2) * Math.PI) / 180
            : midAngle;
          const ax = center + (radius + 2) * Math.cos(arrowAngle);
          const ay = center + (radius + 2) * Math.sin(arrowAngle);
          return (
            <circle
              key={`arrow-${i}`}
              cx={ax}
              cy={ay}
              r="3"
              fill="rgba(45,225,194,0.4)"
            />
          );
        })}

        {/* Step nodes */}
        {positions.map((pos, i) => {
          const rad = (pos.angle * Math.PI) / 180;
          const x = center + radius * Math.cos(rad);
          const y = center + radius * Math.sin(rad);
          const step = steps[i];
          const isActive = activeStep === i;

          return (
            <g
              key={pos.label}
              className="cursor-pointer"
              onMouseEnter={() => setActiveStep(i)}
              onMouseLeave={() => setActiveStep(null)}
            >
              <motion.circle
                cx={x}
                cy={y}
                r={isActive ? 36 : 32}
                fill={isActive ? 'rgba(45,225,194,0.15)' : 'rgba(255,255,255,0.05)'}
                stroke={isActive ? '#2DE1C2' : 'rgba(255,255,255,0.1)'}
                strokeWidth={isActive ? 2 : 1}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 + i * 0.15, type: 'spring', stiffness: 200 }}
              />
              <text
                x={x}
                y={y - 4}
                textAnchor="middle"
                className="text-2xl font-extrabold"
                fill={isActive ? '#2DE1C2' : '#FFFFFF'}
              >
                {pos.label}
              </text>
              <text
                x={x}
                y={y + 14}
                textAnchor="middle"
                className="text-[8px] font-medium"
                fill={isActive ? '#2DE1C2' : '#94A3B8'}
              >
                {step.titleVi}
              </text>
            </g>
          );
        })}

        {/* Center text */}
        <text x={center} y={center - 6} textAnchor="middle" className="text-xs font-bold" fill="#2DE1C2">
          MIND
        </text>
        <text x={center} y={center + 10} textAnchor="middle" className="text-[7px]" fill="#64748B">
          Framework
        </text>
      </svg>
    </div>
  );
}

function StepSection({ step, index }) {
  const Icon = step.icon;
  const isEven = index % 2 === 0;

  return (
    <section className="py-20 md:py-28 px-6 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className={`grid md:grid-cols-12 gap-10 md:gap-16 items-start ${isEven ? '' : 'md:[direction:rtl]'}`}>
          {/* Left: big letter + meta */}
          <div className={`md:col-span-4 ${isEven ? '' : 'md:[direction:ltr]'}`}>
            <FadeIn>
              <div className="sticky top-28">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, type: 'spring' }}
                  className="mb-6"
                >
                  <span className="text-8xl md:text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-teal-300 to-teal-700 leading-none">
                    {step.letter}
                  </span>
                </motion.div>
                <div className="space-y-1 mb-4">
                  <h3 className="text-xs font-bold text-slate-500 tracking-widest">{step.title}</h3>
                  <h2 className="text-2xl md:text-3xl font-bold text-white">{step.titleVi}</h2>
                </div>
                <span
                  className={`inline-block text-xs font-bold px-3 py-1.5 rounded-full ${
                    step.free
                      ? 'bg-teal-500/15 text-teal-400 border border-teal-500/20'
                      : 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20'
                  }`}
                >
                  {step.free ? 'MIỄN PHÍ' : 'CÓ PHÍ'}
                </span>
              </div>
            </FadeIn>
          </div>

          {/* Right: content */}
          <div className={`md:col-span-8 ${isEven ? '' : 'md:[direction:ltr]'}`}>
            <FadeIn delay={0.15}>
              <p className="text-lg text-slate-300 leading-relaxed mb-10">{step.definition}</p>
            </FadeIn>

            {/* Three columns: activities, deliverable, commitments */}
            <div className="grid sm:grid-cols-3 gap-6">
              {/* Activities */}
              <FadeIn delay={0.2}>
                <div className="p-5 rounded-xl bg-white/[0.03] border border-white/5 h-full">
                  <div className="flex items-center gap-2 mb-4">
                    <Icon className="w-4 h-4 text-teal-400" />
                    <h4 className="text-sm font-bold text-teal-400">Mindtransform làm</h4>
                  </div>
                  <ul className="space-y-3">
                    {step.activities.map((act, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-400 leading-relaxed">
                        <span className="w-1 h-1 rounded-full bg-teal-500/50 flex-shrink-0 mt-2" />
                        {act}
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeIn>

              {/* Deliverable */}
              <FadeIn delay={0.3}>
                <div className="p-5 rounded-xl bg-white/[0.03] border border-white/5 h-full">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-4 h-4 text-cyan-400" />
                    <h4 className="text-sm font-bold text-cyan-400">Bạn nhận được</h4>
                  </div>
                  <div className="p-4 rounded-lg bg-white/[0.03] border border-white/5">
                    <p className="text-white font-semibold text-sm mb-1">{step.deliverable}</p>
                    <p className="text-xs text-slate-500">{step.deliverableDesc}</p>
                  </div>
                </div>
              </FadeIn>

              {/* Commitments */}
              <FadeIn delay={0.4}>
                <div className="p-5 rounded-xl bg-white/[0.03] border border-white/5 h-full">
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="w-4 h-4 text-amber-400" />
                    <h4 className="text-sm font-bold text-amber-400">Bạn cần cam kết</h4>
                  </div>
                  <ul className="space-y-3">
                    {step.commitments.map((c, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-400 leading-relaxed">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-500/50 flex-shrink-0 mt-0.5" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

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

      {/* ===== HERO ===== */}
      <section className="py-24 md:py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-900/15 rounded-full blur-[150px]" />
        </div>

        <div className="max-w-5xl mx-auto text-center">
          <FadeIn>
            <span className="text-teal-500 text-sm font-bold tracking-widest uppercase">
              Methodology
            </span>
            <h1 className="mt-4 text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-200 to-white">
                Phương pháp MIND
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-12">
              4 bước chuyển đổi có đo lường — từ hiểu rõ đến tăng trưởng
            </p>
          </FadeIn>

          <FadeIn delay={0.3}>
            <MINDCircleDiagram />
          </FadeIn>
        </div>
      </section>

      {/* ===== PHILOSOPHY ===== */}
      <section className="py-20 md:py-28 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <div className="relative">
              <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-teal-500 to-transparent rounded-full" />
              <div className="space-y-8 pl-8">
                <blockquote className="text-xl md:text-2xl text-slate-200 leading-relaxed font-light">
                  Phần lớn doanh nghiệp nhỏ thất bại ở chuyển đổi số không phải vì thiếu công cụ — mà vì
                  chưa thay đổi cách nghĩ về vận hành.
                </blockquote>
                <p className="text-lg text-slate-400 leading-relaxed">
                  MIND đặt tư duy trước công nghệ. Hiểu trước khi làm. Đo trước khi mở rộng. Chứng minh
                  trước khi cam kết.
                </p>
                <p className="text-lg text-slate-400 leading-relaxed">
                  Mindtransform không gắn vào bất kỳ nền tảng hay công nghệ nào. Lark, KiotViet, Excel, quy
                  trình giấy — cái gì phù hợp thì dùng. MIND là phương pháp, không phải sản phẩm.
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ===== STEP DETAILS ===== */}
      {steps.map((step, i) => (
        <StepSection key={step.letter} step={step} index={i} />
      ))}

      {/* ===== PRICING MODEL ===== */}
      <section className="py-24 md:py-32 px-6 border-t border-white/5 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-teal-900/10 rounded-full blur-[120px] -z-10" />

        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="text-teal-500 text-sm font-bold tracking-widest uppercase">
                Mô hình tính phí
              </span>
              <h2 className="mt-4 text-3xl md:text-5xl font-bold">
                Cam kết vào kết quả,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-teal-200">
                  không phải lời hứa
                </span>
              </h2>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {[
              {
                label: 'Build fee',
                pct: '35%',
                when: 'Khi bàn giao Nurture-Build',
                commit: 'Đúng SOW, đúng spec, đúng function',
                pctClass: 'text-teal-400',
              },
              {
                label: 'Outcome milestone 1',
                pct: '35%',
                when: 'Sau 1 tháng adoption ổn định',
                commit: 'Hệ thống vận hành ổn định',
                pctClass: 'text-cyan-400',
              },
              {
                label: 'Outcome milestone 2',
                pct: '30%',
                when: 'Sau đo kết quả (≈3 tháng)',
                commit: 'Metrics đạt ngưỡng cam kết',
                pctClass: 'text-emerald-400',
              },
            ].map((item, i) => (
              <FadeIn key={item.label} delay={i * 0.15}>
                <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 h-full">
                  <div className="flex items-baseline gap-2 mb-4">
                    <span
                      className={`text-3xl font-extrabold ${item.pctClass}`}
                    >
                      {item.pct}
                    </span>
                  </div>
                  <h3 className="text-white font-semibold mb-2">{item.label}</h3>
                  <p className="text-sm text-slate-400 mb-3">{item.when}</p>
                  <div className="pt-3 border-t border-white/5">
                    <p className="text-xs text-slate-500">Cam kết: {item.commit}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.5}>
            <div className="text-center p-6 rounded-xl bg-teal-500/5 border border-teal-500/10">
              <p className="text-slate-300">
                Map + Isolate + toàn bộ plan:{' '}
                <span className="text-teal-400 font-semibold">hoàn toàn miễn phí</span>. Bạn chỉ trả khi
                chọn để Mindtransform thực thi — và chúng tôi commit vào kết quả.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ===== POST-PROJECT ===== */}
      <section className="py-24 md:py-32 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="text-teal-500 text-sm font-bold tracking-widest uppercase">
                Sau dự án
              </span>
              <h2 className="mt-4 text-3xl md:text-5xl font-bold">Tiếp tục hành trình</h2>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 gap-8 mb-10">
            <FadeIn delay={0.1}>
              <div className="group p-8 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-teal-500/20 transition-all h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center">
                    <Headphones className="w-5 h-5 text-teal-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Gói Retainer</h3>
                    <span className="text-xs text-teal-400 font-medium">Khuyến nghị</span>
                  </div>
                </div>
                <p className="text-slate-400 leading-relaxed mb-4">
                  Mindtransform tiếp tục đồng hành. Health check, fix issues, cải tiến, onboard nhân viên
                  mới.
                </p>
                <p className="text-sm text-slate-500">
                  Phù hợp: DN không có team tech nội bộ.
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="group p-8 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-indigo-500/20 transition-all h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Gói Training & Handover</h3>
                  </div>
                </div>
                <p className="text-slate-400 leading-relaxed mb-4">
                  Mindtransform chuyển giao toàn bộ cho team bạn. Đào tạo chuyên sâu, tài liệu, handover.
                </p>
                <p className="text-sm text-slate-500">
                  Phù hợp: DN có team tech/BA sẵn.
                </p>
              </div>
            </FadeIn>
          </div>

          <FadeIn delay={0.3}>
            <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-teal-500">
                <path
                  d="M10 2a8 8 0 1 1-6.93 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path d="M3.07 6L1 3.5M3.07 6L5.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Cả 2 gói đều dẫn đến MIND vòng tiếp theo — module mới, tăng trưởng tiếp tục
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
              Bắt đầu từ Map —{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-teal-200">
                hoàn toàn miễn phí
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
