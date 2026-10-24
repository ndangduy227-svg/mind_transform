import { decodeDocument, documentText } from './editorialDocument.js';

export function headingSlug(value) {
    return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd').toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, '')
        .trim().replace(/[\s-]+/g, '-') || 'phan';
}

export function uniqueHeadingId(text, used, preferred) {
    const base = preferred?.trim() || headingSlug(text);
    let id = base, number = 2;
    while (used.has(id)) id = `${base}-${number++}`;
    used.add(id);
    return id;
}

export function plainText(value = '') {
    return String(value).replace(/<[^>]*>/g, ' ').replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/[*_`~#>]/g, '').replace(/\s+/g, ' ').trim();
}

export function markdownHeadings(content = '', used = new Set()) {
    const headings = [];
    let fence = null;
    String(content).split('\n').forEach((line, index) => {
        const marker = line.match(/^ {0,3}(`{3,}|~{3,})/);
        if (marker) {
            if (!fence) fence = marker[1];
            else if (marker[1][0] === fence[0] && marker[1].length >= fence.length) fence = null;
            return;
        }
        if (fence) return;
        const match = line.match(/^ {0,3}(#{1,3})\s+(.+?)(?:\s+#+)?\s*$/);
        if (!match) return;
        const text = plainText(match[2]);
        headings.push({ text, id: uniqueHeadingId(text, used), level: Math.max(2, match[1].length), line: index + 1 });
    });
    return headings;
}

// Markdown blocks are opt-in per editorial profile; unknown comments stay ordinary content.
export function editorialParts(content = '', allowed = []) {
    const source = String(content);
    const matcher = /^<!-- mind:([a-z-]+) -->\s*$/gm;
    const parts = [];
    let cursor = 0, match;
    while ((match = matcher.exec(source))) {
        if (!allowed.includes(match[1])) continue;
        parts.push({ content: source.slice(cursor, match.index), lineOffset: source.slice(0, cursor).split('\n').length - 1 });
        parts.push({ block: match[1] });
        cursor = matcher.lastIndex;
    }
    parts.push({ content: source.slice(cursor), lineOffset: source.slice(0, cursor).split('\n').length - 1 });
    return parts;
}

export function readingMinutes(content) {
    const decoded = decodeDocument(content);
    const text = decoded.kind === 'structured' ? documentText(decoded.document) : content;
    return Math.max(1, Math.ceil(plainText(text).split(/\s+/).filter(Boolean).length / 230));
}

export function formatPostDate(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('vi-VN', { timeZone: 'UTC' });
}

export function absoluteArticleImage(value, base) {
    if (!value) return null;
    try {
        const url = new URL(value, base);
        return ['http:', 'https:'].includes(url.protocol) ? url.href : null;
    } catch { return null; }
}

export function searchText(value) {
    return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd')
        .toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}

export function processArticleContent(content = '') {
    if (decodeDocument(content).kind !== 'legacy') return typeof content === 'string' ? content : JSON.stringify(content);
    return String(content).replace(/\[Image:\s*([^;\]]+)(?:;\s*([^\]]+))?\]/g,
        (_match, url, caption) => `![${caption || ''}](${url.trim()})`);
}
