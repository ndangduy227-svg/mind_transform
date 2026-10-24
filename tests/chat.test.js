import test from 'node:test';
import assert from 'node:assert/strict';
import { createChatHandler, isAllowedOrigin, validateChatRequest } from '../server/chat.js';
import { createChatRequest, createConsultationLead, normalizeAIResponse } from '../src/utils/consultation.js';
import { normalizeTemplate } from '../src/utils/template.js';

const turn = i => ({ user: `Câu hỏi ${i}`, ai: `Phản hồi ${i}` });
const request = body => ({ method: 'POST', headers: { origin: 'https://mind-transform.vercel.app' }, body });
function response() {
    return { code: 200, headers: {}, setHeader(key, value) { this.headers[key] = value; },
        status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } };
}
function fakeDb({ row = null, dbError = false } = {}) {
    const writes = [], selections = [];
    return { writes, selections, from(table) {
        let write = false;
        const chain = {
            select(fields) { selections.push({ table, fields }); return chain; },
            eq() { return chain; }, limit() { return chain; }, order() { return chain; },
            contains() { return chain; }, overlaps() { return chain; }, ilike() { return chain; },
            maybeSingle() { return chain; },
            insert(value) { write = true; writes.push(value); return chain; },
            update(value) { write = true; writes.push(value); return chain; },
            then(resolve, reject) {
                const data = table === 'rate_limits' ? (write ? null : row) : table === 'skills' ? null
                    : table === 'posts' ? [{ title: 'Báo cáo', slug: 'bao-cao', summary: 'Tóm tắt' }] : [];
                return Promise.resolve({ data, error: dbError ? { message: 'private_database_detail' } : null }).then(resolve, reject);
            },
        };
        return chain;
    } };
}
async function invoke(body, options = {}) {
    const db = fakeDb(options);
    let providerBody, calls = 0;
    const handler = createChatHandler({ getSupabase: () => db, env: { GROQ_API_KEY: 'test-only', ...options.env },
        fetchImpl: async (_url, config) => {
            calls++; providerBody = JSON.parse(config.body);
            if (options.throwProvider) throw new Error('secret_provider_error');
            return { ok: options.providerOk !== false, json: async () => ({ choices: [{ message: { content:
                options.modelText ?? JSON.stringify({ analysis: 'Nhận định', score: 55, next_question: 'Ai phụ trách?' }) } }] }) };
        } });
    const res = response();
    await handler({ ...request(body), ...options.req }, res);
    return { res, db, providerBody, calls };
}

