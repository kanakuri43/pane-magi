-- ============================================================
-- panels バケット Storage RLS ポリシー
-- Supabase SQL Editorで実行してください
-- ============================================================

-- 全員に読み取り許可（客用ページで写真表示）
CREATE POLICY "public_read_panels"
ON storage.objects FOR SELECT
USING (bucket_id = 'panels');

-- 認証済みユーザー（管理者）のみアップロード・上書き・削除許可
CREATE POLICY "auth_insert_panels"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'panels');

CREATE POLICY "auth_update_panels"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'panels');

CREATE POLICY "auth_delete_panels"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'panels');
