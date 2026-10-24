export const state = { leads: [], failLead: false, failChat: false, chats: [], posts: [] };
export const mockSupabase = { from(table) {
    if (table === 'posts') {
        const filters = [];
        const query = {
            select() { return query; },
            eq(field, value) { filters.push([field,value]); return query; },
            async order() { return { data: state.posts.filter(post => filters.every(([field,value]) => post[field] === value)), error: null }; },
            async single() { return { data: state.posts.find(post => filters.every(([field,value]) => post[field] === value)) || null, error: null }; },
        };
        return query;
    }
    return { async insert(rows) {
        if (table !== 'leads') throw new Error('Unexpected table in component test');
        if (state.failLead) return { error: { message: 'Test failure' } };
        state.leads.push(...rows); return { error: null };
    } };
} };
export function reset() { state.leads = []; state.chats = []; state.failLead = false; state.failChat = false; state.posts = []; }
