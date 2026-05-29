import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, FileJson, Download, Loader2, CheckCircle2, XCircle, AlertTriangle, FileText, Layers, Trash2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../../lib/supabase';
import { invalidateCache } from '../../services/cmsService';

// JSON schema definitions
// Các trường ảnh — sẽ tự động loại bỏ nếu rỗng trước khi insert
const IMAGE_FIELDS = ['cover_image', 'thumbnail', 'screenshots'];

const POST_SCHEMA = {
    required: ['title', 'slug', 'content'],
    fields: {
        title: 'Tiêu đề bài viết',
        slug: 'Đường dẫn (VD: bai-viet-moi)',
        summary: 'Mô tả ngắn',
        content: 'Nội dung HTML',
        cover_image: '(tuỳ chọn) URL ảnh bìa — bỏ trống nếu chưa có',
        category: 'Strategy | Technology | Methodology | Data | Case Study',
        author: 'Tên tác giả',
        status: 'Draft | Published',
        date: 'YYYY-MM-DD',
    }
};

const TEMPLATE_SCHEMA = {
    required: ['name', 'slug'],
    fields: {
        name: 'Tên template',
        slug: 'Đường dẫn',
        summary: 'Mô tả ngắn',
        description: 'Mô tả chi tiết (HTML)',
        use_case: 'Bài toán giải quyết (HTML)',
        category: 'CRM | HR | Project Management | Finance | Operations | Marketing | Sales',
        industry: 'Ngành nghề',
        thumbnail: '(tuỳ chọn) URL ảnh đại diện — bỏ trống nếu chưa có',
        screenshots: '(tuỳ chọn) Danh sách URL ảnh, phân cách bằng dấu phẩy',
        template_link: 'Link Lark Template gốc',
        form_link: 'Link form đăng ký',
        difficulty: 'Beginner | Intermediate | Advanced',
        status: 'Draft | Published',
        date: 'YYYY-MM-DD',
    }
};

const SAMPLE_POSTS = [
    {
        title: "Chuyển đổi số cho doanh nghiệp vừa và nhỏ",
        slug: "chuyen-doi-so-doanh-nghiep-vua-va-nho",
        summary: "Hướng dẫn từng bước triển khai chuyển đổi số cho SME với nguồn lực hạn chế.",
        content: "<h2>Tại sao SME cần chuyển đổi số?</h2><p>Nội dung bài viết ở đây...</p>",
        category: "Strategy",
        author: "Mind.Transform",
        status: "Draft",
        date: new Date().toISOString().split('T')[0]
    }
];

const SAMPLE_TEMPLATES = [
    {
        name: "CRM Pipeline cho Sales Team",
        slug: "crm-pipeline-sales-team",
        summary: "Quản lý pipeline bán hàng chuyên nghiệp trên Lark Base.",
        description: "<p>Mô tả chi tiết template...</p>",
        use_case: "<p>Bài toán: Theo dõi lead từ tiếp cận đến chốt deal...</p>",
        category: "CRM",
        industry: "Sales, Retail",
        difficulty: "Beginner",
        status: "Draft",
        date: new Date().toISOString().split('T')[0]
    }
];

