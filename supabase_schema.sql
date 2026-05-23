-- =============================================
-- MIND.TRANSFORM - Supabase Schema
-- Chạy file này trong Supabase SQL Editor
-- =============================================

-- POSTS TABLE
CREATE TABLE IF NOT EXISTS posts (
    id          SERIAL PRIMARY KEY,
    slug        TEXT UNIQUE NOT NULL,
    title       TEXT NOT NULL,
    summary     TEXT,
    content     TEXT,
    image       TEXT,
    date        DATE,
    author      TEXT DEFAULT 'Mind.Transform Team',
    category    TEXT,
    status      TEXT DEFAULT 'Published',
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- TEMPLATES TABLE
CREATE TABLE IF NOT EXISTS templates (
    id          SERIAL PRIMARY KEY,
    slug        TEXT UNIQUE NOT NULL,
    name        TEXT NOT NULL,
    summary     TEXT,
    category    TEXT,
    industry    TEXT,
    difficulty  TEXT,
    use_case    TEXT,
    description TEXT,
    features    TEXT,
    setup_time  TEXT,
    lark_link   TEXT,
    image       TEXT,
    date        DATE,
    status      TEXT DEFAULT 'Published',
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- LEADS TABLE
CREATE TABLE IF NOT EXISTS leads (
    id          SERIAL PRIMARY KEY,
    name        TEXT NOT NULL,
    phone       TEXT,
    email       TEXT NOT NULL,
    company     TEXT,
    need        TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE posts     ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads     ENABLE ROW LEVEL SECURITY;

-- Posts: ai cũng đọc được bài Published, chỉ admin mới sửa/xóa
CREATE POLICY "Public can read published posts"
    ON posts FOR SELECT
    TO anon, authenticated
    USING (status = 'Published');

CREATE POLICY "Authenticated can manage all posts"
    ON posts FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Templates: tương tự posts
CREATE POLICY "Public can read published templates"
    ON templates FOR SELECT
    TO anon, authenticated
    USING (status = 'Published');

CREATE POLICY "Authenticated can manage all templates"
    ON templates FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Leads: ai cũng insert được, chỉ admin mới đọc
CREATE POLICY "Anyone can submit a lead"
    ON leads FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated can read leads"
    ON leads FOR SELECT
    TO authenticated
    USING (true);
