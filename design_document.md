# pane-magi 設計書

## 概要

店頭での使用を想定した出勤管理WEBアプリ。
スタッフの出勤状況を客に提示する **客用ページ**（`index.html`）と、管理者が出勤登録を行う **管理者用ページ**（`admin.html`）の2ファイル構成。

---

## システム規模

| 項目 | 規模 |
|------|------|
| 店舗数 | 10店舗程度 |
| スタッフ数 | 100名程度 |

---

## ファイル構成

| ファイル | 用途 |
|----------|------|
| `index.html` | 客用画面（スタッフ出勤一覧・タグフィルター） |
| `admin.html` | 管理者用画面（ログイン・出勤登録） |
| `shared.js` | Supabaseクライアント・共通ユーティリティ（日付ヘルパー・Toast） |
| `config.js` | Supabase URL・Anon Key（gitignore済み） |
| `panels/` | スタッフ写真（ローカル用・英語ファイル名） |
| `supabase/` | SQLファイル群（schema・seed・img_url更新） |

---

## 画面構成

### 共通（両ページ共通）
- アプリタイトル
- 店舗セレクト（Supabaseから動的ロード）
- 日付セレクト（前後矢印ナビ・カレンダーピッカー）

### 客用ページ（`index.html`）
- タグフィルター（複数選択・AND条件）
- スタッフカードグリッド（写真・名前・スペック・タグ）
- 写真クリックで外部プロフィールURLへ遷移（別タブ）
- 管理者ページへのリンク（ヘッダー隅）

### 管理者ページ（`admin.html`）
- ログインオーバーレイ（Supabase Auth メール/パスワード）
- スタッフ一覧（行形式・選択トグル）
- 「更新」ボタン（attendanceテーブルをdelete→insertで更新）
- 客用ページへ戻るリンク

---

## データモデル

### stores
| カラム | 型 | 説明 |
|--------|----|------|
| id | serial | PK |
| name | text | 店舗名 |

### staff
| カラム | 型 | 説明 |
|--------|----|------|
| id | serial | PK |
| name | text | 氏名 |
| img_url | text | Supabase Storage URL（英語ファイル名） |
| profile_url | text | 外部プロフィールページURL |
| height | int | 身長 (cm) |
| bust | int | バスト (cm) |
| waist | int | ウエスト (cm) |
| hip | int | ヒップ (cm) |
| tags | text[] | 趣味・特技タグ |

### attendance
| カラム | 型 | 説明 |
|--------|----|------|
| id | serial | PK |
| store_id | int | FK → stores |
| staff_id | int | FK → staff |
| date | date | 出勤日 |
| ※ | UNIQUE | (store_id, staff_id, date) |

---

## 認証

- Supabase Auth（メール/パスワード）
- `admin.html` ロード時にセッション確認 → 未ログインならオーバーレイ表示
- RLS: SELECT は全員許可、INSERT/UPDATE/DELETE は `authenticated` のみ

---

## 主要ロジック

### タグフィルター
- 出勤中スタッフのタグを集約して表示
- 複数選択可（Set管理）
- AND条件：選択したタグをすべて持つスタッフのみ表示
- 店舗・日付変更時にリセット

### 出勤データ保存
- 「更新」ボタン押下時：対象 store_id × date の attendance を全DELETE → 選択IDをINSERT

---

## 今後の実装予定

- [ ] スタッフ管理 CRUD（admin.htmlに追加）
- [ ] 写真アップロード機能（Supabase Storage連携）
- [ ] Netlifyへのデプロイ
