# API 設計書

## 1. 概要

- **通信方式**: oRPC (Typed RPC over HTTP)
- **ベース URL**: `/rpc`
- **OpenAPI ドキュメント**: `/api/openapi.json`
- **認証エンドポイント**: `/api/auth/*`（better-auth が処理）

## 2. 認証 API

better-auth が提供するエンドポイントを使用する。フロントエンドからは `@better-auth/client` 経由で呼び出す。

| メソッド | パス | 概要 |
|----------|------|------|
| POST | `/api/auth/sign-in/email` | メール/パスワードでログイン |
| POST | `/api/auth/sign-out` | ログアウト |
| GET | `/api/auth/get-session` | セッション情報取得 |

## 3. oRPC エンドポイント一覧

### 3.1 アクセス権限の種別

| 種別 | 説明 |
|------|------|
| `public` | 認証不要。誰でもアクセス可能 |
| `protected` | 認証済みユーザーのみアクセス可能（未認証の場合は `UNAUTHORIZED` エラー） |

---

### 3.2 共通

#### `healthCheck`

| 項目 | 内容 |
|------|------|
| 権限 | `public` |
| 概要 | API サーバーの死活確認 |
| 入力 | なし |
| 出力 | `"OK"` |

---

### 3.3 プロフィール (`profile`)

#### `profile.get`

| 項目 | 内容 |
|------|------|
| 権限 | `public` |
| 概要 | サイトオーナーのプロフィール情報を取得する |
| 入力 | なし |
| 出力 | [Profile オブジェクト](#profile-オブジェクト) |

#### `profile.update`

| 項目 | 内容 |
|------|------|
| 権限 | `protected` |
| 概要 | プロフィール情報を更新する |
| 入力 | [ProfileUpdateInput](#profileupdateinput) |
| 出力 | [Profile オブジェクト](#profile-オブジェクト) |

---

### 3.4 作品 (`works`)

#### `works.list`

| 項目 | 内容 |
|------|------|
| 権限 | `public` |
| 概要 | 公開済みの作品一覧を取得する |
| 入力 | なし |
| 出力 | `Work[]`（公開済みのもののみ） |

#### `works.adminList`

| 項目 | 内容 |
|------|------|
| 権限 | `protected` |
| 概要 | 全作品一覧を取得する（非公開を含む） |
| 入力 | なし |
| 出力 | `Work[]` |

#### `works.getById`

| 項目 | 内容 |
|------|------|
| 権限 | `public` |
| 概要 | 指定 ID の作品を取得する |
| 入力 | `{ id: string }` |
| 出力 | [Work オブジェクト](#work-オブジェクト) |
| エラー | 存在しない / 非公開の場合 `NOT_FOUND` |

#### `works.create`

| 項目 | 内容 |
|------|------|
| 権限 | `protected` |
| 概要 | 新しい作品を登録する |
| 入力 | [WorkCreateInput](#workcreateinput) |
| 出力 | [Work オブジェクト](#work-オブジェクト) |

#### `works.update`

| 項目 | 内容 |
|------|------|
| 権限 | `protected` |
| 概要 | 作品情報を更新する |
| 入力 | [WorkUpdateInput](#workupdateinput) |
| 出力 | [Work オブジェクト](#work-オブジェクト) |
| エラー | 存在しない場合 `NOT_FOUND` |

#### `works.delete`

| 項目 | 内容 |
|------|------|
| 権限 | `protected` |
| 概要 | 作品を削除する |
| 入力 | `{ id: string }` |
| 出力 | `{ success: true }` |
| エラー | 存在しない場合 `NOT_FOUND` |

---

### 3.5 タグ (`tags`)

#### `tags.list`

| 項目 | 内容 |
|------|------|
| 権限 | `public` |
| 概要 | タグ一覧を取得する |
| 入力 | なし |
| 出力 | `Tag[]` |

#### `tags.create`

| 項目 | 内容 |
|------|------|
| 権限 | `protected` |
| 概要 | タグを新規作成する |
| 入力 | `{ name: string }` |
| 出力 | [Tag オブジェクト](#tag-オブジェクト) |

#### `tags.delete`

| 項目 | 内容 |
|------|------|
| 権限 | `protected` |
| 概要 | タグを削除する（関連する中間テーブルも削除） |
| 入力 | `{ id: string }` |
| 出力 | `{ success: true }` |

---

## 4. 入出力スキーマ定義

### Profile オブジェクト

```typescript
type Profile = {
  id: string;
  displayName: string;        // 表示名
  bio: string;                // 自己紹介文（Markdown 可）
  avatarUrl: string | null;   // アバター画像 URL
  githubUrl: string | null;   // GitHub プロフィール URL
  twitterUrl: string | null;  // X (Twitter) プロフィール URL
  siteUrl: string | null;     // 個人サイト URL
  updatedAt: string;          // ISO 8601 形式
};
```

### ProfileUpdateInput

```typescript
type ProfileUpdateInput = {
  displayName?: string;
  bio?: string;
  avatarUrl?: string | null;
  githubUrl?: string | null;
  twitterUrl?: string | null;
  siteUrl?: string | null;
};
```

### Work オブジェクト

```typescript
type Work = {
  id: string;
  title: string;              // 作品名
  description: string;        // 説明文（Markdown 可）
  thumbnailUrl: string | null; // サムネイル画像 URL
  siteUrl: string | null;     // 公開サイト URL
  repositoryUrl: string | null; // リポジトリ URL (GitHub 等)
  isPublished: boolean;       // 公開フラグ
  publishedAt: string | null; // 公開日時（ISO 8601）
  createdAt: string;
  updatedAt: string;
  tags: Tag[];                // 関連タグ
};
```

### WorkCreateInput

```typescript
type WorkCreateInput = {
  title: string;              // 必須
  description: string;        // 必須
  thumbnailUrl?: string | null;
  siteUrl?: string | null;
  repositoryUrl?: string | null;
  isPublished?: boolean;      // デフォルト: false
  publishedAt?: string | null;
  tagIds?: string[];          // タグ ID の配列
};
```

### WorkUpdateInput

```typescript
type WorkUpdateInput = {
  id: string;                 // 必須（更新対象の ID）
  title?: string;
  description?: string;
  thumbnailUrl?: string | null;
  siteUrl?: string | null;
  repositoryUrl?: string | null;
  isPublished?: boolean;
  publishedAt?: string | null;
  tagIds?: string[];
};
```

### Tag オブジェクト

```typescript
type Tag = {
  id: string;
  name: string;
};
```

---

## 5. エラーレスポンス

oRPC は標準エラーコードを返す。

| コード | 意味 |
|--------|------|
| `UNAUTHORIZED` | 認証が必要なエンドポイントに未認証でアクセスした |
| `NOT_FOUND` | 指定されたリソースが存在しない |
| `BAD_REQUEST` | 入力バリデーションエラー |
| `INTERNAL_SERVER_ERROR` | サーバー内部エラー |

---

## 6. ルーター構成（実装イメージ）

```
appRouter
├── healthCheck          (publicProcedure)
├── profile
│   ├── get              (publicProcedure)
│   └── update           (protectedProcedure)
├── works
│   ├── list             (publicProcedure)
│   ├── adminList        (protectedProcedure)
│   ├── getById          (publicProcedure)
│   ├── create           (protectedProcedure)
│   ├── update           (protectedProcedure)
│   └── delete           (protectedProcedure)
└── tags
    ├── list             (publicProcedure)
    ├── create           (protectedProcedure)
    └── delete           (protectedProcedure)
```
