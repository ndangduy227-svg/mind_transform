import { createClient } from '@supabase/supabase-js';

// ── Supabase server client (service role — never expose to browser) ──────────
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ── Fallback prompt (used when no master skill exists in DB) ─────────────────
const FALLBACK_SYSTEM_PROMPT = `
Role: Bạn là "Business Transformation Manager" của Mind.Transform.
Bạn không chỉ là người hỏi, bạn là một đối tác chiến lược: sắc sảo, thực tế và hướng tới giải pháp.

MIND.TRANSFORM CORE VALUES & PHILOSOPHY:
Hãy để các giá trị sau đây dẫn dắt cách bạn phân tích và đặt câu hỏi:
1. Thực chiến (Pragmatism): Chúng ta là Agency tập trung vào phân tích và triển khai, không vẽ bánh vẽ. Mọi vấn đề cần được nhìn nhận dưới góc độ "Làm thế nào để áp dụng vào thực tế?".
2. Trung lập về Công nghệ (Tech Agnostic): Chúng ta tận dụng các Product có sẵn trên thị trường để giải quyết bài toán, không cố bán một giải pháp duy nhất. Hãy tìm ra "nỗi đau" thực sự trước khi nói về công cụ.
3. Đồng hành (Empathy): Luôn đặt mình vào vị trí của chủ doanh nghiệp để thấu hiểu áp lực của họ.
4. Minh bạch (Integrity): Tư vấn thẳng thắn, không ngại chỉ ra điểm yếu trong quy trình hiện tại của khách hàng.

Task:
1. Phân tích (Analyze):
   - Đọc hiểu vấn đề của User qua lăng kính của Core Values.
   - Xác định User đang ở giai đoạn nào: Mơ hồ, Đã có kế hoạch, hay Đang gặp khủng hoảng?

2. Đánh giá "Mức độ thấu hiểu" (Understanding Score 0-100%):
   - < 50%: Thông tin còn sơ sài -> Cần hỏi rộng để nắm bối cảnh.
   - 50-80%: Đã nắm được nỗi đau chính -> Cần hỏi sâu vào chi tiết (quy trình, nhân sự, budget).
   - > 80%: Đã đủ dữ liệu để đề xuất giải pháp -> Gợi ý User kết thúc để nhận Proposal (nhưng không ép buộc).

3. Phản hồi (Response):
   - Tuyệt đối không trả lời chung chung như AI (chatGPT style).
   - Short Analysis: Đưa ra một nhận định sắc bén thể hiện chuyên môn ngay lập tức.
   - Next Question: Đặt 01 câu hỏi đắt giá nhất để khai thác thông tin ("Kill question").
   - Tone: Chuyên nghiệp nhưng gần gũi (Professional & Conversational).

Output Format (JSON only, no markdown, no explanation outside JSON):
{
  "analysis": "Nhận định ngắn gọn (1-2 câu).",
  "score": 0,
  "next_question": "Câu hỏi tiếp theo.",
  "suggested_links": []
}
`.trim();

// ── Helpers ──────────────────────────────────────────────────────────────────

function getClientIp(req) {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
        // x-forwarded-for may contain a comma-separated list; first is the real client
        return forwarded.split(',')[0].trim();
    }
    return req.socket?.remoteAddress || 'unknown';
}

function isSameUtcDay(date) {
    if (!date) return false;
    const now = new Date();
    const d = new Date(date);
    return (
        now.getUTCFullYear() === d.getUTCFullYear() &&
        now.getUTCMonth() === d.getUTCMonth() &&
        now.getUTCDate() === d.getUTCDate()
    );
}

/** Extract 1-2 significant keywords (> 3 chars) from the user message */
function extractKeywords(text) {
    if (!text) return [];
    const stopWords = new Set([
        'mình', 'chúng', 'những', 'không', 'được', 'nhưng', 'cũng', 'với',
        'trong', 'ngoài', 'trên', 'dưới', 'đang', 'this', 'that', 'with',
        'from', 'have', 'what', 'your', 'will', 'about', 'them', 'there',
        'then', 'than', 'when', 'which', 'would', 'could', 'should',
    ]);
    const words = text
        .replace(/[^\p{L}\p{N}\s]/gu, ' ')
        .split(/\s+/)
        .filter(w => w.length > 3 && !stopWords.has(w.toLowerCase()));
    // Return up to 2 keywords (pick from the end — often more specific)
    return words.slice(-2);
}

// ── Rate limiting ────────────────────────────────────────────────────────────

