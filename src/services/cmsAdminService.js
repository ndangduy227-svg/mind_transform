import { supabase } from '../lib/supabase';
import { invalidateCache } from './cmsService';

// Auth check — returns Promise<boolean>
// Supabase RLS handles actual data protection at database level
export async function isAuthenticated() {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
}

export async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

export async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        return { success: false, message: 'Email hoặc mật khẩu không đúng' };
    }
    return { success: true, user: data.user };
}

export async function logout() {
    await supabase.auth.signOut();
}

export async function fetchAllForAdmin(type) {
    const { data, error } = await supabase
        .from(type)
        .select('*')
        .order('date', { ascending: false });

    if (error) throw new Error(`Fetch failed: ${error.message}`);
    return data ?? [];
}

// ==========================================
// POSTS CRUD
// ==========================================
export const adminPosts = {
    getAll: () => fetchAllForAdmin('posts'),

    getBySlug: async (slug) => {
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .eq('slug', slug)
            .single();
        if (error) return null;
        return data;
    },

    create: async (postData) => {
        const { error } = await supabase.from('posts').insert([postData]);
        if (error) throw new Error(error.message);
        invalidateCache('posts');
    },

    update: async (slug, postData) => {
        const { error } = await supabase
            .from('posts')
            .update({ ...postData, updated_at: new Date().toISOString() })
            .eq('slug', slug);
        if (error) throw new Error(error.message);
        invalidateCache('posts');
    },

    delete: async (slug) => {
        const { error } = await supabase.from('posts').delete().eq('slug', slug);
        if (error) throw new Error(error.message);
        invalidateCache('posts');
    },
};

// ==========================================
// TEMPLATES CRUD
// ==========================================
export const adminTemplates = {
    getAll: () => fetchAllForAdmin('templates'),

    getBySlug: async (slug) => {
        const { data, error } = await supabase
            .from('templates')
            .select('*')
            .eq('slug', slug)
            .single();
        if (error) return null;
        return data;
    },

    create: async (templateData) => {
        const { error } = await supabase.from('templates').insert([templateData]);
        if (error) throw new Error(error.message);
        invalidateCache('templates');
    },

    update: async (slug, templateData) => {
        const { error } = await supabase
            .from('templates')
            .update({ ...templateData, updated_at: new Date().toISOString() })
            .eq('slug', slug);
        if (error) throw new Error(error.message);
        invalidateCache('templates');
    },

    delete: async (slug) => {
        const { error } = await supabase.from('templates').delete().eq('slug', slug);
        if (error) throw new Error(error.message);
        invalidateCache('templates');
    },
};
