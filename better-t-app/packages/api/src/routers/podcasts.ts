import { ORPCError } from "@orpc/server";
import { and, asc, desc, eq, gte, inArray, like, lte, SQL } from "drizzle-orm";
import { z } from "zod";

import { db } from "@better-t-app/db";
import {
  category,
  podcast,
  podcastCategory,
} from "@better-t-app/db/schema/content";

import { protectedProcedure, publicProcedure } from "../index";

// ── Output schemas ────────────────────────────────────────────────────────────

const CategoryRef = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
});

const PodcastOutput = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  description: z.string(),
  audioUrl: z.string(),
  duration: z.number().nullable(),
  fileSize: z.number().nullable(),
  mimeType: z.string().nullable(),
  isPublished: z.boolean(),
  publishedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  categories: z.array(CategoryRef),
});

// ── Helpers ───────────────────────────────────────────────────────────────────

async function getPodcastWithCategories(id: string) {
  const rows = await db
    .select({ podcast, category })
    .from(podcast)
    .leftJoin(podcastCategory, eq(podcastCategory.podcastId, podcast.id))
    .leftJoin(category, eq(category.id, podcastCategory.categoryId))
    .where(eq(podcast.id, id));

  if (rows.length === 0) return null;

  const podcastRow = rows[0].podcast;
  const categories = rows
    .filter((r) => r.category !== null)
    .map((r) => ({
      id: r.category!.id,
      name: r.category!.name,
      slug: r.category!.slug,
    }));

  return toPodcastOutput(podcastRow, categories);
}

async function listPodcastsWithCategories(
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
  if (publishedOnly) conditions.push(eq(podcast.isPublished, true));
  if (filters?.keyword) {
    conditions.push(like(podcast.title, `%${filters.keyword}%`));
  }
  if (filters?.dateFrom) {
    conditions.push(gte(podcast.publishedAt, new Date(filters.dateFrom)));
  }
  if (filters?.dateTo) {
    const to = new Date(filters.dateTo);
    to.setHours(23, 59, 59, 999);
    conditions.push(lte(podcast.publishedAt, to));
  }

  if (filters?.categoryId) {
    const pcRows = await db
      .select({ podcastId: podcastCategory.podcastId })
      .from(podcastCategory)
      .where(eq(podcastCategory.categoryId, filters.categoryId));
    const targetIds = pcRows.map((r) => r.podcastId);
    if (targetIds.length === 0) return [];
    conditions.push(inArray(podcast.id, targetIds));
  }

  const sortBy = filters?.sortBy ?? "publishedAt";
  const order = filters?.order ?? "desc";
  const sortCol =
    sortBy === "title"
      ? podcast.title
      : sortBy === "createdAt"
        ? podcast.createdAt
        : podcast.publishedAt;
  const orderExpr = order === "asc" ? asc(sortCol) : desc(sortCol);

  const rows = await db
    .select({ podcast, category })
    .from(podcast)
    .leftJoin(podcastCategory, eq(podcastCategory.podcastId, podcast.id))
    .leftJoin(category, eq(category.id, podcastCategory.categoryId))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(orderExpr, desc(podcast.createdAt));

  const map = new Map<
    string,
    {
      podcastRow: typeof podcast.$inferSelect;
      cats: { id: string; name: string; slug: string }[];
    }
  >();
  for (const row of rows) {
    if (!map.has(row.podcast.id)) {
      map.set(row.podcast.id, { podcastRow: row.podcast, cats: [] });
    }
    if (row.category) {
      map.get(row.podcast.id)!.cats.push({
        id: row.category.id,
        name: row.category.name,
        slug: row.category.slug,
      });
    }
  }
  return Array.from(map.values()).map(({ podcastRow, cats }) =>
    toPodcastOutput(podcastRow, cats),
  );
}

function toPodcastOutput(
  row: typeof podcast.$inferSelect,
  categories: { id: string; name: string; slug: string }[],
) {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    audioUrl: row.audioUrl,
    duration: row.duration ?? null,
    fileSize: row.fileSize ?? null,
    mimeType: row.mimeType ?? null,
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

const PodcastCreateInput = z.object({
  title: z.string().min(1).max(200),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, "スラッグは小文字英数字とハイフンのみ使用できます"),
  description: z.string().optional(),
  audioUrl: z.string().min(1),
  duration: z.number().int().nonnegative().optional(),
  fileSize: z.number().int().nonnegative().optional(),
  mimeType: z.string().optional(),
  isPublished: z.boolean().optional(),
  categoryIds: z.array(z.string()).optional(),
});

const PodcastUpdateInput = z.object({
  id: z.string(),
  title: z.string().min(1).max(200).optional(),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, "スラッグは小文字英数字とハイフンのみ使用できます")
    .optional(),
  description: z.string().optional(),
  audioUrl: z.string().min(1).optional(),
  duration: z.number().int().nonnegative().optional(),
  fileSize: z.number().int().nonnegative().optional(),
  mimeType: z.string().optional(),
  isPublished: z.boolean().optional(),
  categoryIds: z.array(z.string()).optional(),
});

