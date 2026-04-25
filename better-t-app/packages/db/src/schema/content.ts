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
