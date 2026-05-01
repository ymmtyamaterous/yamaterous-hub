# ポッドキャスト配信機能 Web アプリ実装計画

> 対象: Yamaterous Hub (Web) - better-t-app  
> 作成日: 2026-05-01

---

## 概要

管理者が音声ファイルをアップロードしてポッドキャストエピソードを管理・公開する機能を実装する。  
既存の記事(Post)機能のアーキテクチャをベースに、音声ファイル特有の処理を追加する。

---

## 変更ファイル一覧

```
better-t-app/
├── packages/
│   ├── db/src/schema/content.ts          # podcast / podcastCategory テーブル追加
│   ├── db/src/migrations/               # 0007_podcasts.sql (新規)
│   ├── db/src/index.ts                  # podcast エクスポート追加
│   └── api/src/routers/
│       ├── podcasts.ts                  # 新規: ポッドキャスト CRUD ルーター
│       └── index.ts                     # podcasts ルーター登録
└── apps/
    ├── server/src/index.ts              # /api/upload/audio エンドポイント追加
    └── web/src/
        ├── routeTree.gen.ts             # (自動生成)
        ├── routes/
        │   ├── podcast/
        │   │   └── index.tsx            # 新規: 公開ポッドキャスト一覧
        │   └── admin/
        │       └── podcasts/
        │           ├── index.tsx        # 新規: 管理画面 エピソード一覧
        │           ├── new.tsx          # 新規: 新規エピソード作成
        │           └── $episodeId/
        │               └── edit.tsx     # 新規: エピソード編集
        └── components/
            └── podcast-form.tsx         # 新規: エピソード作成・編集フォーム
```

---

## タスク詳細

### TASK-01: DB スキーマ追加 (`packages/db`)

**ファイル**: `packages/db/src/schema/content.ts`

`podcast` テーブルと `podcast_category` 中間テーブルを追加する。  
カテゴリは既存の `category` テーブルを共用する。

```typescript
// ── Podcast ───────────────────────────────────────────────────────────────────
export const podcast = sqliteTable(
  "podcast",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description").notNull().default(""),
    audioUrl: text("audio_url").notNull(),
    duration: integer("duration"),           // 再生時間 (秒)
    fileSize: integer("file_size"),          // ファイルサイズ (bytes)
    mimeType: text("mime_type"),             // audio/mp4 等
    isPublished: integer("is_published", { mode: "boolean" }).notNull().default(false),
    publishedAt: integer("published_at", { mode: "timestamp_ms" }),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date()).notNull(),
  },
  (table) => [
    index("podcast_slug_idx").on(table.slug),
    index("podcast_is_published_idx").on(table.isPublished),
    index("podcast_published_at_idx").on(table.publishedAt),
  ],
);

// ── PodcastCategory (junction) ────────────────────────────────────────────────
export const podcastCategory = sqliteTable(
  "podcast_category",
  {
    podcastId: text("podcast_id").notNull().references(() => podcast.id, { onDelete: "cascade" }),
    categoryId: text("category_id").notNull().references(() => category.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.podcastId, table.categoryId] })],
);

// Relations
export const podcastRelations = relations(podcast, ({ many }) => ({
  podcastCategories: many(podcastCategory),
}));
export const podcastCategoryRelations = relations(podcastCategory, ({ one }) => ({
  podcast: one(podcast, { fields: [podcastCategory.podcastId], references: [podcast.id] }),
  category: one(category, { fields: [podcastCategory.categoryId], references: [category.id] }),
}));
```

---

### TASK-02: マイグレーションファイル作成

**ファイル**: `packages/db/src/migrations/0007_podcasts.sql`