// ── Router ────────────────────────────────────────────────────────────────────

export const podcastsRouter = {
  list: publicProcedure
    .input(ListFiltersInput.optional())
    .output(z.array(PodcastOutput))
    .handler(async ({ input }) => {
      return listPodcastsWithCategories(true, input ?? {});
    }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .output(PodcastOutput)
    .handler(async ({ input }) => {
      const rows = await db
        .select({ podcast, category })
        .from(podcast)
        .leftJoin(podcastCategory, eq(podcastCategory.podcastId, podcast.id))
        .leftJoin(category, eq(category.id, podcastCategory.categoryId))
        .where(and(eq(podcast.slug, input.slug), eq(podcast.isPublished, true)));

      if (rows.length === 0) {
        throw new ORPCError("NOT_FOUND", { message: "Podcast not found" });
      }

      const podcastRow = rows[0].podcast;
      const categories = rows
        .filter((r) => r.category !== null)
        .map((r) => ({
          id: r.category!.id,
          name: r.category!.name,
          slug: r.category!.slug,
        }));
      return toPodcastOutput(podcastRow, categories);
    }),

  adminList: protectedProcedure
    .input(ListFiltersInput.optional())
    .output(z.array(PodcastOutput))
    .handler(async ({ input }) => {
      return listPodcastsWithCategories(false, input ?? {});
    }),

  adminGet: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(PodcastOutput)
    .handler(async ({ input }) => {
      const result = await getPodcastWithCategories(input.id);
      if (!result) {
        throw new ORPCError("NOT_FOUND", { message: "Podcast not found" });
      }
      return result;
    }),

  create: protectedProcedure
    .input(PodcastCreateInput)
    .output(PodcastOutput)
    .handler(async ({ input }) => {
      const existing = await db
        .select({ id: podcast.id })
        .from(podcast)
        .where(eq(podcast.slug, input.slug))
        .limit(1);
      if (existing.length > 0) {
        throw new ORPCError("CONFLICT", {
          message: "このスラッグは既に使用されています",
        });
      }

      const id = generateId();
      const isPublished = input.isPublished ?? false;
      await db.insert(podcast).values({
        id,
        title: input.title,
        slug: input.slug,
        description: input.description ?? "",
        audioUrl: input.audioUrl,
        duration: input.duration ?? null,
        fileSize: input.fileSize ?? null,
        mimeType: input.mimeType ?? null,
        isPublished,
        publishedAt: isPublished ? new Date() : null,
      });

      if (input.categoryIds && input.categoryIds.length > 0) {
        await db.insert(podcastCategory).values(
          input.categoryIds.map((categoryId) => ({ podcastId: id, categoryId })),
        );
      }

      const result = await getPodcastWithCategories(id);
      if (!result) throw new ORPCError("INTERNAL_SERVER_ERROR");
      return result;
    }),

  update: protectedProcedure
    .input(PodcastUpdateInput)
    .output(PodcastOutput)
    .handler(async ({ input }) => {
      const existing = await db
        .select()
        .from(podcast)
        .where(eq(podcast.id, input.id))
        .limit(1);
      if (existing.length === 0) {
        throw new ORPCError("NOT_FOUND", { message: "Podcast not found" });
      }

      if (input.slug && input.slug !== existing[0].slug) {
        const slugConflict = await db
          .select({ id: podcast.id })
          .from(podcast)
          .where(eq(podcast.slug, input.slug))
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
        .update(podcast)
        .set({
          ...(input.title !== undefined && { title: input.title }),
          ...(input.slug !== undefined && { slug: input.slug }),
          ...(input.description !== undefined && {
            description: input.description,
          }),
          ...(input.audioUrl !== undefined && { audioUrl: input.audioUrl }),
          ...(input.duration !== undefined && { duration: input.duration }),
          ...(input.fileSize !== undefined && { fileSize: input.fileSize }),
          ...(input.mimeType !== undefined && { mimeType: input.mimeType }),
          ...(input.isPublished !== undefined && {
            isPublished: input.isPublished,
            publishedAt,
          }),
        })
        .where(eq(podcast.id, input.id));

      if (input.categoryIds !== undefined) {
        await db
          .delete(podcastCategory)
          .where(eq(podcastCategory.podcastId, input.id));
        if (input.categoryIds.length > 0) {
          await db.insert(podcastCategory).values(
            input.categoryIds.map((categoryId) => ({
              podcastId: input.id,
              categoryId,
            })),
          );
        }
      }

      const result = await getPodcastWithCategories(input.id);
      if (!result) throw new ORPCError("INTERNAL_SERVER_ERROR");
      return result;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .handler(async ({ input }) => {
      const existing = await db
        .select({ id: podcast.id })
        .from(podcast)
        .where(eq(podcast.id, input.id))
        .limit(1);
      if (existing.length === 0) {
        throw new ORPCError("NOT_FOUND", { message: "Podcast not found" });
      }
      await db.delete(podcast).where(eq(podcast.id, input.id));
      return { success: true };
    }),
};
