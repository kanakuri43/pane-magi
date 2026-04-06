# CLAUDE.md

出勤管理WEBアプリ。店頭での使用を想定。
詳細仕様は `design_document.md` を参照。

## インフラ構成

| レイヤー | 技術選定 |
|----------|---------|
| フロントエンド | バニラHTML / CSS / JavaScript |
| スタイリング | Bootstrap 5.3 |
| DB | Supabase (PostgreSQL) |
| ストレージ | Supabase Storage（スタッフ写真） |
| ホスティング | Netlify |
| 認証 | 管理者側のみ簡易パスワード認証 |

## ファイル構成

Netlify の公開ディレクトリは `public/`。

| ファイル | 用途 |
|----------|------|
| `public/index.html` | 客用画面（スタッフ出勤一覧・タグフィルター） |
| `public/admin.html` | 管理者用画面（出勤登録・スタッフ選択） |
| `public/shared.js` | 共通ユーティリティ（Supabaseクライアント・日付ヘルパー） |
| `public/config.js` | Supabase接続情報（gitignore済み・Netlifyビルドで生成） |
| `public/css/index.css` | 客用画面スタイル |
| `public/css/admin.css` | 管理者画面スタイル |
| `public/js/index.js` | 客用画面スクリプト |
| `public/js/admin.js` | 管理者画面スクリプト |
| `public/panels/` | スタッフ写真（初期データ用） |
| `supabase/` | DBスキーマ・マイグレーションSQL |

# currentDate
Today's date is 2026-03-12.
