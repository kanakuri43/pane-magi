-- staff テーブルに age カラムを追加するマイグレーション
ALTER TABLE staff ADD COLUMN IF NOT EXISTS age integer;
