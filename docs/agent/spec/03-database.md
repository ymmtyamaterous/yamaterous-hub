# データベース設計書

## 1. 概要

- **DBMS**: SQLite
- **ORM**: Drizzle ORM
- **マイグレーション**: `drizzle-kit` によるマイグレーションファイルを自動生成
- **DB ファイルパス**: 環境変数 `DATABASE_URL` で指定（例: `./local.db`）
- **サーバー起動時**: マイグレーションとシード投入を自動実行

---

## 2. テーブル一覧

| テーブル名 | 概要 |
|------------|------|
| `user` | ユーザー情報（better-auth 管理） |
| `session` | セッション情報（better-auth 管理） |
| `account` | 認証プロバイダー情報（better-auth 管理） |
| `verification` | メール確認用トークン（better-auth 管理） |
| `profile` | サイトオーナーのプロフィール情報 |
| `work` | 作品情報 |
| `tag` | タグ情報 |
| `work_tag` | 作品とタグの中間テーブル |

---

## 3. ER 図

```
┌──────────┐        ┌──────────────┐
│  user    │        │   profile    │
│──────────│        │──────────────│
│ id (PK)  │        │ id (PK)      │
│ name     │        │ displayName  │
│ email    │        │ bio          │
│ ...      │        │ avatarUrl    │
└──────────┘        │ githubUrl    │
     │              │ twitterUrl   │
     │1             │ siteUrl      │
     │              │ updatedAt    │
  ┌──────────┐      └──────────────┘
  │ session  │
  │──────────│
  │ id (PK)  │      ┌──────────┐       ┌──────────────┐
  │ userId   ├──────┤  work    │       │   work_tag   │
  │ token    │      │──────────│       │──────────────│
  │ ...      │      │ id (PK)  ├───────┤ workId (FK)  │
  └──────────┘      │ title    │       │ tagId (FK)   │
                    │ desc     │       └──────┬───────┘
  ┌──────────┐      │ thumbUrl │              │
  │ account  │      │ siteUrl  │       ┌──────┴───────┐
  │──────────│      │ repoUrl  │       │    tag       │
  │ id (PK)  │      │ published│       │──────────────│
  │ userId   │      │ ...      │       │ id (PK)      │
  │ provider │      └──────────┘       │ name         │
  │ ...      │                         └──────────────┘
  └──────────┘
```

---

## 4. テーブル定義

### 4.1 `user`（better-auth 管理）

| カラム名 | 型 | 制約 | 概要 |
|----------|----|------|------|
| `id` | TEXT | PK | ユーザー ID |
| `name` | TEXT | NOT NULL | 表示名 |
| `email` | TEXT | NOT NULL, UNIQUE | メールアドレス |
| `email_verified` | INTEGER (boolean) | NOT NULL, DEFAULT false | メール確認フラグ |
| `image` | TEXT | NULL | アバター画像 URL |
| `created_at` | INTEGER (timestamp_ms) | NOT NULL | 作成日時 |
| `updated_at` | INTEGER (timestamp_ms) | NOT NULL | 更新日時 |

### 4.2 `session`（better-auth 管理）

| カラム名 | 型 | 制約 | 概要 |
|----------|----|------|------|
| `id` | TEXT | PK | セッション ID |
| `expires_at` | INTEGER (timestamp_ms) | NOT NULL | 有効期限 |
| `token` | TEXT | NOT NULL, UNIQUE | セッショントークン |
| `created_at` | INTEGER (timestamp_ms) | NOT NULL | 作成日時 |
| `updated_at` | INTEGER (timestamp_ms) | NOT NULL | 更新日時 |
| `ip_address` | TEXT | NULL | クライアント IP |
| `user_agent` | TEXT | NULL | User-Agent |
| `user_id` | TEXT | NOT NULL, FK → user.id (CASCADE) | ユーザー ID |

**インデックス**: `session_userId_idx` ON (`user_id`)

### 4.3 `account`（better-auth 管理）

| カラム名 | 型 | 制約 | 概要 |
|----------|----|------|------|
| `id` | TEXT | PK | アカウント ID |
| `account_id` | TEXT | NOT NULL | プロバイダー側のアカウント ID |
| `provider_id` | TEXT | NOT NULL | プロバイダー名（例: `credential`） |
| `user_id` | TEXT | NOT NULL, FK → user.id (CASCADE) | ユーザー ID |
| `access_token` | TEXT | NULL | アクセストークン |
| `refresh_token` | TEXT | NULL | リフレッシュトークン |
| `id_token` | TEXT | NULL | ID トークン |
| `access_token_expires_at` | INTEGER (timestamp_ms) | NULL | アクセストークン有効期限 |
| `refresh_token_expires_at` | INTEGER (timestamp_ms) | NULL | リフレッシュトークン有効期限 |
| `scope` | TEXT | NULL | スコープ |
| `password` | TEXT | NULL | ハッシュ化パスワード（credential 認証時） |
| `created_at` | INTEGER (timestamp_ms) | NOT NULL | 作成日時 |
| `updated_at` | INTEGER (timestamp_ms) | NOT NULL | 更新日時 |

