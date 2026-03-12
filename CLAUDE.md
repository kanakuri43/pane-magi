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

# currentDate
Today's date is 2026-03-12.
