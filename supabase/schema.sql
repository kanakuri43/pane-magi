-- ============================================================
-- pane-magi スキーマ定義
-- Supabase SQL Editorで実行してください
-- ============================================================

-- ── テーブル作成 ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS stores (
  id   serial PRIMARY KEY,
  name text   NOT NULL
);

CREATE TABLE IF NOT EXISTS staff (
  id          serial  PRIMARY KEY,
  name        text    NOT NULL,
  img_url     text,
  profile_url text,
  height      integer,
  bust        integer,
  waist       integer,
  hip         integer,
  tags        text[]  DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS attendance (
  id       serial  PRIMARY KEY,
  store_id integer NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  staff_id integer NOT NULL REFERENCES staff(id)  ON DELETE CASCADE,
  date     date    NOT NULL,
  UNIQUE (store_id, staff_id, date)
);

-- ── Row Level Security ────────────────────────────────────

ALTER TABLE stores     ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff      ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- 全員に読み取り許可（客用ページ）
CREATE POLICY "public_read_stores"     ON stores     FOR SELECT USING (true);
CREATE POLICY "public_read_staff"      ON staff      FOR SELECT USING (true);
CREATE POLICY "public_read_attendance" ON attendance FOR SELECT USING (true);

-- 認証済みユーザー（管理者）のみ書き込み許可
CREATE POLICY "auth_insert_stores"     ON stores     FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "auth_update_stores"     ON stores     FOR UPDATE USING     (auth.role() = 'authenticated');
CREATE POLICY "auth_delete_stores"     ON stores     FOR DELETE USING     (auth.role() = 'authenticated');

CREATE POLICY "auth_insert_staff"      ON staff      FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "auth_update_staff"      ON staff      FOR UPDATE USING     (auth.role() = 'authenticated');
CREATE POLICY "auth_delete_staff"      ON staff      FOR DELETE USING     (auth.role() = 'authenticated');

CREATE POLICY "auth_insert_attendance" ON attendance FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "auth_update_attendance" ON attendance FOR UPDATE USING     (auth.role() = 'authenticated');
CREATE POLICY "auth_delete_attendance" ON attendance FOR DELETE USING     (auth.role() = 'authenticated');

-- ── Storageバケット ──────────────────────────────────────
-- Supabase Dashboard > Storage から手動で作成してください:
--   バケット名: panels
--   公開設定: Public
