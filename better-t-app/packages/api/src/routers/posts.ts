import { ORPCError } from "@orpc/server";
import { and, asc, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@better-t-app/db";
import { post } from "@better-t-app/db/schema/content";

import { protectedProcedure, publicProcedure } from "../index";

// ── Output schema ─────────────────────────────────────────────────────────────

const PostOutput = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  content: z.string(),
  excerpt: z.string(),
  isPublished: z.boolean(),
  publishedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// ── Helper ────────────────────────────────────────────────────────────────────

function toPostOutput(row: typeof post.$inferSelect) {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    content: row.content,
    excerpt: row.excerpt,
    isPublished: row.isPublished,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function generateId() {
  return crypto.randomUUID();
}

// ── Input schemas ─────────────────────────────────────────────────────────────

const PostCreateInput = z.object({
  title: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "スラッグは小文字英数字とハイフンのみ使用できます"),
  content: z.string(),
  excerpt: z.string().optional(),
  isPublished: z.boolean().optional(),
});

const PostUpdateInput = z.object({
  id: z.string(),
  title: z.string().min(1).optional(),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "スラッグは小文字英数字とハイフンのみ使用できます")
    .optional(),
  content: z.string().optional(),
  excerpt: z.string().optional(),
  isPublished: z.boolean().optional(),
});

// ── Router ────────────────────────────────────────────────────────────────────

export const postsRouter = {
  list: publicProcedure
    .output(z.array(PostOutput))
    .handler(async () => {
      const rows = await db
        .select()
        .from(post)
        .where(eq(post.isPublished, true))
        .orderBy(desc(post.publishedAt), desc(post.createdAt));
      return rows.map(toPostOutput);
    }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .output(PostOutput)
    .handler(async ({ input }) => {
      const rows = await db
        .select()
        .from(post)
        .where(and(eq(post.slug, input.slug), eq(post.isPublished, true)))
        .limit(1);
      if (rows.length === 0) {
        throw new ORPCError("NOT_FOUND", { message: "Post not found" });
      }
      return toPostOutput(rows[0]);
    }),

  adminList: protectedProcedure
    .output(z.array(PostOutput))
    .handler(async () => {
      const rows = await db
        .select()
        .from(post)
        .orderBy(desc(post.createdAt));
      return rows.map(toPostOutput);
    }),

  adminGet: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(PostOutput)
    .handler(async ({ input }) => {
      const rows = await db
        .select()
        .from(post)
        .where(eq(post.id, input.id))
        .limit(1);
      if (rows.length === 0) {
        throw new ORPCError("NOT_FOUND", { message: "Post not found" });
      }
      return toPostOutput(rows[0]);
    }),

  create: protectedProcedure
    .input(PostCreateInput)
    .output(PostOutput)
    .handler(async ({ input }) => {
      // slug の重複チェック
      const existing = await db
        .select({ id: post.id })
        .from(post)
        .where(eq(post.slug, input.slug))
        .limit(1);
      if (existing.length > 0) {
        throw new ORPCError("CONFLICT", {
          message: "このスラッグは既に使用されています",
        });
      }

      const id = generateId();
      const isPublished = input.isPublished ?? false;
      await db.insert(post).values({
        id,
        title: input.title,
        slug: input.slug,
        content: input.content,
        excerpt: input.excerpt ?? "",
        isPublished,
        publishedAt: isPublished ? new Date() : null,
      });

      const rows = await db.select().from(post).where(eq(post.id, id)).limit(1);
      if (rows.length === 0) throw new ORPCError("INTERNAL_SERVER_ERROR");
      return toPostOutput(rows[0]);
    }),

  update: protectedProcedure
    .input(PostUpdateInput)
    .output(PostOutput)
    .handler(async ({ input }) => {
      const existing = await db
        .select()
        .from(post)
        .where(eq(post.id, input.id))
        .limit(1);
      if (existing.length === 0) {
        throw new ORPCError("NOT_FOUND", { message: "Post not found" });
      }

      // slug 変更時の重複チェック
      if (input.slug && input.slug !== existing[0].slug) {
        const slugConflict = await db
          .select({ id: post.id })
          .from(post)
          .where(eq(post.slug, input.slug))
          .limit(1);
        if (slugConflict.length > 0) {
          throw new ORPCError("CONFLICT", {
            message: "このスラッグは既に使用されています",
          });
        }
      }

      const wasPublished = existing[0].isPublished;
      const willPublish = input.isPublished ?? wasPublished;
      const publishedAt =
        !wasPublished && willPublish
          ? new Date()
          : (existing[0].publishedAt ?? null);

      await db
        .update(post)
        .set({
          ...(input.title !== undefined && { title: input.title }),
          ...(input.slug !== undefined && { slug: input.slug }),
          ...(input.content !== undefined && { content: input.content }),
          ...(input.excerpt !== undefined && { excerpt: input.excerpt }),
          ...(input.isPublished !== undefined && {
            isPublished: input.isPublished,
            publishedAt,
          }),
        })
        .where(eq(post.id, input.id));

      const rows = await db
        .select()
        .from(post)
        .where(eq(post.id, input.id))
        .limit(1);
      if (rows.length === 0) throw new ORPCError("INTERNAL_SERVER_ERROR");
      return toPostOutput(rows[0]);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .handler(async ({ input }) => {
      const existing = await db
        .select({ id: post.id })
        .from(post)
        .where(eq(post.id, input.id))
        .limit(1);
      if (existing.length === 0) {
        throw new ORPCError("NOT_FOUND", { message: "Post not found" });
      }
      await db.delete(post).where(eq(post.id, input.id));
      return { success: true };
    }),
};