async function checkRateLimit(ip, messageCount) {
    // Session limit check (client-reported, but we verify)
    if (typeof messageCount === 'number' && messageCount >= 5) {
        return {
            limited: true,
            body: {
                error: 'rate_limited',
                message: 'Bạn đã hết 5 lượt chat trong phiên này. Vui lòng bắt đầu phiên mới hoặc liên hệ trực tiếp.',
                zalo: '0929657232',
            },
        };
    }

    // Fetch or create row
    const { data: row, error: fetchErr } = await supabase
        .from('rate_limits')
        .select('*')
        .eq('ip', ip)
        .maybeSingle();

    if (fetchErr) {
        console.error('rate_limits fetch error:', fetchErr.message);
        // Fail open — don't block user if DB is down
        return { limited: false };
    }

    const now = new Date().toISOString();

    if (!row) {
        // First time visitor — create row with count = 1
        await supabase.from('rate_limits').insert({
            ip,
            session_count: 1,
            daily_count: 1,
            last_reset: now,
            updated_at: now,
        });
        return { limited: false };
    }

    // Reset daily count if last_reset is from a different UTC day
    let dailyCount = row.daily_count || 0;
    if (!isSameUtcDay(row.last_reset)) {
        dailyCount = 0;
    }

    // Check daily limit
    if (dailyCount >= 30) {
        return {
            limited: true,
            body: {
                error: 'rate_limited',
                message: 'Bạn đã hết lượt sử dụng hôm nay. Vui lòng quay lại vào ngày mai hoặc liên hệ trực tiếp qua Zalo để được tư vấn ngay.',
                zalo: '0929657232',
            },
        };
    }

    // Increment
    await supabase
        .from('rate_limits')
        .update({
            daily_count: dailyCount + 1,
            session_count: (row.session_count || 0) + 1,
            last_reset: isSameUtcDay(row.last_reset) ? row.last_reset : now,
            updated_at: now,
        })
        .eq('ip', ip);

    return { limited: false };
}

// ── Skills fetching ──────────────────────────────────────────────────────────

async function fetchMasterSkill() {
    const { data, error } = await supabase
        .from('skills')
        .select('content')
        .eq('type', 'master')
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();

    if (error) {
        console.error('master skill fetch error:', error.message);
        return null;
    }
    return data?.content || null;
}

async function fetchSubSkills(intakeForm) {
    if (!intakeForm) return [];

    const { industry, departments } = intakeForm;
    if (!industry && (!departments || departments.length === 0)) return [];

    // Build query: match by industry tag OR overlapping department tags
    let query = supabase
        .from('skills')
        .select('name, content')
        .eq('type', 'sub')
        .eq('is_active', true)
        .order('priority', { ascending: false })
        .limit(3);

    if (industry && departments && departments.length > 0) {
        // tags_industry @> ARRAY[industry] OR tags_department && departments
        query = query.or(
            `tags_industry.cs.{${industry}},tags_department.ov.{${departments.join(',')}}`
        );
    } else if (industry) {
        query = query.contains('tags_industry', [industry]);
    } else if (departments && departments.length > 0) {
        query = query.overlaps('tags_department', departments);
    }

    const { data, error } = await query;
    if (error) {
        console.error('sub skills fetch error:', error.message);
        return [];
    }
    return data || [];
}

// ── Content search (posts & templates) ───────────────────────────────────────

async function searchContent(keywords) {
    if (!keywords || keywords.length === 0) return { posts: [], templates: [] };

    const results = { posts: [], templates: [] };

    // Search in parallel for each keyword
    const postPromises = keywords.map(kw =>
        supabase
            .from('posts')
            .select('title, slug, excerpt')
            .eq('status', 'Published')
            .or(`title.ilike.%${kw}%,category.ilike.%${kw}%`)
            .limit(3)
    );

    const templatePromises = keywords.map(kw =>
        supabase
            .from('templates')
            .select('name, slug, category')
            .eq('status', 'Published')
            .or(`name.ilike.%${kw}%,category.ilike.%${kw}%`)
            .limit(3)
    );

    const [postResults, templateResults] = await Promise.all([
        Promise.all(postPromises),
        Promise.all(templatePromises),
    ]);

    // Deduplicate by slug
    const seenSlugs = new Set();
    for (const { data } of postResults) {
        if (data) {
            for (const post of data) {
                if (!seenSlugs.has(post.slug)) {
                    seenSlugs.add(post.slug);
                    results.posts.push(post);
                }
            }
        }
    }
    for (const { data } of templateResults) {
        if (data) {
            for (const tpl of data) {
                if (!seenSlugs.has(tpl.slug)) {
                    seenSlugs.add(tpl.slug);
                    results.templates.push(tpl);
                }
            }
        }
    }

    // Cap at 3 each
    results.posts = results.posts.slice(0, 3);
    results.templates = results.templates.slice(0, 3);

    return results;
}

// ── Build the prompt ─────────────────────────────────────────────────────────

