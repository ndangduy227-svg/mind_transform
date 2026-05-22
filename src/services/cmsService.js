/**
 * CMS Service Layer
 * Centralized data fetching for Blog Posts and Lark Templates
 * Backend: Google Sheet via Google Apps Script
 */

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzTOHDWp8w7M5RtSXxA_lqkQTA_1pqGw_xyO_bPkj0I32P7ck5U5GGe4fBE77ZAM9xEhg/exec";

// In-memory cache to avoid redundant fetches within the same session
const cache = {
    posts: null,
    templates: null,
    postsTimestamp: 0,
    templatesTimestamp: 0,
};

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function isCacheValid(type) {
    const now = Date.now();
    return cache[type] !== null && (now - cache[`${type}Timestamp`]) < CACHE_TTL;
}

/**
 * Fetch data from Google Apps Script
 * @param {'posts'|'templates'} type - Data type to fetch
 */
async function fetchFromCMS(type = 'posts') {
    // Return cached data if valid
    if (isCacheValid(type)) {
        return cache[type];
    }

    const url = `${SCRIPT_URL}?type=${type}`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`CMS fetch failed: ${response.status}`);
    }

    const data = await response.json();
    const items = Array.isArray(data) ? data : [];

    // Update cache
    cache[type] = items;
    cache[`${type}Timestamp`] = Date.now();

    return items;
}

/**
 * Blog Posts API
 */
export const posts = {
    /**
     * Get all published blog posts, sorted by date (newest first)
     */
    getAll: async () => {
        const data = await fetchFromCMS('posts');
        return data.sort((a, b) => new Date(b.date) - new Date(a.date));
    },

    /**
     * Get a single blog post by slug
     */
    getBySlug: async (slug) => {
        const data = await fetchFromCMS('posts');
        return data.find(p => p.slug === slug) || null;
    },
};

/**
 * Lark Templates API
 */
export const templates = {
    /**
     * Get all published templates
     * @param {Object} filters - Optional filters
     * @param {string} filters.category - Filter by category
     * @param {string} filters.industry - Filter by industry
     * @param {string} filters.difficulty - Filter by difficulty
     * @param {string} filters.search - Search by name/summary
     */
    getAll: async (filters = {}) => {
        let data = await fetchFromCMS('templates');

        // Apply filters
        if (filters.category) {
            data = data.filter(t => t.category === filters.category);
        }
        if (filters.industry) {
            data = data.filter(t => {
                const industries = (t.industry || '').split(',').map(i => i.trim());
                return industries.includes(filters.industry);
            });
        }
        if (filters.difficulty) {
            data = data.filter(t => t.difficulty === filters.difficulty);
        }
        if (filters.search) {
            const term = filters.search.toLowerCase();
            data = data.filter(t =>
                (t.name || '').toLowerCase().includes(term) ||
                (t.summary || '').toLowerCase().includes(term) ||
                (t.use_case || '').toLowerCase().includes(term)
            );
        }

        return data.sort((a, b) => new Date(b.date) - new Date(a.date));
    },

    /**
     * Get a single template by slug
     */
    getBySlug: async (slug) => {
        const data = await fetchFromCMS('templates');
        return data.find(t => t.slug === slug) || null;
    },

    /**
     * Get all unique categories from templates
     */
    getCategories: async () => {
        const data = await fetchFromCMS('templates');
        const categories = [...new Set(data.map(t => t.category).filter(Boolean))];
        return categories.sort();
    },

    /**
     * Get all unique industries from templates
     */
    getIndustries: async () => {
        const data = await fetchFromCMS('templates');
        const industries = new Set();
        data.forEach(t => {
            if (t.industry) {
                t.industry.split(',').map(i => i.trim()).forEach(i => industries.add(i));
            }
        });
        return [...industries].sort();
    },

    /**
     * Get related templates (same category, exclude current)
     */
    getRelated: async (slug, limit = 3) => {
        const data = await fetchFromCMS('templates');
        const current = data.find(t => t.slug === slug);
        if (!current) return [];

        return data
            .filter(t => t.slug !== slug && t.category === current.category)
            .slice(0, limit);
    },
};

/**
 * Invalidate cache (useful after content updates)
 */
export function invalidateCache(type) {
    if (type) {
        cache[type] = null;
        cache[`${type}Timestamp`] = 0;
    } else {
        cache.posts = null;
        cache.templates = null;
        cache.postsTimestamp = 0;
        cache.templatesTimestamp = 0;
    }
}

export const cms = { posts, templates, invalidateCache };
export default cms;