```sql
CREATE TABLE `podcast` (
  `id` text PRIMARY KEY NOT NULL,
  `title` text NOT NULL,
  `slug` text NOT NULL,
  `description` text DEFAULT '' NOT NULL,
  `audio_url` text NOT NULL,
  `duration` integer,
  `file_size` integer,
  `mime_type` text,
  `is_published` integer DEFAULT false NOT NULL,
  `published_at` integer,
  `sort_order` integer DEFAULT 0 NOT NULL,
  `created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
  `updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `podcast_slug_unique` ON `podcast` (`slug`);
--> statement-breakpoint
CREATE INDEX `podcast_slug_idx` ON `podcast` (`slug`);
--> statement-breakpoint
CREATE INDEX `podcast_is_published_idx` ON `podcast` (`is_published`);
--> statement-breakpoint
CREATE INDEX `podcast_published_at_idx` ON `podcast` (`published_at`);
--> statement-breakpoint
CREATE TABLE `podcast_category` (
  `podcast_id` text NOT NULL,
  `category_id` text NOT NULL,
  PRIMARY KEY(`podcast_id`, `category_id`),
  FOREIGN KEY (`podcast_id`) REFERENCES `podcast`(`id`) ON DELETE cascade,
  FOREIGN KEY (`category_id`) REFERENCES `category`(`id`) ON DELETE cascade
);
```

---

### TASK-03: API ルーター追加 (`packages/api`)

**ファイル**: `packages/api/src/routers/podcasts.ts` (新規作成)

Post ルーター (`posts.ts`) と同じパターンで実装する。

**エクスポートする procedure 一覧**

| procedure | 認証 | 説明 |
|-----------|------|------|
| `podcasts.list` | 不要 | 公開済みエピソード一覧 (フィルタ・ソート対応) |
| `podcasts.getBySlug` | 不要 | slug でエピソード取得 |
| `podcasts.adminList` | 必要 | 全エピソード一覧 (非公開含む) |
| `podcasts.getById` | 必要 | id でエピソード取得 (管理用) |
| `podcasts.create` | 必要 | エピソード作成 |
| `podcasts.update` | 必要 | エピソード更新 |
| `podcasts.delete` | 必要 | エピソード削除 |

**Input/Output スキーマ概要**

```typescript
// 作成・更新の共通入力フィールド
{
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  audioUrl: z.string().min(1),           // /api/upload/audio の戻り値
  duration: z.number().int().optional(),
  isPublished: z.boolean().optional(),
  categoryIds: z.array(z.string()).optional(),
}

// 出力スキーマ
{
  id, title, slug, description,
  audioUrl, duration, fileSize, mimeType,
  isPublished, publishedAt,
  createdAt, updatedAt,
  categories: [{ id, name, slug }],
}
```

**`index.ts` への追加**

```typescript
import { podcastsRouter } from "./podcasts";

export const appRouter = {
  // ... 既存 ...
  podcasts: podcastsRouter,
};
```

---

### TASK-04: 音声アップロードエンドポイント追加 (`apps/server`)

**ファイル**: `apps/server/src/index.ts`

既存の画像アップロード (`/api/upload`) と同じパターンで音声専用エンドポイントを追加する。

```typescript
const ALLOWED_AUDIO_MIME_TYPES = new Set([
  "audio/mpeg",      // .mp3
  "audio/mp4",       // .m4a
  "audio/x-m4a",    // .m4a (一部クライアント)
]);
const MAX_AUDIO_SIZE = 500 * 1024 * 1024; // 500MB

app.post("/api/upload/audio", async (c) => {
  // 認証チェック
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) return c.json({ error: "Unauthorized" }, 401);

  const formData = await c.req.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) return c.json({ error: "No file provided" }, 400);

  if (!ALLOWED_AUDIO_MIME_TYPES.has(file.type))
    return c.json({ error: "Invalid file type" }, 400);
  if (file.size > MAX_AUDIO_SIZE)
    return c.json({ error: "File too large (max 500MB)" }, 400);

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "m4a";
  const safeName = `${Date.now()}-${randomBytes(8).toString("hex")}.${ext}`;

  // 音声ファイル用サブディレクトリ
  const audioDir = join(uploadsDir, "audio");
  await mkdir(audioDir, { recursive: true });
  await Bun.write(join(audioDir, safeName), await file.arrayBuffer());

  return c.json({
    url: `/uploads/audio/${safeName}`,
    duration: null,   // クライアント側で計測した値を使用
    fileSize: file.size,
    mimeType: file.type,
  });
});
```

---

### TASK-05: 管理画面 - エピソード一覧 (`apps/web`)

