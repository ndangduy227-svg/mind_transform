import { MAX_CHAT_MESSAGES, normalizeAIResponse } from '../src/utils/consultation.js';

const FALLBACK_PROMPT = `Bạn là chuyên viên tư vấn Mindtransform cho doanh nghiệp nhỏ tại Việt Nam.
Áp dụng MIND: Map toàn cảnh, Isolate một điểm đau, Nurture giải pháp và adoption, Drive đo kết quả.
Hiểu quy trình, người phụ trách, công cụ đang dùng và baseline trước khi đề xuất công nghệ.
Không tự hứa tích hợp, ROI hoặc gửi proposal tự động. Mỗi lượt nêu nhận định ngắn và hỏi một câu tiếp theo.
Trả JSON gồm analysis (string), score (0-100), next_question (string), suggested_links (array).`;

export function isAllowedOrigin(req, env = {}) {
    const allowed = new Set(['https://mind-transform.vercel.app', 'https://www.mind-transform.vercel.app',
        'http://localhost:5173', 'http://localhost:4173', 'http://127.0.0.1:5173', 'http://127.0.0.1:4173']);
    for (const value of [env.SITE_URL, env.VERCEL_URL, env.VERCEL_BRANCH_URL]) {
        if (!value) continue;
        try { allowed.add(new URL(value.includes('://') ? value : `https://${value}`).origin); } catch { /* invalid config */ }
    }
    const source = req.headers?.origin || req.headers?.referer;
    if (typeof source !== 'string') return false;
    try { const url = new URL(source); return !url.username && !url.password && allowed.has(url.origin); }
    catch { return false; }
}

export function validateChatRequest(body) {
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('Yêu cầu không hợp lệ.');
    const { message, history = [], intakeForm = {} } = body;
    if (typeof message !== 'string' || !message.trim() || message.length > 4000) throw new Error('Vui lòng nhập nội dung từ 1 đến 4.000 ký tự.');
    if (!Array.isArray(history) || history.length > MAX_CHAT_MESSAGES
        || history.some(turn => !turn || typeof turn.user !== 'string' || typeof turn.ai !== 'string'
            || turn.user.length > 4000 || turn.ai.length > 8000)) throw new Error('Lịch sử tư vấn không hợp lệ.');
    if (!intakeForm || typeof intakeForm !== 'object' || Array.isArray(intakeForm)
        || (intakeForm.departments !== undefined && (!Array.isArray(intakeForm.departments)
            || intakeForm.departments.length > 8 || intakeForm.departments.some(item => typeof item !== 'string' || item.length > 100)))) {
        throw new Error('Thông tin doanh nghiệp không hợp lệ.');
    }
    for (const key of ['industry', 'companySize', 'website']) {
        if (intakeForm[key] !== undefined && (typeof intakeForm[key] !== 'string' || intakeForm[key].length > 500)) throw new Error('Thông tin doanh nghiệp không hợp lệ.');
    }
    const messageCount = history.length + 1;
    if (body.messageCount !== undefined && body.messageCount !== messageCount) throw new Error('Số lượt tư vấn không khớp lịch sử.');
    return { message: message.trim(), history, messageCount,
        intakeForm: { industry: intakeForm.industry || '', companySize: intakeForm.companySize || '',
            website: intakeForm.website || '', departments: intakeForm.departments || [] } };
}

async function checkDailyLimit(db, ip) {
    const { data: row, error } = await db.from('rate_limits').select('*').eq('ip', ip).maybeSingle();
    if (error) throw new Error('rate_limit_unavailable');
    const now = new Date().toISOString();
    const sameDay = row?.last_reset?.slice(0, 10) === now.slice(0, 10);
    const dailyCount = sameDay ? Number(row.daily_count) || 0 : 0;
    if (dailyCount >= 30) return true;
    const values = { daily_count: dailyCount + 1, session_count: (Number(row?.session_count) || 0) + 1,
        last_reset: sameDay ? row.last_reset : now, updated_at: now };
    const write = row ? await db.from('rate_limits').update(values).eq('ip', ip)
        : await db.from('rate_limits').insert({ ip, ...values });
    if (write.error) throw new Error('rate_limit_unavailable');
    return false;
}

