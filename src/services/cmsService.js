import { supabase } from '../lib/supabase';
import { STATIC_POSTS } from '../data/staticPosts';
import { normalizeTemplate } from '../utils/template';
import { normalizePost } from '../utils/post';

const cache = {
    posts: null,
    templates: null,
    postsTimestamp: 0,
    templatesTimestamp: 0,
};

const CACHE_TTL = 5 * 60 * 1000;
const POSTS_TIMEOUT = 4000;
let postsRequest = null;
let postsGeneration = 0;

function mergePosts(remotePosts = []) {
    const postsBySlug = new Map();

    [...STATIC_POSTS, ...remotePosts].forEach(post => {
        if (!postsBySlug.has(post.slug)) postsBySlug.set(post.slug, post);
    });

    return [...postsBySlug.values()].map(normalizePost).sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
}

function isCacheValid(type) {
    return cache[type] !== null && (Date.now() - cache[`${type}Timestamp`]) < CACHE_TTL;
}

const bundledPosts = mergePosts();

async function refreshPosts(generation) {
    let result = cache.posts ?? bundledPosts;
    try {
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .eq('status', 'Published')
            .order('date', { ascending: false })
            .retry(false)
            .abortSignal(AbortSignal.timeout(POSTS_TIMEOUT));
        if (!error) result = mergePosts(data ?? []);
    } catch {
        // Keep readable content when the CMS is offline or the request times out.
    }

    // An admin edit may invalidate the cache while this request is pending.
    if (generation === postsGeneration) {
        cache.posts = result;
        cache.postsTimestamp = Date.now();
    }
    return cache.posts ?? bundledPosts;
}

export const posts = {
    getCached: () => cache.posts ?? bundledPosts,

    getAll: () => {
        if (isCacheValid('posts')) return Promise.resolve(cache.posts);
        if (postsRequest) return postsRequest;

        const request = refreshPosts(postsGeneration).finally(() => {
            if (postsRequest === request) postsRequest = null;
        });
        postsRequest = request;
        return request;
    },

    getBySlug: async (slug) => {
        const staticPost = STATIC_POSTS.find(post => post.slug === slug);
        if (staticPost) return normalizePost(staticPost);

        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .eq('slug', slug)
            .eq('status', 'Published')
            .single();

        if (error) return null;
        return data ? normalizePost(data) : null;
    },
};

export const templates = {
    getAll: async (filters = {}) => {
        if (isCacheValid('templates') && Object.keys(filters).length === 0) {
            return cache.templates;
        }

        let query = supabase
            .from('templates')
            .select('*')
            .eq('status', 'Published')
            .order('date', { ascending: false });

        if (filters.category) query = query.eq('category', filters.category);
        if (filters.difficulty) query = query.eq('difficulty', filters.difficulty);

        const { data, error } = await query;
        if (error) throw new Error(`CMS fetch failed: ${error.message}`);

        let result = (data ?? []).map(normalizeTemplate);

        if (filters.industry) {
            result = result.filter(t => {
                const industries = (t.industry || '').split(',').map(i => i.trim());
                return industries.includes(filters.industry);
            });
        }
        if (filters.search) {
            const term = filters.search.toLowerCase();
            result = result.filter(t =>
                (t.name || '').toLowerCase().includes(term) ||
                (t.summary || '').toLowerCase().includes(term) ||
                (t.use_case || '').toLowerCase().includes(term)
            );
        }

        if (Object.keys(filters).length === 0) {
            cache.templates = result;
            cache.templatesTimestamp = Date.now();
        }

        return result;
    },

    getBySlug: async (slug) => {
        const { data, error } = await supabase
            .from('templates')
            .select('*')
            .eq('slug', slug)
            .eq('status', 'Published')
            .single();

        if (error) return null;
        return data ? normalizeTemplate(data) : null;
    },

    getCategories: async () => {
        const { data, error } = await supabase
            .from('templates')
            .select('category')
            .eq('status', 'Published');

        if (error) return [];
        const categories = [...new Set(data.map(t => t.category).filter(Boolean))];
        return categories.sort();
    },

    getIndustries: async () => {
        const { data, error } = await supabase
            .from('templates')
            .select('industry')
            .eq('status', 'Published');

        if (error) return [];
        const industries = new Set();
        data.forEach(t => {
            if (t.industry) {
                t.industry.split(',').map(i => i.trim()).forEach(i => industries.add(i));
            }
        });
        return [...industries].sort();
    },

    getRelated: async (slug, limit = 3) => {
        const current = await templates.getBySlug(slug);
        if (!current) return [];

        const { data, error } = await supabase
            .from('templates')
            .select('*')
            .eq('status', 'Published')
            .eq('category', current.category)
            .neq('slug', slug)
            .limit(limit);

        if (error) return [];
        return (data ?? []).map(normalizeTemplate);
    },
};

export function invalidateCache(type) {
    if (!type || type === 'posts') {
        postsGeneration += 1;
        postsRequest = null;
    }
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
