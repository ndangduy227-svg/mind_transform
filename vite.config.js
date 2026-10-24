import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    for (const key of ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'GROQ_API_KEY', 'SITE_URL']) {
        if (!process.env[key] && env[key]) process.env[key] = env[key];
    }
    return {
        plugins: [react(), {
            name: 'local-chat-api',
            configureServer(server) {
                server.middlewares.use('/api/chat', async (req, res) => {
                    let body = '';
                    try {
                        for await (const chunk of req) {
                            body += chunk;
                            if (Buffer.byteLength(body) > 64000) { res.statusCode = 413; res.end('Request too large'); return; }
                        }
                        req.body = body ? JSON.parse(body) : {};
                        res.status = code => { res.statusCode = code; return res; };
                        res.json = value => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(value)); return res; };
                        const { default: handler } = await import('./api/chat.js');
                        await handler(req, res);
                    } catch {
                        res.statusCode = 400;
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify({ error: 'Yêu cầu không hợp lệ.' }));
                    }
                });
            },
        }],
    };
})
