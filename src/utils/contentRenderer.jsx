import React from 'react';
import Markdown from 'react-markdown';

/**
 * Detect if content string is HTML (from TinyMCE) or Markdown
 */
export function isHTMLContent(content) {
    if (!content) return false;
    // Check for common HTML block-level tags
    return /<(p|div|h[1-6]|ul|ol|table|br|img|figure|blockquote|pre|hr)\b[^>]*>/i.test(content);
}

/**
 * Render content as HTML or Markdown depending on format.
 * Pass markdownComponents for custom react-markdown component overrides.
 */
export function ContentRenderer({ content, className, markdownComponents }) {
    if (!content) return null;

    if (isHTMLContent(content)) {
        return (
            <div
                className={className}
                dangerouslySetInnerHTML={{ __html: content }}
            />
        );
    }

    return (
        <div className={className}>
            <Markdown components={markdownComponents}>
                {content}
            </Markdown>
        </div>
    );
}

/**
 * Extract headings from content (supports both HTML and Markdown).
 * Returns array of { level, text, id, number }
 */
export function extractHeadings(content) {
    if (!content) return [];

    let headings = [];

    if (isHTMLContent(content)) {
        // Parse HTML headings
        const regex = /<h([1-3])[^>]*>(.*?)<\/h[1-3]>/gi;
        let match;
        while ((match = regex.exec(content)) !== null) {
            const level = parseInt(match[1]);
            const text = match[2].replace(/<[^>]+>/g, '').trim(); // strip inner HTML tags
            const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
            headings.push({ level, text, id });
        }
    } else {
        // Parse Markdown headings
        const lines = content.split('\n');
        headings = lines
            .filter(line => line.startsWith('#'))
            .map(line => {
                const level = line.match(/^#+/)[0].length;
                const text = line.replace(/^#+\s+/, '');
                const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
                return { level, text, id };
            });
    }

    // Add numbering
    let h1Count = 0, h2Count = 0, h3Count = 0;
    return headings.map(h => {
        let number = '';
        if (h.level === 1) {
            h1Count++;
            h2Count = 0;
            h3Count = 0;
            number = `${h1Count}.`;
        } else if (h.level === 2) {
            h2Count++;
            h3Count = 0;
            number = `${h1Count}.${h2Count}`;
        } else if (h.level === 3) {
            h3Count++;
            number = `${h1Count}.${h2Count}.${h3Count}`;
        }
        return { ...h, number };
    });
}

/**
 * Add id attributes to HTML headings for anchor linking (TOC scroll).
 */
export function addHeadingIds(htmlContent) {
    if (!htmlContent) return '';
    return htmlContent.replace(/<h([1-3])([^>]*)>(.*?)<\/h[1-3]>/gi, (match, level, attrs, inner) => {
        const text = inner.replace(/<[^>]+>/g, '').trim();
        const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
        // Don't add id if already present
        if (/id\s*=/.test(attrs)) return match;
        return `<h${level}${attrs} id="${id}">${inner}</h${level}>`;
    });
}
