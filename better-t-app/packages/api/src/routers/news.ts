import { ORPCError } from "@orpc/server";
import { and, asc, desc, eq, gte, like, lte, SQL } from "drizzle-orm";
import { z } from "zod";

import { db } from "@better-t-app/db";
import { news } from "@better-t-app/db/schema/content";

import { protectedProcedure, publicProcedure } from "../index";

// ── Output schema ─────────────────────────────────────────────────────────────

const NewsOutput = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  content: z.string(),
  excerpt: z.string(),
  newsType: z.enum(["site_update", "personal"]),
  isPublished: z.boolean(),
  publishedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function toNewsOutput(row: typeof news.$inferSelect) {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    content: row.content,
    excerpt: row.excerpt,
    newsType: row.newsType,
    isPublished: row.isPublished,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

async function listNews(
  publishedOnly: boolean,
  filters?: {
    keyword?: string;
    newsType?: "site_update" | "personal";
    dateFrom?: string;
    dateTo?: string;
    sortBy?: "publishedAt" | "createdAt" | "title";
    order?: "asc" | "desc";
  },
) {
  const conditions: SQL[] = [];
  if (publishedOnly) conditions.push(eq(news.isPublished, true));
  if (filters?.keyword) {
    conditions.push(like(news.title, `%${filters.keyword}%`));
  }
  if (filters?.newsType) {
    conditions.push(eq(news.newsType, filters.newsType));
  }
  if (filters?.dateFrom) {
    conditions.push(gte(news.publishedAt, new Date(filters.dateFrom)));
  }
  if (filters?.dateTo) {
    const to = new Date(filters.dateTo);
    to.setHours(23, 59, 59, 999);
    conditions.push(lte(news.publishedAt, to));
  }

  const sortBy = filters?.sortBy ?? "publishedAt";
  const order = filters?.order ?? "desc";
  const sortCol =
    sortBy === "title"
      ? news.title
      : sortBy === "createdAt"
        ? news.createdAt
        : news.publishedAt;
  const orderExpr = order === "asc" ? asc(sortCol) : desc(sortCol);

  const rows = await db
    .select()
    .from(news)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(orderExpr, desc(news.createdAt));

  return rows.map(toNewsOutput);
}

function generateId() {
  return crypto.randomUUID();
}

// ── Input schemas ─────────────────────────────────────────────────────────────

const ListFiltersInput = z.object({
  keyword: z.string().optional(),
  newsType: z.enum(["site_update", "personal"]).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  sortBy: z.enum(["publishedAt", "createdAt", "title"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
});

const NewsCreateInput = z.object({
  title: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "スラッグは小文字英数字とハイフンのみ使用できます"),
  content: z.string(),
  excerpt: z.string().optional(),
  newsType: z.enum(["site_update", "personal"]).optional(),
  isPublished: z.boolean().optional(),
});

const NewsUpdateInput = z.object({
  id: z.string(),
  title: z.string().min(1).optional(),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "スラッグは小文字英数字とハイフンのみ使用できます")
    .optional(),
  content: z.string().optional(),
  excerpt: z.string().optional(),
  newsType: z.enum(["site_update", "personal"]).optional(),
  isPublished: z.boolean().optional(),
});

// ── Router ────────────────────────────────────────────────────────────────────

export const newsRouter = {
  list: publicProcedure
    .input(ListFiltersInput.optional())
    .output(z.array(NewsOutput))
    .handler(async ({ input }) => {
      return listNews(true, input ?? {});
    }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .output(NewsOutput)
    .handler(async ({ input }) => {
      const rows = await db
        .select()
        .from(news)
        .where(and(eq(news.slug, input.slug), eq(news.isPublished, true)))
        .limit(1);

      if (rows.length === 0) {
        throw new ORPCError("NOT_FOUND", { message: "News not found" });
      }
      // biome-ignore lint/style/noNonNullAssertion: length check above guarantees existence
      return toNewsOutput(rows[0]!);
    }),

  adminList: protectedProcedure
    .input(ListFiltersInput.optional())
    .output(z.array(NewsOutput))
    .handler(async ({ input }) => {
      return listNews(false, input ?? {});
    }),

  adminGet: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(NewsOutput)
    .handler(async ({ input }) => {
      const rows = await db
        .select()
        .from(news)
        .where(eq(news.id, input.id))
        .limit(1);
      if (rows.length === 0) {
        throw new ORPCError("NOT_FOUND", { message: "News not found" });
      }
      // biome-ignore lint/style/noNonNullAssertion: length check above guarantees existence
      return toNewsOutput(rows[0]!);
    }),

  create: protectedProcedure
    .input(NewsCreateInput)
    .output(NewsOutput)
    .handler(async ({ input }) => {
      const existing = await db
        .select({ id: news.id })
        .from(news)
        .where(eq(news.slug, input.slug))
        .limit(1);
      if (existing.length > 0) {
        throw new ORPCError("CONFLICT", {
          message: "このスラッグは既に使用されています",
        });
      }

      const id = generateId();
      const isPublished = input.isPublished ?? false;
      await db.insert(news).values({
        id,
        title: input.title,
        slug: input.slug,
        content: input.content,
        excerpt: input.excerpt ?? "",
        newsType: input.newsType ?? "personal",
        isPublished,
        publishedAt: isPublished ? new Date() : null,
      });

      const rows = await db.select().from(news).where(eq(news.id, id)).limit(1);
      if (rows.length === 0) throw new ORPCError("INTERNAL_SERVER_ERROR");
      // biome-ignore lint/style/noNonNullAssertion: length check above guarantees existence
      return toNewsOutput(rows[0]!);
    }),

  update: protectedProcedure
    .input(NewsUpdateInput)
    .output(NewsOutput)
    .handler(async ({ input }) => {
      const existing = await db
        .select()
        .from(news)
        .where(eq(news.id, input.id))
        .limit(1);
      if (existing.length === 0) {
        throw new ORPCError("NOT_FOUND", { message: "News not found" });
      }
      // biome-ignore lint/style/noNonNullAssertion: length check above guarantees existence
      const existingItem = existing[0]!;

      if (input.slug && input.slug !== existingItem.slug) {
        const slugConflict = await db
          .select({ id: news.id })
          .from(news)
          .where(eq(news.slug, input.slug))
          .limit(1);
        if (slugConflict.length > 0) {
          throw new ORPCError("CONFLICT", {
            message: "このスラッグは既に使用されています",
          });
        }
      }

      const wasPublished = existingItem.isPublished;
      const willPublish = input.isPublished ?? wasPublished;
      const publishedAt =
        !wasPublished && willPublish
          ? new Date()
          : wasPublished && !willPublish
            ? null
            : existingItem.publishedAt;

      await db
        .update(news)
        .set({
          ...(input.title !== undefined && { title: input.title }),
          ...(input.slug !== undefined && { slug: input.slug }),
          ...(input.content !== undefined && { content: input.content }),
          ...(input.excerpt !== undefined && { excerpt: input.excerpt }),
          ...(input.newsType !== undefined && { newsType: input.newsType }),
          ...(input.isPublished !== undefined && { isPublished: input.isPublished }),
          publishedAt,
        })
        .where(eq(news.id, input.id));

      const rows = await db
        .select()
        .from(news)
        .where(eq(news.id, input.id))
        .limit(1);
      if (rows.length === 0) throw new ORPCError("INTERNAL_SERVER_ERROR");
      // biome-ignore lint/style/noNonNullAssertion: length check above guarantees existence
      return toNewsOutput(rows[0]!);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(z.object({ success: z.boolean() }))
    .handler(async ({ input }) => {
      const existing = await db
        .select({ id: news.id })
        .from(news)
        .where(eq(news.id, input.id))
        .limit(1);
      if (existing.length === 0) {
        throw new ORPCError("NOT_FOUND", { message: "News not found" });
      }
      await db.delete(news).where(eq(news.id, input.id));
      return { success: true };
    }),
};
