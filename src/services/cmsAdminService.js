/**
 * CMS Admin Service Layer
 * Handles CRUD operations for Blog Posts and Lark Templates via Google Apps Script
 */

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzTOHDWp8w7M5RtSXxA_lqkQTA_1pqGw_xyO_bPkj0I32P7ck5U5GGe4fBE77ZAM9xEhg/exec";
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'mindtransform2024';

/**
 * Check if the user is authenticated
 */
export function isAuthenticated() {
    return sessionStorage.getItem('admin_auth') === 'true';
}

/**
 * Login
 */
export function login(password) {
    if (password === ADMIN_PASSWORD) {
        sessionStorage.setItem('admin_auth', 'true');
        return true;
    }
    return false;
}

/**
 * Logout
 */
export function logout() {
    sessionStorage.removeItem('admin_auth');
}

/**
 * Fetch all data for admin (including drafts)
 * @param {'posts'|'templates'} type 
 */
export async function fetchAllForAdmin(type) {
    if (!isAuthenticated()) throw new Error('Unauthorized');
    
    // Add all=true parameter to bypass the 'Published' filter in doGet
    const url = `${SCRIPT_URL}?type=${type}&all=true`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
    
    const data = await response.json();
    return Array.isArray(data) ? data : [];
}

/**
 * Generic function to send POST requests
 */
async function sendPostRequest(action, payload) {
    if (!isAuthenticated()) throw new Error('Unauthorized');

    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({
                action,
                ...payload
            })
        });
        
        const result = await response.json();
        if (result.result !== 'success') {
            throw new Error(result.message || 'Operation failed');
        }
        return result;
    } catch (err) {
        console.error(`Admin API Error (${action}):`, err);
        throw err;
    }
}

// ==========================================
// POSTS CRUD
// ==========================================
export const adminPosts = {
    getAll: () => fetchAllForAdmin('posts'),
    
    getBySlug: async (slug) => {
        const data = await fetchAllForAdmin('posts');
        return data.find(p => p.slug === slug) || null;
    },

    create: (data) => sendPostRequest('create_post', { data }),
    
    update: (slug, data) => sendPostRequest('update_post', { slug, data }),
    
    delete: (slug) => sendPostRequest('delete_post', { slug })
};

// ==========================================
// TEMPLATES CRUD
// ==========================================
export const adminTemplates = {
    getAll: () => fetchAllForAdmin('templates'),
    
    getBySlug: async (slug) => {
        const data = await fetchAllForAdmin('templates');
        return data.find(t => t.slug === slug) || null;
    },

    create: (data) => sendPostRequest('create_template', { data }),
    
    update: (slug, data) => sendPostRequest('update_template', { slug, data }),
    
    delete: (slug) => sendPostRequest('delete_template', { slug })
};
