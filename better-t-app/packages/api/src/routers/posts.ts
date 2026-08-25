import { ORPCError } from "@orpc/server";
import { and, asc, desc, eq, gte, inArray, like, lte, SQL } from "drizzle-orm";
import { z } from "zod";

import { db } from "@better-t-app/db";
import {
  category,
  post,
  postCategory,
} from "@better-t-app/db/schema/content";

import { protectedProcedure, publicProcedure } from "../index";

// ── Output schemas ────────────────────────────────────────────────────────────

const CategoryRef = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
});

const PostOutput = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  content: z.string(),
  excerpt: z.string(),
  headerImageUrl: z.string().nullable(),
  isPublished: z.boolean(),
  publishedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  categories: z.array(CategoryRef),
});

// ── Helpers ───────────────────────────────────────────────────────────────────

async function getPostWithCategories(id: string) {
  const rows = await db
    .select({ post, category })
    .from(post)
    .leftJoin(postCategory, eq(postCategory.postId, post.id))
    .leftJoin(category, eq(category.id, postCategory.categoryId))
    .where(eq(post.id, id));

  if (rows.length === 0) return null;

  const postRow = rows[0].post;
  const categories = rows
    .filter((r) => r.category !== null)
    .map((r) => ({
      id: r.category!.id,
      name: r.category!.name,
      slug: r.category!.slug,
    }));

  return toPostOutput(postRow, categories);
}

async function listPostsWithCategories(
  publishedOnly: boolean,
  filters?: {
    keyword?: string;
    categoryId?: string;
    dateFrom?: string;
    dateTo?: string;
    sortBy?: "publishedAt" | "createdAt" | "title";
    order?: "asc" | "desc";
  },
) {
  const conditions: SQL[] = [];
  if (publishedOnly) conditions.push(eq(post.isPublished, true));
  if (filters?.keyword) {
    conditions.push(like(post.title, `%${filters.keyword}%`));
  }
  if (filters?.dateFrom) {
    conditions.push(gte(post.publishedAt, new Date(filters.dateFrom)));
  }
  if (filters?.dateTo) {
    const to = new Date(filters.dateTo);
    to.setHours(23, 59, 59, 999);
    conditions.push(lte(post.publishedAt, to));
  }

  // カテゴリ絞り込み
  if (filters?.categoryId) {
    const pcRows = await db
      .select({ postId: postCategory.postId })
      .from(postCategory)
      .where(eq(postCategory.categoryId, filters.categoryId));
    const targetIds = pcRows.map((r) => r.postId);
    if (targetIds.length === 0) return [];
    conditions.push(inArray(post.id, targetIds));
  }

  const sortBy = filters?.sortBy ?? "publishedAt";
  const order = filters?.order ?? "desc";
  const sortCol =
    sortBy === "title"
      ? post.title
      : sortBy === "createdAt"
        ? post.createdAt
        : post.publishedAt;
  const orderExpr = order === "asc" ? asc(sortCol) : desc(sortCol);

  const rows = await db
    .select({ post, category })
    .from(post)
    .leftJoin(postCategory, eq(postCategory.postId, post.id))
    .leftJoin(category, eq(category.id, postCategory.categoryId))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(orderExpr, desc(post.createdAt));

  // post.id でグループ化
  const map = new Map<
    string,
    {
      postRow: typeof post.$inferSelect;
      cats: { id: string; name: string; slug: string }[];
    }
  >();
  for (const row of rows) {
    if (!map.has(row.post.id)) {
      map.set(row.post.id, { postRow: row.post, cats: [] });
    }
    if (row.category) {
      map.get(row.post.id)!.cats.push({
        id: row.category.id,
        name: row.category.name,
        slug: row.category.slug,
      });
    }
  }
  return Array.from(map.values()).map(({ postRow, cats }) =>
    toPostOutput(postRow, cats),
  );
}

