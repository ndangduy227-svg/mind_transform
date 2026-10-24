export const state = { leads: [], failLead: false, failChat: false, chats: [], posts: [], failPost:false, coverOnly:false, postWrites:[] };
export const mockSupabase = { from(table) {
    if (table === 'posts') {
        const filters = [];let updateValue;
        const execute = () => {
            if(!updateValue)return {data:state.posts.filter(post=>filters.every(([field,value])=>post[field]===value)),error:null};
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
            then(resolve,reject) { return Promise.resolve(execute()).then(resolve,reject); },
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
export function reset() { state.leads = []; state.chats = []; state.failLead = false; state.failChat = false; state.posts = [];state.failPost=false;state.coverOnly=false;state.postWrites=[]; }
