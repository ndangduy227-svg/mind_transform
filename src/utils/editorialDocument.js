export const EDITORIAL_SCHEMA = 'mindtransform.article';
export const EDITORIAL_VERSION = 1;
export const FORMATS = { standard: 'Bài thường', longform: 'Longform tạp chí', explainer: 'Visual explainer' };
export const BLOCK_TYPES = { text: 'Đoạn nội dung', image: 'Ảnh & chú thích', quote: 'Trích dẫn / ý nhấn', stats: 'Cụm số liệu', workflow: 'Quy trình tương tác', gallery: 'Bộ ảnh', timeline: 'Dòng thời gian', comparison: 'So sánh hai cách', checklist: 'Checklist' };

export function blockId() { return globalThis.crypto?.randomUUID?.() || `block-${Date.now()}-${Math.random().toString(36).slice(2,10)}`; }

export function createBlock(type) {
    const defaults = {
        text: { content: '', syntax: 'html' },
        image: { src: '', alt: '', caption: '', source: '', width: 'wide', evidence: false },
        quote: { text: '', attribution: '' },
        stats: { title: '', items: [{ value: '', label: '' }], source: '' },
        workflow: { title: '', steps: [{ name: '', summary: '', title: '', copy: '' }] },
        gallery: { title: '', images: [{ src: '', title: '', caption: '' }], disclosure: '', evidence: false },
        timeline: { title: '', events: [{ label: '', title: '', body: '' }] },
        comparison: { title: '', beforeLabel: 'Cách hiện tại', afterLabel: 'Cách đề xuất', items: [{ name: '', before: '', after: '' }], source: '' },
        checklist: { title: '', items: [''] },
    };
    if (!defaults[type]) throw new Error('Loại khối chưa được hỗ trợ.');
    const result = { id: blockId(), type, ...structuredClone(defaults[type]) };
    for(const key of ['items','steps','images','events']) if(Array.isArray(result[key])) result[key]=result[key].map(item=>item&&typeof item==='object'?{id:blockId(),...item}:item);
    return result;
}

export function createDocument(format = 'longform', legacyContent = '') {
    const text = createBlock('text');
    text.content = legacyContent;
    text.syntax = /<(p|div|h[1-6]|ul|ol|table|img|figure|blockquote|pre)\b/i.test(legacyContent) ? 'html' : legacyContent ? 'markdown' : 'html';
    return {
        schema: EDITORIAL_SCHEMA, version: EDITORIAL_VERSION,
        format: FORMATS[format] ? format : 'longform',
        appearance: { theme: 'paper', width: 'comfortable', showContents: true },
        hero: { title: '', label: '', lead: '', coverMode: 'image', caption: '', disclosure: '' },
        blocks: [text],
        cta: { enabled: true, title: '', body: '', label: 'Cùng Mindtransform đọc vị điểm kẹt', action: 'consult', url: '' },
    };
}

export function decodeDocument(content) {
    let value;
    if (content && typeof content === 'object') value = content;
    else {
        if (typeof content !== 'string' || !content.trim().startsWith('{')) return { kind: 'legacy' };
        try { value = JSON.parse(content); }
        catch { return content.includes(EDITORIAL_SCHEMA) ? { kind: 'invalid', message: 'Dữ liệu cấu hình bị lỗi. Nội dung gốc được giữ nguyên.' } : { kind: 'legacy' }; }
    }
    if (value?.schema !== EDITORIAL_SCHEMA) return { kind: 'legacy' };
    if (value.version !== EDITORIAL_VERSION) return { kind: 'unsupported', message: 'Phiên bản định dạng này chưa được hỗ trợ. Nội dung gốc được giữ nguyên.' };
    if (!Array.isArray(value.blocks) || value.blocks.some(block => !block || !BLOCK_TYPES[block.type])) return { kind: 'invalid', message: 'Có loại khối không hợp lệ. Nội dung gốc được giữ nguyên.' };
    const base = createDocument();
    const document = { ...value, appearance: { ...base.appearance, ...value.appearance }, hero: { ...base.hero, ...value.hero }, cta: { ...base.cta, ...value.cta } };
    try { const issues=documentIssues(document);if(issues.length)return {kind:'invalid',message:issues.join('\n')}; }
    catch { return {kind:'invalid',message:'Cấu trúc khối không hợp lệ. Nội dung gốc được giữ nguyên.'}; }
    return { kind: 'structured', document };
}

