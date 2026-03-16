-- stores テーブルに住所・電話番号カラム追加
ALTER TABLE stores ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS tel text;

-- staff テーブルに所属店舗カラム追加
ALTER TABLE staff ADD COLUMN IF NOT EXISTS store_id int REFERENCES stores(id) ON DELETE SET NULL;
