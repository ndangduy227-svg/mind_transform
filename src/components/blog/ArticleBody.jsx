import React from 'react';
import Markdown, { defaultUrlTransform } from 'react-markdown';
import { isHTMLContent } from '../../utils/contentRenderer';
import { markdownHeadings, uniqueHeadingId, editorialParts } from '../../utils/article';
import { getGoogleDriveImageUrl } from '../../utils/imageHelper';
import ArticleImage from './ArticleImage';
import { EditorialBlock } from './ArticleBlocks';

const allowedTags = new Set(['p','div','span','section','h1','h2','h3','h4','h5','h6','ul','ol','li','strong','b','em','i','u','s','del','blockquote','pre','code','table','thead','tbody','tfoot','tr','td','th','caption','a','img','figure','figcaption','hr','br','sup','sub','mark','details','summary']);

export function articleModel(content, profile) {
    if (!isHTMLContent(content)) return { headings: markdownHeadings(content), parts: editorialParts(content, profile ? ['workflow', 'statement', 'facts', 'gallery'] : []) };
    const template = document.createElement('template');
    template.innerHTML = content;
    // Parse legacy CMS HTML inertly, then render only safe React elements and attributes.
    template.content.querySelectorAll('iframe').forEach(node => {
        const href = defaultUrlTransform(node.getAttribute('src') || '');
        if (href) {
            const link = document.createElement('a');
            link.href = href; link.textContent = 'Mở nội dung nhúng'; node.replaceWith(link);
        } else node.remove();
    });
    template.content.querySelectorAll('script,style,object,embed,link,meta,base,svg,math,form,template').forEach(node => node.remove());
    const used = new Set(['article-next-title']);
    template.content.querySelectorAll('[id],h1,h2,h3').forEach(node => node.setAttribute('id', uniqueHeadingId(node.textContent.trim(), used, node.getAttribute('id'))));
    const headings = [...template.content.querySelectorAll('h1,h2,h3')].map(node => ({ text: node.textContent.trim(), id: node.getAttribute('id'), level: Math.max(2, Number(node.tagName.slice(1))) }));
    return { headings, html: template.content };
}

function ArticleLink({ href, children, id }) {
    const safeHref = defaultUrlTransform(href || '');
    const external = /^https?:\/\//i.test(safeHref);
    return <a id={id} href={safeHref || undefined} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}>{children}</a>;
}

function inlineImage(src, alt) {
    const safe = defaultUrlTransform(src || '');
    return safe ? <img src={getGoogleDriveImageUrl(safe)} alt={alt || ''} loading="lazy" decoding="async" /> : null;
}

function renderHtmlNode(node, key) {
    if (node.nodeType === 3) return node.textContent;
    if (node.nodeType !== 1) return null;
    const tag = node.tagName.toLowerCase();
    if (!allowedTags.has(tag)) return null;
    const children = [...node.childNodes].map((child, index) => renderHtmlNode(child, `${key}-${index}`));
    const onlyImage = tag === 'p' && node.children.length === 1 && node.firstElementChild.tagName === 'IMG' && !node.textContent.trim();
    if (onlyImage || tag === 'figure') {
        const image = node.querySelector('img');
        if (image) return <ArticleImage key={key} src={image.getAttribute('src')} caption={node.querySelector('figcaption')?.textContent || image.getAttribute('alt')} />;
    }
    if (tag === 'img') return <React.Fragment key={key}>{inlineImage(node.getAttribute('src'), node.getAttribute('alt'))}</React.Fragment>;
    if (tag === 'a') return <ArticleLink key={key} id={node.getAttribute('id') || undefined} href={node.getAttribute('href')}>{children}</ArticleLink>;
    const props = { key };
    if (node.hasAttribute('id')) props.id = node.getAttribute('id');
    if (/^h[1-6]$/.test(tag)) { props.id = node.getAttribute('id') || undefined; props.tabIndex = -1; }
    if (['td','th'].includes(tag)) for (const attr of ['colSpan','rowSpan']) { const value = Number(node.getAttribute(attr)); if (value > 0 && value < 100) props[attr] = value; }
    if (tag === 'ol' && node.hasAttribute('start')) props.start = Number(node.getAttribute('start')) || 1;
    return React.createElement(tag === 'h1' ? 'h2' : tag, props, ['br','hr'].includes(tag) ? undefined : children);
}

export default function ArticleBody({ model, profile }) {
    if (model.html) return <div className="article-body">{[...model.html.childNodes].map((node,index) => renderHtmlNode(node, `html-${index}`))}</div>;
    return <div className="article-body">{model.parts.map((part, index) => {
        if (part.block) return <EditorialBlock key={`block-${index}`} name={part.block} profile={profile} />;
        const heading = Tag => ({ node, children }) => {
            const item = model.headings.find(value => value.line === node.position?.start.line + part.lineOffset);
            return <Tag id={item?.id} tabIndex={-1}>{children}</Tag>;
        };
        return <Markdown key={index} components={{
            h1: heading('h2'), h2: heading('h2'), h3: heading('h3'),
            a: ({ href, children }) => <ArticleLink href={href}>{children}</ArticleLink>,
            img: ({ src, alt }) => inlineImage(src, alt),
            p: ({ node, children }) => {
                const nodes = node.children.filter(child => child.type !== 'text' || child.value.trim());
                const image = nodes.length === 1 && nodes[0].type === 'element' && nodes[0].tagName === 'img' ? nodes[0] : null;
                return image ? <ArticleImage src={image.properties.src} caption={image.properties.alt} disclosure={profile?.imageDisclosure} evidence={!!profile} /> : <p>{children}</p>;
            },
        }}>{part.content}</Markdown>;
    })}</div>;
}