**インデックス**: `account_userId_idx` ON (`user_id`)

### 4.4 `verification`（better-auth 管理）

| カラム名 | 型 | 制約 | 概要 |
|----------|----|------|------|
| `id` | TEXT | PK | 検証 ID |
| `identifier` | TEXT | NOT NULL | 識別子（メールアドレス等） |
| `value` | TEXT | NOT NULL | トークン値 |
| `expires_at` | INTEGER (timestamp_ms) | NOT NULL | 有効期限 |
| `created_at` | INTEGER (timestamp_ms) | NOT NULL | 作成日時 |
| `updated_at` | INTEGER (timestamp_ms) | NOT NULL | 更新日時 |

---

### 4.5 `profile`

サイトオーナーのプロフィール情報。レコードは常に 1 件（シードで初期レコードを挿入）。

| カラム名 | 型 | 制約 | 概要 |
|----------|----|------|------|
| `id` | TEXT | PK | プロフィール ID |
| `display_name` | TEXT | NOT NULL | 表示名 |
| `bio` | TEXT | NOT NULL, DEFAULT '' | 自己紹介文（Markdown 可） |
| `avatar_url` | TEXT | NULL | アバター画像 URL |
| `github_url` | TEXT | NULL | GitHub プロフィール URL |
| `twitter_url` | TEXT | NULL | X (Twitter) プロフィール URL |
| `site_url` | TEXT | NULL | 個人サイト URL |
| `created_at` | INTEGER (timestamp_ms) | NOT NULL | 作成日時 |
| `updated_at` | INTEGER (timestamp_ms) | NOT NULL | 更新日時 |

---

### 4.6 `work`

自作サイト・Webアプリの作品情報。

| カラム名 | 型 | 制約 | 概要 |
|----------|----|------|------|
| `id` | TEXT | PK | 作品 ID |
| `title` | TEXT | NOT NULL | 作品名 |
| `description` | TEXT | NOT NULL | 説明文（Markdown 可） |
| `thumbnail_url` | TEXT | NULL | サムネイル画像 URL |
| `site_url` | TEXT | NULL | 公開サイト URL |
| `repository_url` | TEXT | NULL | リポジトリ URL |
| `is_published` | INTEGER (boolean) | NOT NULL, DEFAULT false | 公開フラグ |
| `published_at` | INTEGER (timestamp_ms) | NULL | 公開日時 |
| `sort_order` | INTEGER | NOT NULL, DEFAULT 0 | 表示順（小さいほど上位） |
| `created_at` | INTEGER (timestamp_ms) | NOT NULL | 作成日時 |
| `updated_at` | INTEGER (timestamp_ms) | NOT NULL | 更新日時 |

**インデックス**:
- `work_is_published_idx` ON (`is_published`)
- `work_sort_order_idx` ON (`sort_order`)

---

### 4.7 `tag`

作品に付けるタグ情報。

| カラム名 | 型 | 制約 | 概要 |
|----------|----|------|------|
| `id` | TEXT | PK | タグ ID |
| `name` | TEXT | NOT NULL, UNIQUE | タグ名（例: `React`, `TypeScript`） |
| `created_at` | INTEGER (timestamp_ms) | NOT NULL | 作成日時 |

---

### 4.8 `work_tag`

作品とタグの多対多関係を管理する中間テーブル。

| カラム名 | 型 | 制約 | 概要 |
|----------|----|------|------|
| `work_id` | TEXT | NOT NULL, FK → work.id (CASCADE) | 作品 ID |
| `tag_id` | TEXT | NOT NULL, FK → tag.id (CASCADE) | タグ ID |

**複合主キー**: (`work_id`, `tag_id`)

---

## 5. シードデータ

サーバー起動時に以下の初期データを投入する。

### `profile` テーブル初期レコード

```typescript
{
  id: "default",
  displayName: "Yamaterous",
  bio: "",
  avatarUrl: null,
  githubUrl: null,
  twitterUrl: null,
  siteUrl: null,
}
```

※ レコードが既に存在する場合はスキップする（`INSERT OR IGNORE`）。

---

## 6. マイグレーション方針

- マイグレーションファイルは `packages/db/migrations/` に Drizzle Kit が自動生成
- `drizzle.config.ts` でスキーマファイルパスとマイグレーション出力先を設定
- 本番・開発ともにサーバー起動時に `migrate()` を自動実行する
