import React from 'react';
import { motion } from 'framer-motion';
import { Database, FileSpreadsheet, BarChart3, Globe, Code, Cloud } from 'lucide-react';

const ProductCard = ({ name, logo, description, icon: Icon, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay }}
        className="group relative p-8 rounded-2xl bg-white/5 border border-white/5 hover:border-teal-500/30 transition-all hover:bg-white/[0.07] flex flex-col items-center text-center h-full"
    >
        <div className="h-20 flex items-center justify-center mb-6 w-full">
            {logo ? (
                <img
                    src={logo}
                    alt={name}
                    className="max-h-16 max-w-[80%] object-contain filter grayscale group-hover:grayscale-0 transition-all duration-500 opacity-80 group-hover:opacity-100"
                />
            ) : (
                <Icon className="w-12 h-12 text-slate-500 group-hover:text-teal-400 transition-colors" />
            )}
        </div>
        <h3 className="text-xl font-bold mb-3 text-white">{name}</h3>
        <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
    </motion.div>
);

export default function Products() {
    const products = [
        {
            name: "Lark Suite",
            logo: "/logos/lark-suite.webp",
            description: "Nền tảng làm việc số hợp nhất: Chat, Docs, Base, Approval. Tối ưu hóa quy trình vận hành doanh nghiệp."
        },
        {
            name: "Google Sheets",
            logo: "/logos/google-sheet-la-gi-1-750x451.png",
            description: "Xử lý dữ liệu linh hoạt. Tự động hóa báo cáo và quy trình với App Script và các công cụ tích hợp."
        },
        {
            name: "Google BigQuery",
            logo: "/logos/google_big_query_1_fdeadd0307.png",
            description: "Kho dữ liệu đám mây không máy chủ, khả năng mở rộng cao và chi phí tối ưu cho phân tích dữ liệu lớn."
        },
        {
            name: "Power BI",
            logo: "/logos/Power-BI-Logo-2013.png",
            description: "Biến dữ liệu thành thông tin chi tiết. Trực quan hóa dữ liệu và chia sẻ thông tin chi tiết trên toàn tổ chức."
        },
        {
            name: "Looker Studio",
            logo: "/logos/Looker.svg.png",
            description: "Công cụ Business Intelligence hiện đại, giúp khám phá, phân tích và chia sẻ dữ liệu kinh doanh thời gian thực."
        },
        {
            name: "Salesforce",
            logo: "/logos/Salesforce.com_logo.svg.png",
            description: "Nền tảng CRM số 1 thế giới. Quản lý quan hệ khách hàng, bán hàng và marketing tự động hóa."
        },
        {
            name: "API Integration",
            icon: Code,
            description: "Kết nối các hệ thống rời rạc. Xây dựng luồng dữ liệu tự động giữa các phần mềm (Lark, ERP, CRM...)."
        },
        {
            name: "Nhanh.vn",
            logo: "/logos/nhanh-vn-1024x360-1504511129.png",
            description: "Phần mềm quản lý bán hàng đa kênh. Tích hợp vận chuyển, kho hàng và kế toán."
        }
    ];

    return (
        <div className="py-20 px-6">
            <div className="max-w-7xl mx-auto">
                {/* Header Quote */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-24 max-w-4xl mx-auto"
                >
                    <h1 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">
                        Chúng tôi không bị giới hạn bởi <span className="text-teal-400">Product</span>,
                        <br />
                        chúng tôi tìm ra Product phù hợp với <span className="text-indigo-400">Business</span>.
                    </h1>
                    <div className="h-1 w-24 bg-gradient-to-r from-teal-500 to-indigo-500 mx-auto rounded-full" />
                </motion.div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products.map((product, index) => (
                        <ProductCard
                            key={index}
                            {...product}
                            delay={index * 0.1}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
