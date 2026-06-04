// Vercel Edge Middleware — runs BEFORE any page or API route
// Blocks known scraper bots, enforces basic edge-level protection

const BLOCKED_BOTS = [
    'httrack', 'wget', 'curl', 'python-requests', 'scrapy', 'phantom',
    'headlesschrome', 'puppeteer', 'selenium', 'webdriver',
    'bytespider', 'petalbot', 'semrushbot', 'ahrefsbot', 'mj12bot',
    'dotbot', 'rogerbot', 'megaindex', 'blexbot', 'dataforseo',
    'ccbot', 'gptbot', 'chatgpt-user', 'claudebot', 'anthropic',
    'facebookexternalhit',  // only block deep scraping, not OG preview
];

// Paths that should never be accessed externally
const BLOCKED_PATHS = [
    '/api/chat',  // only via origin-validated POST from our frontend
];

export const config = {
    matcher: [
        // Run on all routes except static files
        '/((?!_next/static|_next/image|favicon.ico|tinymce|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js|woff2?|ttf|eot)).*)',
    ],
};

export default function middleware(request) {
    const ua = (request.headers.get('user-agent') || '').toLowerCase();
    const path = new URL(request.url).pathname;

    // ── Block known scraper bots ────────────────────────────────────
    const isBot = BLOCKED_BOTS.some(bot => ua.includes(bot));

    if (isBot) {
        // Allow search engine bots to access public pages (for SEO)
        // But block scraper bots on API routes
        if (path.startsWith('/api/')) {
            return new Response(JSON.stringify({ error: 'Forbidden' }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // For content scraper bots on public pages, return 403
        // (Googlebot, Bingbot are NOT in the blocked list — they're fine)
        if (!path.startsWith('/admin')) {
            return new Response('Access denied', { status: 403 });
        }
    }

    // ── Block direct GET requests to API chat endpoint ──────────────
    if (path === '/api/chat' && request.method === 'GET') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    // ── Block empty User-Agent (common for simple scripts) ──────────
    if (!ua || ua.length < 10) {
        if (path.startsWith('/api/')) {
            return new Response(JSON.stringify({ error: 'Forbidden' }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' },
            });
        }
    }

    // Continue to the actual route
    return undefined;
}
