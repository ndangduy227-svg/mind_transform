import { supabase } from '../lib/supabase';
import { STATIC_POSTS } from '../data/staticPosts';

const cache = {
    posts: null,
    templates: null,
    postsTimestamp: 0,
    templatesTimestamp: 0,
};

const CACHE_TTL = 5 * 60 * 1000;

function mergePosts(remotePosts = []) {
    const postsBySlug = new Map();

    [...STATIC_POSTS, ...remotePosts].forEach(post => {
        if (!postsBySlug.has(post.slug)) postsBySlug.set(post.slug, post);
    });

    return [...postsBySlug.values()].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
}

function isCacheValid(type) {
    return cache[type] !== null && (Date.now() - cache[`${type}Timestamp`]) < CACHE_TTL;
}

export const posts = {
    getAll: async () => {
        if (isCacheValid('posts')) return cache.posts;

        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .eq('status', 'Published')
            .order('date', { ascending: false });

        if (error) {
            cache.posts = mergePosts();
            cache.postsTimestamp = Date.now();
            return cache.posts;
        }

        cache.posts = mergePosts(data ?? []);
        cache.postsTimestamp = Date.now();
        return cache.posts;
    },

    getBySlug: async (slug) => {
        const staticPost = STATIC_POSTS.find(post => post.slug === slug);
        if (staticPost) return staticPost;

        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .eq('slug', slug)
            .eq('status', 'Published')
            .single();

        if (error) return null;
        return data;
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

        let result = data ?? [];

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
        return data;
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
        return data ?? [];
    },
};

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
