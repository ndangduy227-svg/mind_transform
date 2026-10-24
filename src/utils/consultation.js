export const MAX_CHAT_MESSAGES = 5;

export function normalizeAIResponse(value = {}, fallbackLinks = []) {
    const raw = value && typeof value === 'object' ? value : {};
    const links = Array.isArray(raw.suggested_links) && raw.suggested_links.length
        ? raw.suggested_links : fallbackLinks;
    return {
        analysis: typeof raw.analysis === 'string' ? raw.analysis.slice(0, 4000) : '',
        score: Math.min(100, Math.max(0, Number(raw.score) || 0)),
        next_question: typeof raw.next_question === 'string' ? raw.next_question.slice(0, 2000) : '',
        suggested_links: links.filter(link => link && typeof link.title === 'string'
            && typeof link.url === 'string'
            && /^\/(?:blog|templates)\/[\p{L}\p{N}_-]+$/u.test(link.url))
            .slice(0, 6).map(link => ({ title: link.title.slice(0, 200), url: link.url, type: link.type })),
    };
}

export function createChatRequest(message, history, intakeForm) {
    return { message: message.trim(), history: history.map(({ user, ai }) => ({ user, ai })),
        intakeForm, messageCount: history.length + 1 };
}

export function createConsultationLead({ name, email, phone = '', intakeForm, history }) {
    if (!name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        throw new Error('Vui lòng nhập họ tên và email hợp lệ.');
    }
    if (!history.length) throw new Error('Vui lòng hoàn thành ít nhất một lượt tư vấn.');
    return { name: name.trim(), email: email.trim(), phone: phone.trim(),
        need: JSON.stringify({ source: 'mind-ai', intake: intakeForm, conversation: history }) };
}