export function safeEditorialUrl(value, { image = false } = {}) {
    if (typeof value !== 'string' || !value.trim() || /[\u0000-\u0020\\]/.test(value.trim())) return false;
    const url = value.trim();
    if (/^\/(?!\/)/.test(url)) return true;
    if (!image && /^#[\p{L}\p{N}_-]+$/u.test(url)) return true;
    try { return new URL(url).protocol === 'https:' || new URL(url).protocol === 'http:'; } catch { return false; }
}

export function documentIssues(doc, { publish = false } = {}) {
    const errors = [];
    const need = (value, label) => { if (publish && !String(value || '').replace(/<[^>]*>/g,'').replace(/&(?:nbsp|#160|#x0*a0);/gi,' ').trim()) errors.push(`Thiếu ${label}.`); };
    const url = (value, label, image = false) => { if (value && !safeEditorialUrl(value, { image })) errors.push(`${label} cần là URL http/https hoặc đường dẫn trong website.`); };
    if (doc?.schema !== EDITORIAL_SCHEMA || doc.version !== 1 || !FORMATS[doc.format] || !Array.isArray(doc.blocks)) return ['Cấu trúc bài viết không hợp lệ.'];
    for(const [name,fields] of Object.entries({hero:['title','label','lead','coverMode','caption','disclosure'],cta:['title','body','label','action','url']})) for(const field of fields) if(typeof doc[name]?.[field]!=='string') errors.push(`Cấu hình ${name}.${field} phải là chữ.`);
    if(typeof doc.cta?.enabled!=='boolean')errors.push('Cấu hình CTA không hợp lệ.');
    if (doc.blocks.length > 80) errors.push('Tối đa 80 khối trong một bài.');
    if (publish && !doc.blocks.length) errors.push('Bài xuất bản cần có nội dung.');
    if (!['paper','night'].includes(doc.appearance?.theme) || !['comfortable','wide'].includes(doc.appearance?.width) || typeof doc.appearance?.showContents !== 'boolean') errors.push('Cấu hình giao diện không hợp lệ.');
    if (!['image','workflow','none'].includes(doc.hero?.coverMode)) errors.push('Kiểu bìa không hợp lệ.');
    if (!['consult','link'].includes(doc.cta?.action)) errors.push('Hành động cuối bài không hợp lệ.');
    if (doc.cta?.enabled && doc.cta.action === 'link') { need(doc.cta.url,'liên kết cuối bài'); url(doc.cta.url,'Liên kết cuối bài'); }
    const ids = new Set();
    doc.blocks.forEach((block, index) => {
        const label = `khối ${index + 1}`;
        if (!block?.id || typeof block.id !== 'string' || ids.has(block.id)) errors.push(`Mã ${label} bị thiếu hoặc trùng.`);
        ids.add(block?.id);
        if (!BLOCK_TYPES[block?.type]) { errors.push(`Loại ${label} không được hỗ trợ.`); return; }
        const textFields = {text:['content','syntax'],image:['src','alt','caption','source','width'],quote:['text','attribution'],stats:['title','source'],workflow:['title'],gallery:['title','disclosure'],timeline:['title'],comparison:['title','beforeLabel','afterLabel','source'],checklist:['title']}[block.type];
        if(textFields.some(key=>typeof block[key]!=='string')){errors.push(`Trường chữ trong ${label} không hợp lệ.`);return;}
        if (block.type === 'text') { need(block.content,`nội dung ${label}`); if (!['html','markdown'].includes(block.syntax)) errors.push(`Định dạng chữ ${label} không hợp lệ.`); }
        if (block.type === 'image') { need(block.src,`ảnh ${label}`); need(block.alt,`mô tả ảnh ${label}`); url(block.src,`Ảnh ${label}`,true); if (!['reading','wide','full'].includes(block.width)) errors.push(`Khổ ảnh ${label} không hợp lệ.`); }
        if (block.type === 'quote') need(block.text,`ý nhấn ${label}`);
        const key = ({ stats:'items',workflow:'steps',gallery:'images',timeline:'events',comparison:'items',checklist:'items' })[block.type];
        if (!key) return;
        const items = block[key];
        if (!Array.isArray(items) || items.length > 30) { errors.push(`Danh sách ${label} không hợp lệ (tối đa 30 mục).`); return; }
        if(block.type==='checklist' ? items.some(item=>typeof item!=='string') : items.some(item=>!item||typeof item!=='object'||Array.isArray(item))) {errors.push(`Mục trong ${label} không hợp lệ.`);return;}
        const itemFields={stats:['value','label'],workflow:['name','summary','title','copy'],gallery:['src','title','caption'],timeline:['label','title','body'],comparison:['name','before','after']}[block.type];
        if(itemFields && items.some(item=>itemFields.some(field=>typeof item[field]!=='string'))){errors.push(`Trường của mục trong ${label} không hợp lệ.`);return;}
        if (publish && !items.length) errors.push(`${label} cần ít nhất một mục.`);
        if (block.type === 'stats') { need(block.source,`nguồn số liệu ${label}`); items.forEach(item => { need(item.value,`giá trị ${label}`); need(item.label,`nhãn số liệu ${label}`); }); }
        if (block.type === 'workflow') items.forEach(item => { need(item.name,`tên bước ${label}`); need(item.title,`tiêu đề giải thích ${label}`); need(item.copy,`giải thích ${label}`); });
        if (block.type === 'gallery') items.forEach(item => { need(item.src,`ảnh ${label}`); need(item.title,`mô tả ảnh ${label}`); url(item.src,`Ảnh ${label}`,true); });
        if (block.type === 'timeline') items.forEach(item => { need(item.label,`mốc ${label}`); need(item.title,`tên mốc ${label}`); });
        if (block.type === 'comparison') { need(block.beforeLabel,`nhãn trước ${label}`); need(block.afterLabel,`nhãn sau ${label}`); items.forEach(item => { need(item.name,`tên mục ${label}`); need(item.before,`nội dung trước ${label}`); need(item.after,`nội dung sau ${label}`); }); }
        if (block.type === 'checklist') items.forEach(item => need(item,`mục kiểm tra ${label}`));
    });
    if (doc.hero?.coverMode === 'workflow' && publish && !doc.blocks.some(block => block.type === 'workflow' && block.steps?.length)) errors.push('Bìa quy trình cần một khối quy trình có nội dung.');
    if (new TextEncoder().encode(JSON.stringify(doc)).length > 1000000) errors.push('Bài viết vượt giới hạn 1 MB cấu hình.');
    return errors;
}

export function encodeDocument(doc, options) {
    const errors = documentIssues(doc, options);
    if (errors.length) throw new Error(errors.join('\n'));
    return JSON.stringify(doc);
}

export function duplicateBlock(block) { return { ...structuredClone(block), id: blockId() }; }

export function documentText(doc) {
    return [doc.hero?.title, doc.hero?.lead, ...doc.blocks.flatMap(block => {
        if (block.type === 'text') return block.content;
        if (block.type === 'quote') return [block.text,block.attribution];
        return [block.title, ...(block.items || block.steps || block.images || block.events || []).flatMap(item => typeof item === 'string' ? item : Object.entries(item).filter(([key])=>!['id','src'].includes(key)).map(([,value])=>value))];
    }),doc.cta?.title,doc.cta?.body].filter(Boolean).join(' ');
}

export function postPayload(form, doc) {
    const title = String(form.title || '').trim(), slug = String(form.slug || '').trim();
    if (!title || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error('Điền tiêu đề và slug gồm chữ thường, số, dấu gạch nối.');
    if (!['Draft','Published'].includes(form.status)) throw new Error('Trạng thái bài viết không hợp lệ.');
    if (form.cover_image && !safeEditorialUrl(form.cover_image,{image:true})) throw new Error('URL ảnh bìa không hợp lệ.');
    return { title,slug,summary:form.summary || '', content:encodeDocument(doc,{publish:form.status === 'Published'}), image:form.cover_image !== undefined ? form.cover_image : form.image || '', category:form.category || 'Strategy', author:form.author || 'Mindtransform', status:form.status, date:form.date || null };
}