test('only exact origins are allowed; a valid Referer cannot override a hostile Origin', () => {
    assert.equal(isAllowedOrigin(request({})), true);
    for (const origin of ['https://mind-transform.vercel.app.attacker.example', 'https://attacker-vercel.app', 'https://vercel.app.attacker.example']) {
        assert.equal(isAllowedOrigin({ headers: { origin, referer: 'https://mind-transform.vercel.app/' } }), false);
    }
    assert.equal(isAllowedOrigin({ headers: { referer: 'https://mind-transform.vercel.app/mind-ai' } }), true);
});
test('configured preview URL is allowed, unrelated previews are rejected', () => {
    const env = { VERCEL_URL: 'specific-preview.vercel.app' };
    assert.equal(isAllowedOrigin({ headers: { origin: 'https://specific-preview.vercel.app' } }, env), true);
    assert.equal(isAllowedOrigin({ headers: { origin: 'https://other.vercel.app' } }, env), false);
});
test('chat request includes earlier successful turns without duplicating the new message', () => {
    const history = [turn(1), turn(2)];
    const input = createChatRequest('  Câu hỏi mới  ', history, { industry: 'Bán lẻ' });
    assert.deepEqual(input.history, history);
    assert.equal(input.messageCount, 3);
    assert.equal(input.message, 'Câu hỏi mới');
    assert.equal(input.history.some(item => item.user === input.message), false);
});
test('malformed or oversized payloads are rejected before database/model work', async () => {
    for (const body of [null, { message: [] }, { message: ' ' }, { message: 'a'.repeat(4001) },
        { message: 'Test', history: [{}] }, { message: 'Test', intakeForm: { departments: 'HR' } },
        { message: 'Test', intakeForm: { industry: {} } }, { message: 'Test', history: [], messageCount: 5 }]) {
        const { res, calls, db } = await invoke(body);
        assert.equal(res.code, 400); assert.equal(calls, 0); assert.equal(db.writes.length, 0);
    }
});
test('fifth turn succeeds and sends the complete ordered conversation and intake to the model', async () => {
    const history = [1, 2, 3, 4].map(turn);
    const { res, providerBody, db } = await invoke({ message: 'Báo cáo cuối ngày', history, messageCount: 5,
        intakeForm: { industry: 'Bán lẻ', companySize: '11-50 người', departments: ['Sales'] } });
    assert.equal(res.code, 200);
    assert.deepEqual(providerBody.messages.slice(1), [...history.flatMap(item => [
        { role: 'user', content: item.user }, { role: 'assistant', content: item.ai }]), { role: 'user', content: 'Báo cáo cuối ngày' }]);
    assert.match(providerBody.messages[0].content, /11-50 người/);
    assert.equal(db.selections.some(item => item.fields.includes('excerpt')), false);
    assert.equal(res.body.suggested_links[0].url, '/blog/bao-cao');
});
test('sixth turn is blocked without touching database or provider', async () => {
    const { res, calls, db } = await invoke({ message: 'Thêm', history: [1, 2, 3, 4, 5].map(turn), messageCount: 6 });
    assert.equal(res.code, 429); assert.equal(calls, 0); assert.equal(db.writes.length, 0);
});
test('daily quota is enforced and rolls over on the next UTC day', async () => {
    const today = new Date().toISOString();
    const limited = await invoke({ message: 'Test' }, { row: { daily_count: 30, last_reset: today } });
    assert.equal(limited.res.code, 429); assert.equal(limited.calls, 0);
    const reset = await invoke({ message: 'Test' }, { row: { daily_count: 30, last_reset: '2000-01-01T00:00:00Z' } });
    assert.equal(reset.res.code, 200); assert.equal(reset.db.writes[0].daily_count, 1);
});
test('missing server configuration returns a controlled error', async () => {
    const { res, calls } = await invoke({ message: 'Test' }, { env: { GROQ_API_KEY: '' } });
    assert.equal(res.code, 503); assert.equal(calls, 0);
});
test('database and model failures do not leak provider/database details', async () => {
    for (const options of [{ dbError: true }, { throwProvider: true }, { providerOk: false }]) {
        const { res } = await invoke({ message: 'Test' }, options);
        assert.equal(res.code, 503); assert.doesNotMatch(JSON.stringify(res.body), /private_|secret_/);
    }
});
test('text-only model response remains visible and invalid JSON structure fails gracefully', async () => {
    const text = await invoke({ message: 'Test' }, { modelText: 'Nhận định chưa có câu hỏi tiếp theo.' });
    assert.equal(text.res.code, 200); assert.match(text.res.body.analysis, /Nhận định/);
    const empty = await invoke({ message: 'Test' }, { modelText: '{}' });
    assert.equal(empty.res.code, 503);
});
test('response score and suggested URLs are normalized before rendering', () => {
    const result = normalizeAIResponse({ score: 999, analysis: {}, suggested_links: [
        { title: 'Bad', url: 'javascript:alert(1)' }, { title: 'Bad', url: '//attacker.example' },
        { title: 'Good', url: '/templates/daily-sales' }] });
    assert.equal(result.score, 100); assert.equal(result.analysis, ''); assert.equal(result.suggested_links.length, 1);
});
test('consultation lead keeps the first and final turn plus intake in the existing leads schema', () => {
    const history = [turn(1), turn(2)];
    const lead = createConsultationLead({ name: ' Duy ', email: ' test@example.com ', phone: ' 0900000000 ',
        intakeForm: { industry: 'F&B' }, history });
    assert.equal(lead.name, 'Duy'); assert.equal(lead.email, 'test@example.com');
    assert.deepEqual(JSON.parse(lead.need).conversation, history);
    assert.equal(JSON.parse(lead.need).intake.industry, 'F&B');
    assert.throws(() => createConsultationLead({ name: 'Duy', email: 'bad', history }), /email/);
    assert.throws(() => createConsultationLead({ name: 'Duy', email: 'test@example.com', history: [] }), /ít nhất/);
});
test('template fields support both the documented schema and newer CMS records', () => {
    assert.equal(normalizeTemplate({ image: '/a.png', lark_link: 'https://lark.example' }).template_link, 'https://lark.example');
    const row = normalizeTemplate({ image: '/old.png', thumbnail: '/new.png', lark_link: 'old', template_link: 'new' });
    assert.equal(row.thumbnail, '/new.png'); assert.equal(row.template_link, 'new');
});
test('unsupported method and forbidden origins are rejected without a model request', async () => {
    const get = await invoke({}, { req: { method: 'GET' } });
    assert.equal(get.res.code, 405); assert.equal(get.res.headers.Allow, 'POST');
    const forbidden = await invoke({}, { req: { headers: { origin: 'https://attacker.example' } } });
    assert.equal(forbidden.res.code, 403); assert.equal(forbidden.calls, 0);
    assert.equal(validateChatRequest({ message: ' Test ' }).message, 'Test');
});
