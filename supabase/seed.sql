-- ============================================================
-- pane-magi シードデータ
-- schema.sql 実行後に適用してください
-- ============================================================

-- ── 店舗 ─────────────────────────────────────────────────
INSERT INTO stores (id, name) VALUES
  (1, '店舗A'),
  (2, '店舗B'),
  (3, '店舗C')
ON CONFLICT (id) DO NOTHING;

-- シーケンスをリセット
SELECT setval('stores_id_seq', (SELECT MAX(id) FROM stores));

-- ── スタッフ ──────────────────────────────────────────────
-- ※ img_url は写真をStorageにアップロード後に更新してください
INSERT INTO staff (id, name, img_url, profile_url, height, bust, waist, hip, tags) VALUES
  (1, '田中花子',  NULL, 'https://www.pokepara.jp/_hokkaido/m801/a1801/shop4072/gal/409983/', 158, 85, 58, 86, ARRAY['読書','カフェ巡り','映画','キャンプ','ショッピング']),
  (2, '佐藤あかり',NULL, 'https://www.jfa.jp/national_team/staff/MORIYASU_Hajime.html',        163, 82, 55, 83, ARRAY['ヨガ','ネイル','ドライブ','映画','ショッピング']),
  (3, '渡辺咲良',  NULL, 'https://www.jfa.jp/national_team/staff/MORIYASU_Hajime.html',        155, 88, 60, 88, ARRAY['料理','K-POP','ショッピング','旅行']),
  (4, '板倉芽衣',  NULL, 'https://www.japan-baseball.jp/jp/profile/201901003.html',             167, 80, 56, 82, ARRAY['筋トレ','アニメ','キャンプ','旅行','ショッピング']),
  (5, '小林由奈',  NULL, 'https://www.pokepara.jp/_hokkaido/m801/a1801/shop4072/gal/409983/', 160, 84, 57, 85, ARRAY['旅行','写真','カラオケ','読書'])
ON CONFLICT (id) DO NOTHING;

SELECT setval('staff_id_seq', (SELECT MAX(id) FROM staff));