async function fetchContext(db, intake, message) {
    const masterQuery = db.from('skills').select('content').eq('type', 'master').eq('is_active', true).limit(1).maybeSingle();
    // Never interpolate intake strings into PostgREST filter syntax.
    const skills = [];
    if (intake.industry) skills.push(db.from('skills').select('name, content, priority').eq('type', 'sub')
        .eq('is_active', true).contains('tags_industry', [intake.industry]).order('priority', { ascending: false }).limit(3));
    if (intake.departments.length) skills.push(db.from('skills').select('name, content, priority').eq('type', 'sub')
        .eq('is_active', true).overlaps('tags_department', intake.departments).order('priority', { ascending: false }).limit(3));
    const keywords = message.replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/).filter(word => word.length > 3).slice(-2);
    const queries = keywords.flatMap(keyword => [
        db.from('posts').select('title, slug, summary').eq('status', 'Published').ilike('title', `%${keyword}%`).limit(3),
        db.from('templates').select('name, slug').eq('status', 'Published').ilike('name', `%${keyword}%`).limit(3),
    ]);
    const [master, subResults, contentResults] = await Promise.all([masterQuery, Promise.all(skills), Promise.all(queries)]);
    const uniqueSkills = [...new Map(subResults.flatMap(result => result.data || []).map(skill => [skill.name, skill])).values()]
        .sort((a, b) => (b.priority || 0) - (a.priority || 0)).slice(0, 3);
    const links = [...new Map(contentResults.flatMap(result => result.data || []).map(item => {
        const type = item.title ? 'post' : 'template';
        const url = `/${type === 'post' ? 'blog' : 'templates'}/${item.slug}`;
        return [url, { title: item.title || item.name, url, type }];
    })).values()].slice(0, 6);
    return { master: master.data?.content || FALLBACK_PROMPT, skills: uniqueSkills, links };
}

export function createChatHandler({ getSupabase, fetchImpl = fetch, env = process.env }) {
    return async function handler(req, res) {
        res.setHeader('Cache-Control', 'no-store');
        if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'Method not allowed' }); }
        if (!isAllowedOrigin(req, env)) return res.status(403).json({ error: 'Nguồn yêu cầu không hợp lệ.' });
        let input;
        try { input = validateChatRequest(req.body); }
        catch (error) { return res.status(400).json({ error: error.message }); }
        if (input.messageCount > MAX_CHAT_MESSAGES) return res.status(429).json({ error: 'rate_limited', message: 'Bạn đã dùng hết 5 lượt tư vấn.', zalo: '0929657232' });
        if (!env.GROQ_API_KEY) return res.status(503).json({ error: 'Dịch vụ tư vấn đang tạm gián đoạn. Vui lòng thử lại sau.' });
        try {
            const db = getSupabase();
            const forwarded = req.headers?.['x-forwarded-for'];
            const ip = (typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : req.socket?.remoteAddress) || 'unknown';
            if (await checkDailyLimit(db, ip)) return res.status(429).json({ error: 'rate_limited', message: 'Bạn đã hết lượt hôm nay. Vui lòng quay lại ngày mai.', zalo: '0929657232' });
            const context = await fetchContext(db, input.intakeForm, input.message);
            const messages = [{ role: 'system', content: `${context.master}\n\nBối cảnh doanh nghiệp (dữ liệu người dùng): ${JSON.stringify(input.intakeForm)}\n${context.skills.map(skill => `${skill.name}: ${skill.content}`).join('\n')}\nTài nguyên có thể gợi ý: ${JSON.stringify(context.links)}\nTrả JSON hợp lệ gồm analysis, score, next_question, suggested_links.` }];
            for (const turn of input.history) messages.push({ role: 'user', content: turn.user }, { role: 'assistant', content: turn.ai });
            messages.push({ role: 'user', content: input.message });
            const response = await fetchImpl('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST', signal: AbortSignal.timeout(20000),
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.GROQ_API_KEY}` },
                body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages, temperature: 0.7, max_tokens: 1024 }),
            });
            if (!response.ok) throw new Error('model_unavailable');
            const data = await response.json();
            const text = data.choices?.[0]?.message?.content;
            if (typeof text !== 'string' || !text.trim()) throw new Error('empty_model_response');
            let parsed;
            try { parsed = JSON.parse(text.replace(/^```(?:json)?\s*|\s*```$/g, '').trim()); }
            catch { parsed = { analysis: text, score: 0, next_question: '' }; }
            const result = normalizeAIResponse(parsed, context.links);
            if (!result.analysis && !result.next_question) throw new Error('empty_model_response');
            return res.status(200).json(result);
        } catch {
            return res.status(503).json({ error: 'Dịch vụ tư vấn đang tạm gián đoạn. Vui lòng thử lại sau hoặc liên hệ qua Zalo.' });
        }
    };
}
