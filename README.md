# Mind.Transform

> Website & AI Agent platform cho Mind.Transform — Agency chuyển đổi số doanh nghiệp Việt Nam.

**Live:** [mind-transform.vercel.app](https://mind-transform.vercel.app)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite 5 + Tailwind CSS |
| Routing | React Router v6 |
| Animation | Framer Motion |
| Database | Supabase (PostgreSQL + Row Level Security) |
| Auth | Supabase Auth (email/password) |
| AI Engine | Groq API — Llama 3.3 70B Versatile |
| CMS Editor | TinyMCE 7 (self-hosted, GPL license) |
| Hosting | Vercel (SPA + Serverless Functions) |
| Icons | Lucide React |

---

## Project Structure

```
mind_transform/
│
├── api/                            # Vercel Serverless Functions
│   └── chat.js                     #   AI chat — skill routing, rate limit, content search
│
├── public/
│   └── tinymce/                    #   Self-hosted TinyMCE (oxide-dark skin, plugins)
│
├── src/
│   ├── components/
│   │   ├── admin/
│   │   │   └── TagSelector.jsx     #   Pill-toggle multi-select (skills, intake form)
│   │   ├── MindAI/
│   │   │   ├── ProblemInput.jsx    #   Initial problem input component
│   │   │   ├── QuestionForm.jsx    #   Follow-up question form
│   │   │   └── UnderstandingScore.jsx  # Circular score gauge
│   │   ├── Layout.jsx              #   App shell (Navbar + Footer + children)
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── LeadForm.jsx            #   Lead capture modal (global)
│   │   └── SidebarCTA.jsx
│   │
│   ├── pages/
│   │   ├── Home.jsx                #   Landing page
│   │   ├── Products.jsx            #   Services & products showcase
│   │   ├── Blog.jsx                #   Blog listing
│   │   ├── BlogPost.jsx            #   Single blog post (Markdown + HTML rendering)
│   │   ├── TemplateLibrary.jsx     #   Lark template gallery
│   │   ├── TemplateDetail.jsx      #   Single template detail
│   │   ├── MindAI.jsx              #   AI Agent — intake form + chat + rate limit
│   │   └── admin/
│   │       ├── AdminLogin.jsx      #   Login + forgot password
│   │       ├── AdminDashboard.jsx  #   CMS dashboard (posts, templates, links)
│   │       ├── PostEditor.jsx      #   TinyMCE blog editor
│   │       ├── TemplateEditor.jsx  #   TinyMCE template editor
│   │       ├── SkillsList.jsx      #   AI Skills management list
│   │       ├── SkillEditor.jsx     #   Skill editor (master/sub, tags, priority)
│   │       └── BulkImport.jsx      #   JSON/CSV bulk import
│   │
│   ├── services/
│   │   ├── cmsService.js           #   Public content fetching + client-side cache
│   │   └── cmsAdminService.js      #   Admin CRUD: posts, templates, skills
│   │
│   ├── constants/
│   │   ├── brand.js                #   Brand colors, company info
│   │   └── mindai.js               #   AI Agent config (industries, departments, limits)
│   │
│   ├── context/
│   │   └── ModalContext.jsx        #   Global modal state (LeadForm)
│   │
│   ├── lib/
│   │   └── supabase.js             #   Supabase client initialization
│   │
│   ├── utils/
│   │   ├── contentRenderer.jsx     #   Dual Markdown/HTML content rendering
│   │   └── imageHelper.js          #   Image URL utilities
│   │
│   ├── App.jsx                     #   Root — Router, ProtectedRoute, ScrollToTop
│   └── main.jsx                    #   Entry point
│
├── SUPABASE_MIGRATION.sql          # SQL schema: skills + rate_limits tables
├── vercel.json                     # Vercel SPA rewrite config
├── tailwind.config.js
├── vite.config.js
└── package.json
```

---

## Features

### Public Pages

| Route | Page | Description |
|---|---|---|
| `/` | Home | Landing page giới thiệu Mind.Transform |
| `/products` | Products | Dịch vụ & giải pháp chuyển đổi số |
| `/blog` | Blog | Danh sách bài viết từ Supabase |
| `/blog/:slug` | BlogPost | Bài viết chi tiết (hỗ trợ Markdown + HTML) |
| `/templates` | Templates | Thư viện Lark templates |
| `/templates/:slug` | TemplateDetail | Chi tiết template |
| `/mind-ai` | Mind AI | AI Agent tư vấn chuyển đổi số |

### Mind AI Agent (`/mind-ai`)

Hệ thống AI tư vấn tự động cho doanh nghiệp:

- **Intake Form** — Thu thập ngành nghề, quy mô, phòng ban, website trước khi bắt đầu chat
- **Skill Routing** — Tự động match Master Skill + Sub-skills từ database theo tags trong intake form
- **Content Search** — Tìm bài viết/templates liên quan và gợi ý suggested links trong chat
- **Rate Limiting** — 5 lượt/session + 30 lượt/IP/ngày (bảo vệ quota Groq API free tier)
- **Session Limit Modal** — Popup khi hết lượt, kèm liên hệ Zalo để tư vấn trực tiếp
- **Understanding Score** — Đánh giá mức độ AI hiểu bối cảnh doanh nghiệp (0-100%)

### Admin CMS (`/admin`)

| Route | Page | Description |
|---|---|---|
| `/admin/login` | Login | Đăng nhập + quên mật khẩu |
| `/admin` | Dashboard | Quản lý posts & templates |
| `/admin/post/:slug` | Post Editor | Soạn bài viết (TinyMCE dark theme) |
| `/admin/template/:slug` | Template Editor | Soạn template (TinyMCE dark theme) |
| `/admin/skills` | Skills List | Quản lý AI Agent skills |
| `/admin/skill/:slug` | Skill Editor | Tạo/sửa Master Skill & Sub-skills |
| `/admin/import` | Bulk Import | Import hàng loạt từ JSON/CSV |

---

## Database Schema

### Supabase Tables

| Table | Primary Key | Description |
|---|---|---|
| `posts` | `id` (bigserial) | Blog posts — title, slug, content, category, status, tags, date |
| `templates` | `id` (bigserial) | Lark templates — name, slug, description, use_case, category |
| `skills` | `id` (bigserial) | AI skills — name, slug, type (master/sub), content, tags, priority |
| `rate_limits` | `ip` (text) | Rate limiting — daily_count, session_count, last_reset |
| `research` | `id` (bigserial) | Chat conversations khi user kết thúc phiên tư vấn |

### Row Level Security (RLS)

| Table | `anon` | `authenticated` | `service_role` |
|---|---|---|---|
| `posts` | SELECT (published) | Full CRUD | Bypass |
| `templates` | SELECT (published) | Full CRUD | Bypass |
| `skills` | SELECT (active only) | Full CRUD | Bypass |
| `rate_limits` | Blocked | Blocked | Bypass (auto) |

### Skills Architecture

```
Master Skill (1 duy nhất)
  └─ Định hình AI Agent: persona, SOW, tone, output format
  └─ Luôn được gửi kèm mọi cuộc hội thoại

Sub-skills (nhiều)
  ├─ tags_industry: TEXT[]   → match theo ngành nghề
  ├─ tags_department: TEXT[] → match theo phòng ban
  ├─ priority: INT           → số cao = ưu tiên chọn trước
  └─ Tối đa 3 sub-skills được chọn per session
```

---

## Serverless API

### `POST /api/chat`

**Request:**
```json
{
  "message": "Vấn đề của tôi...",
  "history": [{ "user": "...", "ai": "..." }],
  "intakeForm": {
    "industry": "Bán lẻ",
    "departments": ["CRM", "Sales"],
    "companySize": "11-50 người",
    "website": "https://congty.vn"
  },
  "messageCount": 1
}
```

**Response (200):**
```json
{
  "analysis": "Nhận định chuyên gia ngắn gọn...",
  "score": 35,
  "next_question": "Câu hỏi tiếp theo...",
  "suggested_links": [
    { "title": "Bài viết liên quan", "url": "/blog/slug", "type": "post" },
    { "title": "Template phù hợp", "url": "/templates/slug", "type": "template" }
  ]
}
```

**Rate Limited (429):**
```json
{
  "error": "rate_limited",
  "message": "Bạn đã hết lượt sử dụng hôm nay...",
  "zalo": "0929657232"
}
```

### API Flow

```
Client Request
  │
  ├─ 1. Rate Limit Check (IP → rate_limits table)
  │     └─ 429 nếu vượt 5/session hoặc 30/ngày
  │
  ├─ 2. Fetch Skills (parallel)
  │     ├─ Master Skill (luôn lấy)
  │     └─ Sub-skills (match tags từ intakeForm)
  │
  ├─ 3. Content Search (parallel)
  │     ├─ Posts (keyword ILIKE match)
  │     └─ Templates (keyword ILIKE match)
  │
  ├─ 4. Build Prompt
  │     ├─ System: Master Skill content
  │     ├─ Context: Sub-skills + suggested resources
  │     └─ History: conversation turns
  │
  └─ 5. Groq API → JSON Response
```

---

## Setup

### Prerequisites

- Node.js 18+
- Supabase project ([supabase.com](https://supabase.com))
- Groq API key ([console.groq.com](https://console.groq.com))

### 1. Clone & Install

```bash
git clone https://github.com/ndangduy227-svg/mind_transform.git
cd mind_transform
npm install
```

### 2. Environment Variables

**Local development** — tạo file `.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GROQ_API_KEY=your-groq-api-key
```

**Vercel** — thêm env vars (Settings > Environment Variables):

| Variable | Scope | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | Client | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Client | Supabase anon/public key |
| `VITE_GROQ_API_KEY` | Client | Groq API key (cho legacy) |
| `SUPABASE_URL` | Server | Supabase project URL (serverless functions) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server | Supabase service role key (RLS bypass) |
| `GROQ_API_KEY` | Server | Groq API key (cho serverless functions) |

### 3. Database Setup

Chạy `SUPABASE_MIGRATION.sql` trong **Supabase Dashboard > SQL Editor**:
- Tạo bảng `skills` (với RLS, GIN indexes, unique master constraint)
- Tạo bảng `rate_limits` (chỉ service_role truy cập)
- Thêm cột `tags` cho bảng `posts`

### 4. Run

```bash
npm run dev        # Development server (http://localhost:5173)
npm run build      # Production build
npm run preview    # Preview production build
```

### 5. Deploy

Push lên `main` branch — Vercel tự động deploy.

---

## Admin Guide

### Quản lý User

Admin users được quản lý tại **Supabase Dashboard > Authentication > Users**:
- Tạo user mới: Add user > nhập email + password
- Reset password: User dùng "Quên mật khẩu" tại `/admin/login`

### Tạo Master Skill (bắt buộc sau deploy)

1. Đăng nhập `/admin/login`
2. Vào **AI Skills** > **Thêm Skill**
3. Chọn type = **Master**
4. Viết prompt gốc cho AI Agent (persona, SOW, phong cách, output format)
5. Lưu — AI Agent sẽ dùng prompt này cho mọi cuộc hội thoại

### Bulk Import

Hỗ trợ import hàng loạt posts/templates từ file JSON hoặc CSV tại `/admin/import`.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                    VERCEL                            │
│  ┌──────────────┐    ┌────────────────────────────┐  │
│  │  Vite SPA    │    │  Serverless Function       │  │
│  │  (React 18)  │───>│  api/chat.js               │  │
│  │              │    │  ┌──────────────────────┐   │  │
│  │  /mind-ai    │    │  │ Rate Limit           │   │  │
│  │  /blog       │    │  │ Skill Routing        │   │  │
│  │  /admin      │    │  │ Content Search       │   │  │
│  │  /templates  │    │  │ Prompt Builder       │   │  │
│  └──────┬───────┘    │  └──────────┬───────────┘   │  │
│         │            └─────────────┼───────────────┘  │
└─────────┼──────────────────────────┼──────────────────┘
          │                          │
          ▼                          ▼
┌──────────────────┐     ┌──────────────────┐
│    SUPABASE      │     │    GROQ API      │
│  ┌────────────┐  │     │                  │
│  │ posts      │  │     │  Llama 3.3 70B   │
│  │ templates  │  │     │  Versatile       │
│  │ skills     │  │     │                  │
│  │ rate_limits│  │     │  JSON response   │
│  │ research   │  │     │                  │
│  └────────────┘  │     └──────────────────┘
│  Auth + RLS      │
└──────────────────┘
```

---

## License

Private project — Mind.Transform. All rights reserved.
