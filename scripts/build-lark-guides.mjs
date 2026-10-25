import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { documentIssues } from '../src/utils/editorialDocument.js';

// Markdown + catalog are the authoring sources. Generated records use the CMS document schema.
const contentRoot = new URL('../src/content/lark-guides/', import.meta.url);
const catalog = JSON.parse(await readFile(new URL('catalog.json', contentRoot), 'utf8'));
const slugs = new Set(catalog.map(entry => entry.slug));
if (slugs.size !== catalog.length) throw new Error('Duplicate article slugs.');
const records = [];
for (const entry of catalog) {
    const content = (await readFile(new URL(`${entry.slug}.md`, contentRoot), 'utf8')).trim();
    const words = content.split(/\s+/).length;
    if (words > (records.length === 0 ? 600 : 450)) throw new Error(`${entry.slug}: article exceeds the short-form budget.`);
    if (!/^## /m.test(content) || !/\]\(https:\/\/(?:www\.)?(?:larksuite|bytedance)\.com\//.test(content)) {
        throw new Error(`${entry.slug}: missing headings or official sources.`);
    }
    for (const [, slug] of content.matchAll(/\]\(\/blog\/([a-z0-9-]+)\)/g)) {
        if (!slugs.has(slug)) throw new Error(`${entry.slug}: unknown related article ${slug}`);
    }
    const document = {
        schema: 'mindtransform.article', version: 1, format: 'standard',
        appearance: { theme: 'paper', width: 'comfortable', showContents: true },
        hero: { title: '', label: 'Hiểu & dùng Lark', lead: entry.summary, coverMode: 'none', caption: '', disclosure: '' },
        blocks: [{ id: `${entry.slug}-body`, type: 'text', syntax: 'markdown', content }],
        cta: { enabled: true, title: entry.ctaTitle, body: entry.ctaBody, label: 'Nhận MIND Map miễn phí', action: 'consult', url: '' },
    };
    const issues = documentIssues(document, { publish: true });
    if (issues.length) throw new Error(`${entry.slug}: ${issues.join('; ')}`);
    records.push({
        id: `static-${entry.slug}`, title: entry.title, slug: entry.slug, summary: entry.summary,
        content: JSON.stringify(document), image: '', category: entry.category,
        author: 'Mindtransform', status: 'Published', date: '2026-10-25',
    });
    console.log(`${entry.slug}: ${words} words`);
}
const output = new URL('../src/content/lark-guides.posts.json', import.meta.url);
await writeFile(output, JSON.stringify(records, null, 2) + '\n', 'utf8');
console.log(`Validated ${records.length} CMS documents and internal links. Saved ${fileURLToPath(output)}.`);
