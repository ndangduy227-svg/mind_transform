# Mind.Transform

Website & AI Agent cho Mind.Transform — Agency chuyển đổi số doanh nghiệp.

**Live:** [mind-transform.vercel.app](https://mind-transform.vercel.app)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Routing | React Router v6 |
| Animation | Framer Motion |
| Database & Auth | Supabase (PostgreSQL + Auth + RLS) |
| AI | Groq API (Llama 3.3 70B) |
| CMS Editor | TinyMCE (self-hosted, GPL) |
| Hosting | Vercel (SPA + Serverless Functions) |

## Project Structure

```
mind_transform/
├── api/
│   └── chat.js                  # Vercel Serverless — AI chat endpoint
├── public/
│   └── tinymce/                 # Self-hosted TinyMCE assets
├── src/
│   ├── components/
│   │   ├── admin/
│   │   │   └── TagSelector.jsx  # Reusable pill-toggle tag selector
│   │   ├── MindAI/
│   │   │   ├── ProblemInput.jsx
│   │   │   ├── QuestionForm.jsx
│   │   │   └── UnderstandingScore.jsx
│   │   ├── Footer.jsx
│   │   ├── Layout.jsx
│   │   ├── LeadForm.jsx
│   │   ├── Navbar.jsx
│   │   └── SidebarCTA.jsx
│   ├── constants/
│   │   ├── brand.js             # Brand constants
│   │   └── mindai.js            # AI Agent constants (industries, departments, limits)
│   ├── context/
│   │   └── ModalContext.jsx
│   ├── lib/
│   │   └── supabase.js          # Supabase client init
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminLogin.jsx   # Login + forgot password flow
│   │   │   ├── BulkImport.jsx   # JSON/CSV bulk import for posts & templates
│   │   │   ├── PostEditor.jsx   # TinyMCE blog post editor
│   │   │   ├── SkillEditor.jsx  # AI skill editor (master/sub)
│   │   │   ├── SkillsList.jsx   # AI skills management list
│   │   │   └── TemplateEditor.jsx
│   │   ├── Blog.jsx
│   │   ├── BlogPost.jsx
│   │   ├── Home.jsx
│   │   ├── MindAI.jsx           # AI Agent chat with intake form
│   │   ├── Products.jsx
│   │   ├── TemplateDetail.jsx
│   │   └── TemplateLibrary.jsx
│   ├── services/
│   │   ├── cmsAdminService.js   # Admin CRUD (posts, templates, skills)
│   │   └── cmsService.js        # Public content fetching + cache
│   ├── utils/
│   │   ├── contentRenderer.jsx  # Dual Markdown/HTML rendering
│   │   └── imageHelper.js
│   ├── App.jsx
│   └── main.jsx
├── SUPABASE_MIGRATION.sql       # Database schema (skills, rate_limits)
├── package.json
├── tailwind.config.js
├── vite.config.js
└── vercel.json
```

## Features

### Public Pages
- **Home** — Landing page
- **Blog** — Danh sach bai viet tu Supabase
- **Templates** — Thu vien Lark templates
- **Products** — Gioi thieu san pham/dich vu
- **Mind AI** — AI Agent tu van chuyen doi so

### Mind AI Agent (`/mind-ai`)
- **Intake form**: Nganh nghe, quy mo, phong ban, website + cau hoi dau tien
- **Skill routing**: Tu dong match Master Skill + Sub-skills theo tags tu intake form
- **Content search**: Tim bai viet/templates lien quan → goi y suggested links
- **Rate limiting**: 5 luot/session + 30 luot/IP/ngay
- **Session limit modal**: Popup het luot voi lien he Zalo

### Admin CMS (`/admin`)
- **Dashboard**: Quan ly blog posts & Lark templates
- **Post/Template Editor**: TinyMCE WYSIWYG (dark theme, self-hosted GPL)
- **AI Skills Management** (`/admin/skills`): Tao/sua Master Skill va Sub-skills
- **Bulk Import** (`/admin/import`): Upload JSON/CSV de tao bai hang loat
- **Auth**: Supabase email/password + forgot password flow

## Database Schema (Supabase)

### Tables
| Table | Description |
|-------|-------------|
| `posts` | Blog posts (title, slug, content, category, status, tags) |
| `templates` | Lark templates (name, slug, description, use_case, category) |
| `skills` | AI Agent skills — master (1 duy nhat) + sub-skills |
| `rate_limits` | IP-based rate limiting cho AI chat |
| `research` | Luu tru conversation khi user ket thuc chat |

### Row Level Security (RLS)
- `skills`: anon chi doc active skills, authenticated full CRUD
- `rate_limits`: chi service_role truy cap (serverless function)
- `posts` / `templates`: anon doc published, authenticated full CRUD

## Serverless API

### `POST /api/chat`

AI chat endpoint voi skill routing va rate limiting.

**Request:**
```json
{
  "message": "Van de cua toi...",
  "history": [{ "user": "...", "ai": "..." }],
  "intakeForm": {
    "industry": "Ban le",
    "departments": ["CRM", "Sales"],
    "companySize": "11-50 nguoi",
    "website": ""
  },
  "messageCount": 1
}
```

**Response:**
```json
{
  "analysis": "Nhan dinh chuyen gia...",
  "score": 35,
  "next_question": "Cau hoi tiep theo...",
  "suggested_links": [
    { "title": "Bai viet lien quan", "url": "/blog/slug", "type": "post" }
  ]
}
```

**Rate limit response (429):**
```json
{
  "error": "rate_limited",
  "message": "Ban da het luot su dung hom nay...",
  "zalo": "0929657232"
}
```

## Setup

### Prerequisites
- Node.js 18+
- Supabase project
- Groq API key

### 1. Clone & Install
```bash
git clone https://github.com/ndangduy227-svg/mind_transform.git
cd mind_transform
npm install
```

### 2. Environment Variables

Tao file `.env` o root:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GROQ_API_KEY=your-groq-api-key
```

Vercel env vars (server-side, khong co prefix VITE_):
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GROQ_API_KEY=your-groq-api-key
```

### 3. Database Setup

Chay file `SUPABASE_MIGRATION.sql` trong Supabase SQL Editor de tao bang `skills` va `rate_limits`.

### 4. Run Dev Server
```bash
npm run dev
```

### 5. Deploy
Push len `main` branch → Vercel tu dong deploy.

## Admin Access

- Quan ly admin users tai: **Supabase Dashboard > Authentication > Users**
- Quen mat khau: Su dung flow "Quen mat khau" tai `/admin/login`
- Tao Master Skill dau tien tai `/admin/skills` sau khi deploy

## License

Private project — Mind.Transform.