function toPostOutput(
  row: typeof post.$inferSelect,
  categories: { id: string; name: string; slug: string }[],
) {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    content: row.content,
    excerpt: row.excerpt,
    headerImageUrl: row.headerImageUrl,
    isPublished: row.isPublished,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    categories,
  };
}

function generateId() {
  return crypto.randomUUID();
}

// ── Input schemas ─────────────────────────────────────────────────────────────

const ListFiltersInput = z.object({
  keyword: z.string().optional(),
  categoryId: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  sortBy: z.enum(["publishedAt", "createdAt", "title"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
});

const PostCreateInput = z.object({
  title: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "スラッグは小文字英数字とハイフンのみ使用できます"),
  content: z.string(),
  excerpt: z.string().optional(),
  headerImageUrl: z.string().url().nullable().optional(),
  isPublished: z.boolean().optional(),
  categoryIds: z.array(z.string()).optional(),
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
  headerImageUrl: z.string().url().nullable().optional(),
  isPublished: z.boolean().optional(),
  categoryIds: z.array(z.string()).optional(),
});

// ── Router ────────────────────────────────────────────────────────────────────

export const postsRouter = {
  list: publicProcedure
    .input(ListFiltersInput.optional())
    .output(z.array(PostOutput))
    .handler(async ({ input }) => {
      return listPostsWithCategories(true, input ?? {});
    }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .output(PostOutput)
    .handler(async ({ input }) => {
      const rows = await db
        .select({ post, category })
        .from(post)
        .leftJoin(postCategory, eq(postCategory.postId, post.id))
        .leftJoin(category, eq(category.id, postCategory.categoryId))
        .where(and(eq(post.slug, input.slug), eq(post.isPublished, true)));

      if (rows.length === 0) {
        throw new ORPCError("NOT_FOUND", { message: "Post not found" });
      }

      const postRow = rows[0].post;
      const categories = rows
        .filter((r) => r.category !== null)
        .map((r) => ({
          id: r.category!.id,
          name: r.category!.name,
          slug: r.category!.slug,
        }));
      return toPostOutput(postRow, categories);
    }),

  adminList: protectedProcedure
    .input(ListFiltersInput.optional())
    .output(z.array(PostOutput))
    .handler(async ({ input }) => {
      return listPostsWithCategories(false, input ?? {});
    }),

  adminGet: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(PostOutput)
    .handler(async ({ input }) => {
      const result = await getPostWithCategories(input.id);
      if (!result) {
        throw new ORPCError("NOT_FOUND", { message: "Post not found" });
      }
      return result;
    }),

  create: protectedProcedure
    .input(PostCreateInput)
    .output(PostOutput)
    .handler(async ({ input }) => {
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
        headerImageUrl: input.headerImageUrl ?? null,
        isPublished,
        publishedAt: isPublished ? new Date() : null,
      });

      if (input.categoryIds && input.categoryIds.length > 0) {
        await db.insert(postCategory).values(
          input.categoryIds.map((categoryId) => ({ postId: id, categoryId })),
        );
      }

      const result = await getPostWithCategories(id);
      if (!result) throw new ORPCError("INTERNAL_SERVER_ERROR");
      return result;
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
          ...(input.headerImageUrl !== undefined && {
            headerImageUrl: input.headerImageUrl,
          }),
          ...(input.isPublished !== undefined && {
            isPublished: input.isPublished,
            publishedAt,
          }),
        })
        .where(eq(post.id, input.id));

      // categoryIds が渡された場合は差し替え
      if (input.categoryIds !== undefined) {
        await db
          .delete(postCategory)
          .where(eq(postCategory.postId, input.id));
        if (input.categoryIds.length > 0) {
          await db.insert(postCategory).values(
            input.categoryIds.map((categoryId) => ({
              postId: input.id,
              categoryId,
            })),
          );
        }
      }

      const result = await getPostWithCategories(input.id);
      if (!result) throw new ORPCError("INTERNAL_SERVER_ERROR");
      return result;
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
