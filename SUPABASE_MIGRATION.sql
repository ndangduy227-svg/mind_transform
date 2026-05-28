-- ============================================================
-- MIND AI AGENT - HE THONG KY NANG (SKILL SYSTEM)
-- ============================================================
-- File nay dung de chay trong Supabase SQL Editor.
-- Tao bang skills, rate_limits va cap nhat bang posts.
-- ============================================================


-- ============================================================
-- PHAN 1: BANG SKILLS — Luu tru cac ky nang cua AI Agent
-- ============================================================
-- Bang nay chua tat ca cac ky nang (master va sub).
-- Moi ky nang co ten, slug duy nhat, loai (master/sub),
-- noi dung, tags phan loai theo nganh va phong ban.
-- ============================================================

CREATE TABLE IF NOT EXISTS skills (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL DEFAULT 'sub' CHECK (type IN ('master', 'sub')),
    content TEXT DEFAULT '',
    tags_industry TEXT[] DEFAULT '{}',
    tags_department TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    priority INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index tren type va is_active de truy van nhanh cac master skill dang hoat dong
CREATE INDEX IF NOT EXISTS idx_skills_type_active
    ON skills (type, is_active);

-- GIN index tren tags_industry de tim kiem nhanh theo nganh nghe
CREATE INDEX IF NOT EXISTS idx_skills_tags_industry
    ON skills USING GIN (tags_industry);

-- GIN index tren tags_department de tim kiem nhanh theo phong ban
CREATE INDEX IF NOT EXISTS idx_skills_tags_department
    ON skills USING GIN (tags_department);

-- Rang buoc chi cho phep duy nhat 1 master skill ton tai
-- Neu da co 1 row voi type = 'master', khong the them row master thu 2
CREATE UNIQUE INDEX IF NOT EXISTS skills_single_master
    ON skills (type) WHERE type = 'master';


-- ------------------------------------------------------------
-- BAT ROW LEVEL SECURITY (RLS) CHO BANG SKILLS
-- ------------------------------------------------------------
-- anon: chi duoc doc (SELECT) cac skill dang hoat dong
-- authenticated: duoc toan quyen CRUD
-- ------------------------------------------------------------

ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

-- Xoa policy cu neu ton tai (de co the chay lai file nay nhieu lan)
DROP POLICY IF EXISTS "anon_select_active_skills" ON skills;
DROP POLICY IF EXISTS "authenticated_select_skills" ON skills;
DROP POLICY IF EXISTS "authenticated_insert_skills" ON skills;
DROP POLICY IF EXISTS "authenticated_update_skills" ON skills;
DROP POLICY IF EXISTS "authenticated_delete_skills" ON skills;

-- Policy cho anon: chi doc duoc cac skill dang active
CREATE POLICY "anon_select_active_skills"
    ON skills
    FOR SELECT
    TO anon
    USING (is_active = true);

-- Policy cho authenticated: doc tat ca skills (ke ca inactive)
CREATE POLICY "authenticated_select_skills"
    ON skills
    FOR SELECT
    TO authenticated
    USING (true);

-- Policy cho authenticated: them skill moi
CREATE POLICY "authenticated_insert_skills"
    ON skills
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Policy cho authenticated: cap nhat skill
CREATE POLICY "authenticated_update_skills"
    ON skills
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Policy cho authenticated: xoa skill
CREATE POLICY "authenticated_delete_skills"
    ON skills
    FOR DELETE
    TO authenticated
    USING (true);


-- ============================================================
-- PHAN 2: BANG RATE_LIMITS — Gioi han tan suat goi API
-- ============================================================
-- Bang nay theo doi so luong request theo IP.
-- Chi service_role moi truy cap duoc (qua serverless function).
-- Bat RLS nhung khong tao policy nao => anon va authenticated
-- khong the truy cap, con service_role tu dong bypass RLS.
-- ============================================================

CREATE TABLE IF NOT EXISTS rate_limits (
    ip TEXT PRIMARY KEY,
    session_count INT DEFAULT 0,
    daily_count INT DEFAULT 0,
    last_reset TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Bat RLS — khong tao policy nao ca
-- Dieu nay dam bao chi service_role (bypass RLS) moi truy cap duoc
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- PHAN 3: CAP NHAT BANG POSTS — Them cot tags neu chua co
-- ============================================================
-- Bang posts da ton tai san. Them cot tags de ho tro
-- tim kiem bai viet theo tag trong tuong lai.
-- ============================================================

ALTER TABLE posts ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';


-- ============================================================
-- HOAN TAT! Migration da chay thanh cong.
-- - Bang skills: da tao voi RLS, index, va rang buoc master duy nhat
-- - Bang rate_limits: da tao voi RLS (chi service_role truy cap)
-- - Bang posts: da them cot tags
-- ============================================================
