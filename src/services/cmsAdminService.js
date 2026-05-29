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

    // Bulk operations
    bulkUpdateStatus: async (slugs, status) => {
        const { error } = await supabase
            .from('posts')
            .update({ status, updated_at: new Date().toISOString() })
            .in('slug', slugs);
        if (error) throw new Error(error.message);
        invalidateCache('posts');
    },

    bulkUpdateCategory: async (slugs, category) => {
        const { error } = await supabase
            .from('posts')
            .update({ category, updated_at: new Date().toISOString() })
            .in('slug', slugs);
        if (error) throw new Error(error.message);
        invalidateCache('posts');
    },

    bulkDelete: async (slugs) => {
        const { error } = await supabase
            .from('posts')
            .delete()
            .in('slug', slugs);
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

    // Bulk operations
    bulkUpdateStatus: async (slugs, status) => {
        const { error } = await supabase
            .from('templates')
            .update({ status, updated_at: new Date().toISOString() })
            .in('slug', slugs);
        if (error) throw new Error(error.message);
        invalidateCache('templates');
    },

    bulkUpdateCategory: async (slugs, category) => {
        const { error } = await supabase
            .from('templates')
            .update({ category, updated_at: new Date().toISOString() })
            .in('slug', slugs);
        if (error) throw new Error(error.message);
        invalidateCache('templates');
    },

    bulkDelete: async (slugs) => {
        const { error } = await supabase
            .from('templates')
            .delete()
            .in('slug', slugs);
        if (error) throw new Error(error.message);
        invalidateCache('templates');
    },
};

// ==========================================
// SKILLS CRUD
// ==========================================
export const adminSkills = {
    getAll: async () => {
        const { data, error } = await supabase
            .from('skills')
            .select('*')
            .order('type', { ascending: true })     // master first
            .order('priority', { ascending: false });
        if (error) throw new Error(`Fetch failed: ${error.message}`);
        return data ?? [];
    },

    getBySlug: async (slug) => {
        const { data, error } = await supabase
            .from('skills')
            .select('*')
            .eq('slug', slug)
            .single();
        if (error) return null;
        return data;
    },

    create: async (skillData) => {
        const { error } = await supabase.from('skills').insert([skillData]);
        if (error) throw new Error(error.message);
    },

    update: async (slug, skillData) => {
        const { error } = await supabase
            .from('skills')
            .update({ ...skillData, updated_at: new Date().toISOString() })
            .eq('slug', slug);
        if (error) throw new Error(error.message);
    },

    delete: async (slug) => {
        const { error } = await supabase.from('skills').delete().eq('slug', slug);
        if (error) throw new Error(error.message);
    },

    toggleActive: async (slug, isActive) => {
        const { error } = await supabase
            .from('skills')
            .update({ is_active: isActive, updated_at: new Date().toISOString() })
            .eq('slug', slug);
        if (error) throw new Error(error.message);
    },

    hasMaster: async () => {
        const { data } = await supabase
            .from('skills')
            .select('id')
            .eq('type', 'master')
            .limit(1);
        return data && data.length > 0;
    },
};
