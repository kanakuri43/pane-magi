# pane-magi 開発・公開計画

## 構成方針

| 要素 | 選択 |
|------|------|
| フロント | バニラJS（現状継続）|
| DB | Supabase (PostgreSQL) |
| 写真ストレージ | Supabase Storage |
| ホスティング | Netlify（無料）|
| 認証 | 管理側のみ Supabase Auth（メール/パスワード） |

## アプリ構成

- **客用アプリ**（認証なし）: 店舗選択 → 日付選択 → 出勤スタッフ一覧
- **管理者用アプリ**（Supabase Auth認証あり）: 出勤登録 + スタッフプロフィール管理

---

## TODO

### Phase 1: Supabase セットアップ ✅ 完了
- [x] Supabaseプロジェクト作成（pane-magi-db）
- [x] DBスキーマ設計・SQLファイル作成 → `supabase/schema.sql`
  - `stores`（店舗）
  - `staff`（スタッフ）
  - `attendance`（出勤記録：日付×スタッフ）
- [x] シードデータSQLファイル作成 → `supabase/seed.sql`
- [x] 環境変数テンプレート作成 → `.env.example`
- [x] Supabase SQL EditorでSchema適用
- [x] Supabase SQL EditorでSeed適用
- [x] Supabase Storage バケット作成（名前: `panels`、公開設定: Public）
- [x] Row Level Security (RLS) ポリシー設定 → `supabase/schema.sql` に含む
- [x] Authentication > Users で管理者アカウント作成
- [x] スタッフ写真をStorageにアップロード（英語ファイル名で登録）
- [x] img_url をDBに反映 → `supabase/update_img_urls.sql`

### Phase 2: 管理者アプリ実装 ✅ 完了
- [x] Supabase Auth ログインオーバーレイ（メール/パスワード）
- [x] 出勤登録（日付・店舗ごとにスタッフ選択・Supabase保存）
- [x] スタッフ管理（登録・編集・写真アップロード）

### Phase 3: 客用アプリ実装 ✅ 完了
- [x] 店舗選択 UI（Supabaseから動的ロード）
- [x] 日付選択 UI
- [x] 出勤スタッフ一覧（写真付き）表示
- [x] Supabaseからデータ取得に切り替え

### Phase 4: デプロイ
- [ ] Netlifyアカウント作成・プロジェクト設定
- [ ] 環境変数設定（Supabase URL・APIキー）
- [ ] 本番デプロイ・動作確認

---

## 備考

- 管理者アプリURLは非公開運用（Supabase Authで認証済みのみ操作可）
- スタッフ100名・店舗10店規模はSupabase無料枠で十分
- 写真ストレージ無料枠: 1GB（100名分で余裕あり）
- Storageファイル名は英語（日本語ファイル名はSupabaseで無効エラーになる）
- `config.js` は `.gitignore` 済み（Supabase URLとAnon Keyを含む）