function buildPrompt({ masterSkill, subSkills, suggestedLinks, history, message }) {
    // System message: master skill or fallback
    let systemContent = masterSkill || FALLBACK_SYSTEM_PROMPT;

    // Append sub-skills context
    if (subSkills.length > 0) {
        systemContent += '\n\n--- SUB-SKILL CONTEXT ---\n';
        for (const skill of subSkills) {
            systemContent += `\n### ${skill.name}\n${skill.content}\n`;
        }
    }

    // Append suggested resources
    if (suggestedLinks.length > 0) {
        systemContent += '\n\n--- AVAILABLE RESOURCES TO SUGGEST ---\n';
        systemContent += 'Khi phù hợp, hãy gợi ý những tài nguyên sau trong phần suggested_links của JSON output:\n';
        for (const link of suggestedLinks) {
            systemContent += `- [${link.type}] "${link.title}" → ${link.url}\n`;
        }
    }

    // Append output format instruction
    systemContent += `\n\nOutput Format (JSON only, no markdown, no explanation outside JSON):
{
  "analysis": "Nhận định ngắn gọn (1-2 câu).",
  "score": 0,
  "next_question": "Câu hỏi tiếp theo.",
  "suggested_links": [{ "title": "...", "url": "/blog/slug-here", "type": "post" }]
}`;

    // Build messages array
    const messages = [
        { role: 'system', content: 'You are a JSON-only responder. Always reply with valid JSON, no markdown.' },
        { role: 'system', content: systemContent },
    ];

    // Conversation history
    if (history && history.length > 0) {
        for (const turn of history) {
            messages.push({ role: 'user', content: turn.user });
            messages.push({ role: 'assistant', content: turn.ai });
        }
    }

    // Current user message
    messages.push({ role: 'user', content: message });

    return messages;
}

// ── Main handler ─────────────────────────────────────────────────────────────

// ── Allowed origins for API requests ─────────────────────────────────────
const ALLOWED_ORIGINS = [
    'https://mind-transform.vercel.app',
    'https://www.mind-transform.vercel.app',
    'http://localhost:5173',       // dev
    'http://localhost:4173',       // preview
];

function isAllowedOrigin(req) {
    const origin = req.headers['origin'] || '';
    const referer = req.headers['referer'] || '';

    // Allow if origin matches
    if (ALLOWED_ORIGINS.some(o => origin.startsWith(o))) return true;
    // Allow if referer matches
    if (ALLOWED_ORIGINS.some(o => referer.startsWith(o))) return true;
    // Allow Vercel preview deployments
    if (origin.includes('vercel.app') || referer.includes('vercel.app')) return true;

    return false;
}

export default async function handler(req, res) {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // ── Origin validation — block requests from unknown domains ──────
    if (!isAllowedOrigin(req)) {
        return res.status(403).json({ error: 'Forbidden: invalid origin' });
    }

    const { message, history, intakeForm, messageCount } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    // ── Rate limiting ────────────────────────────────────────────────────
    const ip = getClientIp(req);
    const rateCheck = await checkRateLimit(ip, messageCount);
    if (rateCheck.limited) {
        return res.status(429).json(rateCheck.body);
    }

    // ── Fetch skills & search content in parallel ────────────────────────
    const keywords = extractKeywords(message);

    const [masterSkill, subSkills, content] = await Promise.all([
        fetchMasterSkill(),
        fetchSubSkills(intakeForm),
        searchContent(keywords),
    ]);

    // Build suggested_links from content search results
    const suggestedLinks = [
        ...content.posts.map(p => ({
            title: p.title,
            url: `/blog/${p.slug}`,
            type: 'post',
        })),
        ...content.templates.map(t => ({
            title: t.name,
            url: `/templates/${t.slug}`,
            type: 'template',
        })),
    ];

    // ── Build prompt & call Groq ─────────────────────────────────────────
    const messages = buildPrompt({
        masterSkill,
        subSkills,
        suggestedLinks,
        history,
        message,
    });

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages,
                temperature: 0.7,
                max_tokens: 1024,
            }),
        });

        const data = await response.json();

        if (data.error) {
            return res.status(500).json({ error: data.error.message });
        }

        let text = data.choices[0].message.content;
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        let result;
        try {
            result = JSON.parse(text);
        } catch {
            // If Groq returned non-JSON, wrap it
            result = {
                analysis: text,
                score: 0,
                next_question: '',
                suggested_links: [],
            };
        }

        // Ensure suggested_links is always present (merge DB links if AI didn't include them)
        if (!result.suggested_links || !Array.isArray(result.suggested_links)) {
            result.suggested_links = suggestedLinks;
        } else if (result.suggested_links.length === 0 && suggestedLinks.length > 0) {
            result.suggested_links = suggestedLinks;
        }

        return res.status(200).json(result);
    } catch (err) {
        console.error('Groq API error:', err.message);
        return res.status(500).json({ error: err.message });
    }
}
