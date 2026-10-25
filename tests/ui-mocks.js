export const state = { leads: [], failLead: false, failChat: false, chats: [], posts: [], failPost:false, coverOnly:false, postWrites:[], postReads:[], readPosts:null, authCalls: [], authError: null, authThrows: false };
const authListeners = new Set();
export function emitAuth(event, session) { authListeners.forEach(listener => listener(event, session)); }
async function authResult(method, payload) {
    state.authCalls.push({method, payload});
    if (state.authThrows) throw new Error('Test network failure');
    if (method === 'signOut' && !state.authError) emitAuth('SIGNED_OUT', null);
    return { data: { user: { id: 'test-user' } }, error: state.authError };
}
export const mockSupabase = { auth: {
    onAuthStateChange(listener) { authListeners.add(listener); return { data: { subscription: { unsubscribe() { authListeners.delete(listener); } } } }; },
    resetPasswordForEmail(email, options) { return authResult('resetPasswordForEmail', {email, options}); },
    updateUser(payload) { return authResult('updateUser', payload); },
    signInWithPassword(payload) { return authResult('signInWithPassword', payload); },
    signOut(payload) { return authResult('signOut', payload); },
}, from(table) {
    if (table === 'posts') {
        const filters = [];let updateValue, retryEnabled, signal;
        const execute = () => {
            if(!updateValue) {
                state.postReads.push({retryEnabled,signal});
                if(state.readPosts)return state.readPosts();
                return {data:state.posts.filter(post=>filters.every(([field,value])=>post[field]===value)),error:null};
            }
            state.postWrites.push(updateValue);
            if(state.failPost)return {data:null,error:{message:'Test post save failure'}};
            if(state.coverOnly && 'image' in updateValue)return {data:null,error:{code:'PGRST204',message:"Could not find the 'image' column in the schema cache"}};
            const data=[];state.posts=state.posts.map(post=>{if(!filters.every(([field,value])=>post[field]===value))return post;const next={...post,...updateValue};data.push(next);return next;});return {data,error:null};
        };
        const query = {
            select() { return query; },
            update(value) { updateValue=value;return query; },
            async insert(rows) {
                state.postWrites.push(...rows);
                if(state.failPost)return {error:{message:'Test post save failure'}};
                if(state.coverOnly && rows.some(row=>'image' in row))return {error:{code:'PGRST204',message:"Could not find the 'image' column in the schema cache"}};
                if(rows.some(row=>state.posts.some(post=>post.slug===row.slug)))return {error:{code:'23505',message:'Duplicate slug'}};
                state.posts.push(...rows.map((row,index)=>({...row,id:state.posts.length+index+1})));return {error:null};
            },
            then(resolve,reject) { return Promise.resolve().then(execute).then(resolve,reject); },
            eq(field, value) { filters.push([field,value]); return query; },
            order() { return query; },
            retry(enabled) { retryEnabled=enabled;return query; },
            abortSignal(value) { signal=value;return query; },
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
export function reset() { state.leads = []; state.chats = []; state.failLead = false; state.failChat = false; state.posts = [];state.failPost=false;state.coverOnly=false;state.postWrites=[];state.postReads=[];state.readPosts=null;state.authCalls=[];state.authError=null;state.authThrows=false; }
