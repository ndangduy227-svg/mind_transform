export const state = { leads: [], failLead: false, failChat: false, chats: [] };
export const mockSupabase = { from(table) {
    return { async insert(rows) {
        if (table !== 'leads') throw new Error('Unexpected table in component test');
        if (state.failLead) return { error: { message: 'Test failure' } };
        state.leads.push(...rows); return { error: null };
    } };
} };
export function reset() { state.leads = []; state.chats = []; state.failLead = false; state.failChat = false; }
