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

| ファイル | 用途 |
|----------|------|
| `index.html` | 客用画面（スタッフ出勤一覧・タグフィルター） |
| `admin.html` | 管理者用画面（出勤登録・スタッフ選択） |
| `shared.js` | 共通データ・ユーティリティ（スタッフ情報・スケジュール・日付ヘルパー） |
| `panels/` | スタッフ写真 |

# currentDate
Today's date is 2026-03-12.
