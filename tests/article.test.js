import test from 'node:test';
import assert from 'node:assert/strict';
import { absoluteArticleImage, markdownHeadings, editorialParts, readingMinutes, formatPostDate } from '../src/utils/article.js';

test('Vietnamese anchors are unique, rich headings are readable, and fenced examples are excluded', () => {
    const headings = markdownHeadings('## Điểm **bàn giao**\n\n```md\n## Not a section\n```\n## Điểm bàn giao\n### [Kho vật tư](/kho)\n~~~\n# Hidden\n~~~');
    assert.deepEqual(headings.map(item => item.id), ['diem-ban-giao','diem-ban-giao-2','kho-vat-tu']);
    assert.equal(headings[1].line, 6);
});

test('editorial block boundaries preserve source lines and require explicit opt-in', () => {
    const source = '## Đầu\n\nNội dung\n\n<!-- mind:facts -->\n\n## Cuối\n';
    const parts = editorialParts(source, ['facts']);
    assert.equal(parts[1].block, 'facts');
    const final = parts[2];
    const local = markdownHeadings(final.content)[0];
    assert.equal(local.line + final.lineOffset, markdownHeadings(source)[1].line);
    assert.equal(editorialParts(source, []).length, 1);
});

test('missing article metadata has useful fallbacks', () => {
    assert.equal(readingMinutes(null), 1);
    assert.equal(formatPostDate('invalid'), '');
    assert.equal(formatPostDate('2026-06-11'), '11/6/2026');
    assert.equal(absoluteArticleImage('http://', 'https://example.com'), null);
    assert.equal(absoluteArticleImage('javascript:alert(1)', 'https://example.com'), null);
    assert.equal(absoluteArticleImage('/cover.webp', 'https://example.com/blog/a'), 'https://example.com/cover.webp');
});