export default function BulkImport() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [importType, setImportType] = useState('posts'); // 'posts' | 'templates'
    const [items, setItems] = useState([]);
    const [errors, setErrors] = useState([]);
    const [importing, setImporting] = useState(false);
    const [result, setResult] = useState(null); // { success: number, failed: number, errors: [] }

    const schema = importType === 'posts' ? POST_SCHEMA : TEMPLATE_SCHEMA;

    const downloadSample = () => {
        const sample = importType === 'posts' ? SAMPLE_POSTS : SAMPLE_TEMPLATES;
        const blob = new Blob([JSON.stringify(sample, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sample_${importType}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const validateItem = (item, index) => {
        const errs = [];
        const required = schema.required;
        for (const field of required) {
            const key = importType === 'templates' && field === 'title' ? 'name' : field;
            if (!item[key] || !item[key].toString().trim()) {
                errs.push(`[${index + 1}] Thiếu trường bắt buộc: ${key}`);
            }
        }
        // Check slug format
        if (item.slug && !/^[a-z0-9-]+$/.test(item.slug)) {
            errs.push(`[${index + 1}] Slug "${item.slug}" không hợp lệ (chỉ chấp nhận a-z, 0-9, dấu gạch ngang)`);
        }
        return errs;
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setResult(null);
        setErrors([]);

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                let parsed;
                const text = event.target.result;

                if (file.name.endsWith('.csv')) {
                    parsed = parseCSV(text);
                } else {
                    parsed = JSON.parse(text);
                }

                if (!Array.isArray(parsed)) {
                    parsed = [parsed];
                }

                // Validate all items
                const allErrors = [];
                parsed.forEach((item, idx) => {
                    const itemErrors = validateItem(item, idx);
                    allErrors.push(...itemErrors);
                });

                // Auto-fill defaults
                const today = new Date().toISOString().split('T')[0];
                parsed = parsed.map(item => ({
                    ...item,
                    status: item.status || 'Draft',
                    date: item.date || today,
                    ...(importType === 'posts' ? {
                        author: item.author || 'Admin',
                        category: item.category || 'Strategy',
                    } : {
                        difficulty: item.difficulty || 'Beginner',
                        category: item.category || 'CRM',
                    })
                }));

                setItems(parsed);
                setErrors(allErrors);
            } catch (err) {
                setErrors([`Lỗi đọc file: ${err.message}. Đảm bảo file là JSON hợp lệ.`]);
                setItems([]);
            }
        };
        reader.readAsText(file);

        // Reset file input
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const parseCSV = (text) => {
        const lines = text.split('\n').filter(l => l.trim());
        if (lines.length < 2) throw new Error('CSV phải có ít nhất 1 header + 1 dòng dữ liệu');

        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        const results = [];

        for (let i = 1; i < lines.length; i++) {
            // Handle CSV with quoted fields
            const values = [];
            let current = '';
            let inQuotes = false;

            for (const char of lines[i]) {
                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                    values.push(current.trim());
                    current = '';
                } else {
                    current += char;
                }
            }
            values.push(current.trim());

            const obj = {};
            headers.forEach((header, idx) => {
                obj[header] = values[idx] || '';
            });
            results.push(obj);
        }

        return results;
    };

    const removeItem = (index) => {
        setItems(items.filter((_, i) => i !== index));
    };

    /** Loại bỏ các trường ảnh rỗng + trường không thuộc schema để tránh lỗi insert */
    const cleanItemForInsert = (item) => {
        const cleaned = { ...item };
        // Xoá trường ảnh rỗng — để Supabase dùng default (null)
        for (const field of IMAGE_FIELDS) {
            if (field in cleaned && (!cleaned[field] || !cleaned[field].toString().trim())) {
                delete cleaned[field];
            }
        }
        // Xoá các trường undefined hoặc rỗng không cần thiết
        for (const key of Object.keys(cleaned)) {
            if (cleaned[key] === undefined || cleaned[key] === null) {
                delete cleaned[key];
            }
        }
        return cleaned;
    };

    const handleImport = async () => {
        if (items.length === 0) return;

        setImporting(true);
        const importResult = { success: 0, failed: 0, errors: [] };

        // Insert in batches of 10
        const batchSize = 10;
        for (let i = 0; i < items.length; i += batchSize) {
            const batch = items.slice(i, i + batchSize).map(cleanItemForInsert);
            const table = importType;

            const { error } = await supabase.from(table).insert(batch);

            if (error) {
                importResult.failed += batch.length;
                importResult.errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${error.message}`);
            } else {
                importResult.success += batch.length;
            }
        }

        invalidateCache(importType);
        setResult(importResult);
        setImporting(false);

        if (importResult.failed === 0) {
            setItems([]);
        }
    };

    const nameField = importType === 'posts' ? 'title' : 'name';

    return (
        <>
            <Helmet>
                <title>Import hàng loạt | Admin</title>
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>

            <div className="min-h-screen bg-[#0A0A0A] text-slate-300 pb-20">
                {/* Header */}
                <header className="bg-black/50 border-b border-white/10 sticky top-0 z-50 backdrop-blur-md">
                    <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link to="/admin" className="p-2 -ml-2 text-slate-400 hover:text-white transition-colors">
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <h1 className="text-xl font-bold text-white flex items-center gap-2">
                                <Upload className="w-5 h-5 text-teal-400" />
                                Import hàng loạt
                            </h1>
                        </div>
                    </div>
                </header>

                <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">

                    {/* Step 1: Choose type */}
                    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Bước 1 — Chọn loại nội dung</h2>
                        <div className="flex gap-4">
                            <button
                                onClick={() => { setImportType('posts'); setItems([]); setErrors([]); setResult(null); }}
                                className={`flex items-center gap-3 px-6 py-4 rounded-xl font-medium transition-all flex-1 ${
                                    importType === 'posts'
                                        ? 'bg-teal-500/10 text-teal-400 border-2 border-teal-500/30'
                                        : 'bg-white/5 text-slate-400 border-2 border-transparent hover:bg-white/10'
                                }`}
                            >
                                <FileText className="w-5 h-5" />
                                <div className="text-left">
                                    <div className="font-bold">Blog Posts</div>
                                    <div className="text-xs opacity-60">Bài viết blog</div>
                                </div>
                            </button>
                            <button
                                onClick={() => { setImportType('templates'); setItems([]); setErrors([]); setResult(null); }}
                                className={`flex items-center gap-3 px-6 py-4 rounded-xl font-medium transition-all flex-1 ${
                                    importType === 'templates'
                                        ? 'bg-teal-500/10 text-teal-400 border-2 border-teal-500/30'
                                        : 'bg-white/5 text-slate-400 border-2 border-transparent hover:bg-white/10'
                                }`}
                            >
                                <Layers className="w-5 h-5" />
                                <div className="text-left">
                                    <div className="font-bold">Lark Templates</div>
                                    <div className="text-xs opacity-60">Template hệ thống</div>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Step 2: Schema + Download sample */}
                    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Bước 2 — Chuẩn bị file JSON</h2>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Schema reference */}
                            <div>
                                <h3 className="text-white font-medium mb-3">Cấu trúc JSON ({importType === 'posts' ? 'Blog Post' : 'Template'})</h3>
                                <div className="bg-black/50 border border-white/10 rounded-xl p-4 font-mono text-sm space-y-1 max-h-[300px] overflow-y-auto custom-scrollbar">
                                    <div className="text-slate-500">{'['}</div>
                                    <div className="text-slate-500 pl-2">{'{'}</div>
                                    {Object.entries(schema.fields).map(([key, desc]) => (
                                        <div key={key} className="pl-4">
                                            <span className={schema.required.includes(key) ? 'text-teal-400' : 'text-slate-400'}>
                                                "{key}"
                                            </span>
                                            <span className="text-slate-600">: </span>
                                            <span className="text-slate-500">
                                                "// {desc}"
                                            </span>
                                            {schema.required.includes(key) && (
                                                <span className="text-amber-500 text-xs ml-2">*bắt buộc</span>
                                            )}
                                        </div>
                                    ))}
                                    <div className="text-slate-500 pl-2">{'}'}</div>
                                    <div className="text-slate-500">{']'}</div>
                                </div>
                            </div>

                            {/* AI Prompt guide */}
                            <div>
                                <h3 className="text-white font-medium mb-3">Prompt mẫu cho AI</h3>
                                <div className="bg-gradient-to-br from-indigo-900/20 to-slate-900/50 border border-white/10 rounded-xl p-4 text-sm text-slate-300 leading-relaxed">
                                    <p className="mb-3">Copy prompt này cho ChatGPT / Claude:</p>
                                    <div className="bg-black/40 rounded-lg p-3 text-xs font-mono text-slate-400 whitespace-pre-wrap">
{importType === 'posts'
? `Viết cho tôi 5 bài blog về chuyển đổi số.
Xuất ra JSON array, mỗi bài có cấu trúc:
{
  "title": "...",
  "slug": "tieu-de-khong-dau",
  "summary": "Mô tả 1-2 câu",
  "content": "<h2>...</h2><p>...</p>",
  "category": "Strategy",
  "author": "Mind.Transform",
  "status": "Draft",
  "date": "${new Date().toISOString().split('T')[0]}"
}
Nội dung content dùng HTML.
Slug viết thường, không dấu, nối bằng "-".`
: `Viết cho tôi 5 template Lark cho doanh nghiệp.
Xuất ra JSON array, mỗi template có cấu trúc:
{
  "name": "...",
  "slug": "ten-khong-dau",
  "summary": "Mô tả 1-2 câu",
  "description": "<p>Mô tả chi tiết HTML</p>",
  "use_case": "<p>Bài toán giải quyết</p>",
  "category": "CRM",
  "industry": "Retail, F&B",
  "difficulty": "Beginner",
  "status": "Draft",
  "date": "${new Date().toISOString().split('T')[0]}"
}`}
                                    </div>
                                </div>

                                <button
                                    onClick={downloadSample}
                                    className="mt-4 flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white transition-colors w-full justify-center"
                                >
                                    <Download className="w-4 h-4" />
                                    Tải file JSON mẫu
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Step 3: Upload */}
                    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Bước 3 — Upload file</h2>

                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-white/10 hover:border-teal-500/30 rounded-xl p-10 text-center cursor-pointer transition-all group"
                        >
                            <FileJson className="w-12 h-12 text-slate-600 group-hover:text-teal-400 mx-auto mb-4 transition-colors" />
                            <p className="text-white font-medium mb-1">Click để chọn file</p>
                            <p className="text-sm text-slate-500">Hỗ trợ: .json, .csv</p>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".json,.csv"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                        </div>

                        {/* Validation errors */}
                        {errors.length > 0 && (
                            <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                                <div className="flex items-center gap-2 text-red-400 font-medium mb-2">
                                    <AlertTriangle className="w-4 h-4" />
                                    Phát hiện {errors.length} lỗi
                                </div>
                                <ul className="text-sm text-red-300/80 space-y-1">
                                    {errors.map((err, i) => (
                                        <li key={i}>• {err}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Step 4: Preview */}
                    {items.length > 0 && !result && (
                        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                                    Bước 4 — Xem trước ({items.length} mục)
                                </h2>
                                <button
                                    onClick={handleImport}
                                    disabled={importing || errors.length > 0}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-teal-500 hover:bg-teal-400 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                                >
                                    {importing ? (
                                        <><Loader2 className="w-4 h-4 animate-spin" /> Đang import...</>
                                    ) : (
                                        <><Upload className="w-4 h-4" /> Import {items.length} mục</>
                                    )}
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-white/10">
                                            <th className="text-left py-3 px-3 text-slate-500 font-medium w-8">#</th>
                                            <th className="text-left py-3 px-3 text-slate-500 font-medium">
                                                {importType === 'posts' ? 'Tiêu đề' : 'Tên'}
                                            </th>
                                            <th className="text-left py-3 px-3 text-slate-500 font-medium">Slug</th>
                                            <th className="text-left py-3 px-3 text-slate-500 font-medium">Danh mục</th>
                                            <th className="text-left py-3 px-3 text-slate-500 font-medium">Trạng thái</th>
                                            <th className="text-left py-3 px-3 text-slate-500 font-medium w-12"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((item, idx) => (
                                            <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.02]">
                                                <td className="py-3 px-3 text-slate-600">{idx + 1}</td>
                                                <td className="py-3 px-3 text-white font-medium truncate max-w-[250px]">
                                                    {item[nameField] || <span className="text-red-400">Thiếu</span>}
                                                </td>
                                                <td className="py-3 px-3 text-slate-400 font-mono text-xs">
                                                    {item.slug || <span className="text-red-400">Thiếu</span>}
                                                </td>
                                                <td className="py-3 px-3">
                                                    <span className="px-2 py-1 bg-white/5 rounded text-xs text-slate-300">
                                                        {item.category}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-3">
                                                    <span className={`px-2 py-1 rounded text-xs ${
                                                        item.status === 'Published'
                                                            ? 'bg-emerald-500/10 text-emerald-400'
                                                            : 'bg-amber-500/10 text-amber-400'
                                                    }`}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-3">
                                                    <button
                                                        onClick={() => removeItem(idx)}
                                                        className="p-1 text-slate-600 hover:text-red-400 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Result */}
                    {result && (
                        <div className={`border rounded-2xl p-8 text-center ${
                            result.failed === 0
                                ? 'bg-emerald-500/5 border-emerald-500/20'
                                : 'bg-amber-500/5 border-amber-500/20'
                        }`}>
                            {result.failed === 0 ? (
                                <>
                                    <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                                    <h3 className="text-2xl font-bold text-white mb-2">Import thành công!</h3>
                                    <p className="text-slate-400 mb-6">
                                        Đã thêm <strong className="text-emerald-400">{result.success}</strong> {importType === 'posts' ? 'bài viết' : 'template'} vào hệ thống.
                                    </p>
                                </>
                            ) : (
                                <>
                                    <AlertTriangle className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                                    <h3 className="text-2xl font-bold text-white mb-2">Import hoàn tất với lỗi</h3>
                                    <p className="text-slate-400 mb-2">
                                        Thành công: <strong className="text-emerald-400">{result.success}</strong> |
                                        Thất bại: <strong className="text-red-400">{result.failed}</strong>
                                    </p>
                                    {result.errors.length > 0 && (
                                        <div className="mt-4 text-left bg-black/30 rounded-xl p-4 max-w-md mx-auto">
                                            {result.errors.map((err, i) => (
                                                <p key={i} className="text-sm text-red-300 flex items-start gap-2">
                                                    <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> {err}
                                                </p>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}

                            <div className="flex gap-3 justify-center mt-6">
                                <Link
                                    to="/admin"
                                    className="px-6 py-2.5 bg-teal-500 hover:bg-teal-400 text-white rounded-xl font-medium transition-colors"
                                >
                                    Về Dashboard
                                </Link>
                                <button
                                    onClick={() => { setResult(null); setItems([]); setErrors([]); }}
                                    className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-colors border border-white/10"
                                >
                                    Import thêm
                                </button>
                            </div>
                        </div>
                    )}

                </main>
            </div>
        </>
    );
}