**ファイル**: `apps/web/src/routes/admin/podcasts/index.tsx`

Post の管理一覧 (`/admin/posts/index.tsx`) と同じ構造で実装する。

**表示項目**
- タイトル
- カテゴリ (チップ表示)
- 再生時間
- 公開状態バッジ
- 公開日時
- 編集・削除ボタン

---

### TASK-06: 管理画面 - 新規エピソード作成 (`apps/web`)

**ファイル**: `apps/web/src/routes/admin/podcasts/new.tsx`

**入力フォーム項目**

| フィールド | 種別 | 備考 |
|-----------|------|------|
| タイトル | テキスト入力 | 必須 |
| スラッグ | テキスト入力 | タイトルから自動生成・手動編集可 |
| 説明 | テキストエリア | 任意 |
| 音声ファイル | ファイル選択 + アップロードボタン | `.mp3` / `.m4a` のみ |
| アップロード進捗 | プログレスバー | ファイル選択後に表示 |
| カテゴリ | チェックボックス複数選択 | 記事フォームと同じ UI |
| 公開する | チェックボックス | デフォルト OFF |

**ファイルアップロード処理フロー**

```
1. ファイル選択 → ブラウザ側で MIME タイプ確認
2. "アップロード" ボタン押下 → POST /api/upload/audio (FormData)
3. 進捗表示 (XMLHttpRequest の progress イベント使用)
4. 成功 → audioUrl を state にセット、フォームの audioUrl フィールドに反映
5. フォーム送信 → orpc.podcasts.create.mutate(...)
```

---

### TASK-07: 管理画面 - エピソード編集 (`apps/web`)

**ファイル**: `apps/web/src/routes/admin/podcasts/$episodeId/edit.tsx`

新規作成フォームと同じコンポーネント `PodcastForm` を `mode="edit"` で再利用する。  
既存の audioUrl は表示のみ。新しいファイルを再アップロードして差し替えることも可能とする。

---

### TASK-08: 公開ページ - ポッドキャスト一覧 (`apps/web`)

**ファイル**: `apps/web/src/routes/podcast/index.tsx`

**表示項目**
- エピソードタイトル
- カテゴリバッジ
- 再生時間
- 公開日
- HTML5 `<audio>` タグによるインラインプレーヤー
- 説明文

**データ取得**

```typescript
const { data } = useQuery(orpc.podcasts.list.queryOptions({
  sortBy: "publishedAt",
  order: "desc",
}));
```

---

### TASK-09: ナビゲーション追加 (`apps/web`)

**変更ファイル**: `apps/web/src/components/header.tsx`

- 公開ヘッダーに "Podcast" リンクを追加

**変更ファイル**: `apps/web/src/routes/admin/index.tsx`

- 管理ダッシュボードの StatCard にポッドキャスト公開数を追加
- 管理メニューに "Podcasts" リンクを追加

---

## 実装順序

```
TASK-01 (DB スキーマ)
  ↓
TASK-02 (マイグレーション)
  ↓
TASK-03 (API ルーター)
  ↓
TASK-04 (音声アップロードエンドポイント)
  ↓
TASK-05〜07 (管理画面)
  ↓
TASK-08 (公開ページ)
  ↓
TASK-09 (ナビゲーション)
```

---

## テスト方針

- `packages/api/src/__tests__/routers.test.ts` に podcast ルーターのユニットテストを追加
  - `podcasts.create`: 正常系 / スラッグ重複エラー / 未認証エラー
  - `podcasts.list`: 公開済みのみ返ること
  - `podcasts.delete`: 存在しない ID でのエラー

---

## 注意事項

- 音声ファイルのアップロードは既存の画像アップロード (`/api/upload`) とは**別エンドポイント** (`/api/upload/audio`) とする
- カテゴリは既存の `category` テーブルを流用するため、新規テーブルは作成しない
- `duration` フィールドはクライアント(Androidアプリ または ブラウザ)から送信された値をそのまま保存する (`HTMLMediaElement.duration` で取得)
- ファイルサイズ上限 500 MB はサーバー設定 (`hono` のボディサイズ制限) も合わせて変更が必要
