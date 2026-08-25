import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

// ── Profile ──────────────────────────────────────────────────────────────────

export const profile = sqliteTable("profile", {
  id: text("id").primaryKey(),
  displayName: text("display_name").notNull(),
  bio: text("bio").notNull().default(""),
  avatarUrl: text("avatar_url"),
  githubUrl: text("github_url"),
  twitterUrl: text("twitter_url"),
  siteUrl: text("site_url"),
  // ── サイト設定 ─────────────────────────────────────────────────────────
  logoSubtitle: text("logo_subtitle").notNull().default("やまてろす・ハブ"),
  heroTagline: text("hero_tagline").notNull().default("Portfolio · やまてろす"),
  heroGreeting: text("hero_greeting").notNull().default("Hello_World();"),
  h1Line1: text("h1_line1").notNull().default(""),
  h1Line2: text("h1_line2").notNull().default("のポートフォリオ"),
  h1Line3: text("h1_line3").notNull().default("hub."),
  heroSubText: text("hero_sub_text").notNull().default(""),
  theme: text("theme").notNull().default("sakura-cyber"),
  // ────────────────────────────────────────────────────────────────────────
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => new Date())
    .notNull(),
});

// ── Work ─────────────────────────────────────────────────────────────────────

export const work = sqliteTable(
  "work",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    thumbnailUrl: text("thumbnail_url"),
    siteUrl: text("site_url"),
    repositoryUrl: text("repository_url"),
    isPublished: integer("is_published", { mode: "boolean" })
      .notNull()
      .default(false),
    publishedAt: integer("published_at", { mode: "timestamp_ms" }),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("work_is_published_idx").on(table.isPublished),
    index("work_sort_order_idx").on(table.sortOrder),
  ],
);

// ── Tag ──────────────────────────────────────────────────────────────────────

export const tag = sqliteTable("tag", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
});

// ── WorkTag (junction) ───────────────────────────────────────────────────────

export const workTag = sqliteTable(
  "work_tag",
  {
    workId: text("work_id")
      .notNull()
      .references(() => work.id, { onDelete: "cascade" }),
    tagId: text("tag_id")
      .notNull()
      .references(() => tag.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.workId, table.tagId] })],
);

// ── Post ─────────────────────────────────────────────────────────────────────

export const post = sqliteTable(
  "post",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    content: text("content").notNull().default(""),
    excerpt: text("excerpt").notNull().default(""),
    headerImageUrl: text("header_image_url"),
    isPublished: integer("is_published", { mode: "boolean" })
      .notNull()
      .default(false),
    publishedAt: integer("published_at", { mode: "timestamp_ms" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("post_slug_idx").on(table.slug),
    index("post_is_published_idx").on(table.isPublished),
    index("post_published_at_idx").on(table.publishedAt),
  ],
);

// ── Relations ────────────────────────────────────────────────────────────────

export const workRelations = relations(work, ({ many }) => ({
  workTags: many(workTag),
}));

export const tagRelations = relations(tag, ({ many }) => ({
  workTags: many(workTag),
}));

export const workTagRelations = relations(workTag, ({ one }) => ({
  work: one(work, { fields: [workTag.workId], references: [work.id] }),
  tag: one(tag, { fields: [workTag.tagId], references: [tag.id] }),
}));

// ── Category ──────────────────────────────────────────────────────────────────

export const category = sqliteTable(
  "category",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull().unique(),
    slug: text("slug").notNull().unique(),
    description: text("description").notNull().default(""),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("category_slug_idx").on(table.slug),
  ],
);

// ── PostCategory (junction) ───────────────────────────────────────────────────

export const postCategory = sqliteTable(
  "post_category",
  {
    postId: text("post_id")
      .notNull()
      .references(() => post.id, { onDelete: "cascade" }),
    categoryId: text("category_id")
      .notNull()
      .references(() => category.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.postId, table.categoryId] })],
);

// ── Post / Category Relations ─────────────────────────────────────────────────

export const postRelations = relations(post, ({ many }) => ({
  postCategories: many(postCategory),
}));

export const categoryRelations = relations(category, ({ many }) => ({
  postCategories: many(postCategory),
  podcastCategories: many(podcastCategory),
}));

export const postCategoryRelations = relations(postCategory, ({ one }) => ({
  post: one(post, { fields: [postCategory.postId], references: [post.id] }),
  category: one(category, {
    fields: [postCategory.categoryId],
    references: [category.id],
  }),
}));

// ── Podcast ───────────────────────────────────────────────────────────────────

export const podcast = sqliteTable(
  "podcast",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description").notNull().default(""),
    audioUrl: text("audio_url").notNull(),
    duration: integer("duration"),
    fileSize: integer("file_size"),
    mimeType: text("mime_type"),
    isPublished: integer("is_published", { mode: "boolean" })
      .notNull()
      .default(false),
    publishedAt: integer("published_at", { mode: "timestamp_ms" }),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
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
    podcastId: text("podcast_id")
      .notNull()
      .references(() => podcast.id, { onDelete: "cascade" }),
    categoryId: text("category_id")
      .notNull()
      .references(() => category.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.podcastId, table.categoryId] })],
);

// ── Podcast / Category Relations ──────────────────────────────────────────────

export const podcastRelations = relations(podcast, ({ many }) => ({
  podcastCategories: many(podcastCategory),
}));

export const podcastCategoryRelations = relations(podcastCategory, ({ one }) => ({
  podcast: one(podcast, {
    fields: [podcastCategory.podcastId],
    references: [podcast.id],
  }),
  category: one(category, {
    fields: [podcastCategory.categoryId],
    references: [category.id],
  }),
}));

// ── News ──────────────────────────────────────────────────────────────────────

export const news = sqliteTable(
  "news",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    content: text("content").notNull().default(""),
    excerpt: text("excerpt").notNull().default(""),
    newsType: text("news_type", { enum: ["site_update", "personal"] })
      .notNull()
      .default("personal"),
    isPublished: integer("is_published", { mode: "boolean" })
      .notNull()
      .default(false),
    publishedAt: integer("published_at", { mode: "timestamp_ms" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("news_slug_idx").on(table.slug),
    index("news_is_published_idx").on(table.isPublished),
    index("news_published_at_idx").on(table.publishedAt),
    index("news_type_idx").on(table.newsType),
  ],
);

// ── Analytics ─────────────────────────────────────────────────────────────────

export const pageView = sqliteTable(
  "page_view",
  {
    id: text("id").primaryKey(),
    path: text("path").notNull(),
    referrer: text("referrer"),
    ipHash: text("ip_hash"),
    userAgent: text("user_agent"),
    isAdmin: integer("is_admin", { mode: "boolean" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [
    index("page_view_path_idx").on(table.path),
    index("page_view_created_at_idx").on(table.createdAt),
  ],
);

export const clickEvent = sqliteTable(
  "click_event",
  {
    id: text("id").primaryKey(),
    eventType: text("event_type").notNull(), // 'work_click' | 'post_click'
    targetId: text("target_id").notNull(),
    targetTitle: text("target_title").notNull(),
    isAdmin: integer("is_admin", { mode: "boolean" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [
    index("click_event_type_idx").on(table.eventType),
    index("click_event_target_id_idx").on(table.targetId),
    index("click_event_created_at_idx").on(table.createdAt),
  ],
);
