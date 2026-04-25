import { ORPCError } from "@orpc/server";
import { and, asc, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@better-t-app/db";
import { tag, work, workTag } from "@better-t-app/db/schema/content";

import { protectedProcedure, publicProcedure } from "../index";

// ── Shared output schemas ─────────────────────────────────────────────────────

const TagOutput = z.object({
  id: z.string(),
  name: z.string(),
});

const WorkOutput = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  thumbnailUrl: z.string().nullable(),
  siteUrl: z.string().nullable(),
  repositoryUrl: z.string().nullable(),
  isPublished: z.boolean(),
  publishedAt: z.string().nullable(),
  sortOrder: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  tags: z.array(TagOutput),
});

// ── Helpers ───────────────────────────────────────────────────────────────────

async function getWorkWithTags(id: string) {
  const rows = await db
    .select({
      work: work,
      tag: tag,
    })
    .from(work)
    .leftJoin(workTag, eq(workTag.workId, work.id))
    .leftJoin(tag, eq(tag.id, workTag.tagId))
    .where(eq(work.id, id));

  if (rows.length === 0) return null;

  const workRow = rows[0].work;
  const tags = rows
    .filter((r) => r.tag !== null)
    .map((r) => ({ id: r.tag!.id, name: r.tag!.name }));

  return toWorkOutput(workRow, tags);
}

async function listWorksWithTags(publishedOnly: boolean) {
  const rows = await db
    .select({ work: work, tag: tag })
    .from(work)
    .leftJoin(workTag, eq(workTag.workId, work.id))
    .leftJoin(tag, eq(tag.id, workTag.tagId))
    .where(publishedOnly ? eq(work.isPublished, true) : undefined)
    .orderBy(asc(work.sortOrder), asc(work.createdAt));

  // Group by work id
  const map = new Map<string, { workRow: typeof work.$inferSelect; tags: { id: string; name: string }[] }>();
  for (const row of rows) {
    if (!map.has(row.work.id)) {
      map.set(row.work.id, { workRow: row.work, tags: [] });
    }
    if (row.tag) {
      map.get(row.work.id)!.tags.push({ id: row.tag.id, name: row.tag.name });
    }
  }
  return Array.from(map.values()).map(({ workRow, tags }) =>
    toWorkOutput(workRow, tags),
  );
}

function toWorkOutput(
  row: typeof work.$inferSelect,
  tags: { id: string; name: string }[],
) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    thumbnailUrl: row.thumbnailUrl ?? null,
    siteUrl: row.siteUrl ?? null,
    repositoryUrl: row.repositoryUrl ?? null,
    isPublished: row.isPublished,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    tags,
  };
}

function generateId() {
  return crypto.randomUUID();
}

// ── Input schemas ─────────────────────────────────────────────────────────────

const WorkCreateInput = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  thumbnailUrl: z.string().url().nullable().optional(),
  siteUrl: z.string().url().nullable().optional(),
  repositoryUrl: z.string().url().nullable().optional(),
  isPublished: z.boolean().optional(),
  publishedAt: z.string().datetime().nullable().optional(),
  sortOrder: z.number().int().optional(),
  tagIds: z.array(z.string()).optional(),
});

const WorkUpdateInput = z.object({
  id: z.string(),
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  thumbnailUrl: z.string().url().nullable().optional(),
  siteUrl: z.string().url().nullable().optional(),
  repositoryUrl: z.string().url().nullable().optional(),
  isPublished: z.boolean().optional(),
  publishedAt: z.string().datetime().nullable().optional(),
  sortOrder: z.number().int().optional(),
  tagIds: z.array(z.string()).optional(),
});

// ── Router ────────────────────────────────────────────────────────────────────

export const worksRouter = {
  list: publicProcedure
    .output(z.array(WorkOutput))
    .handler(async () => listWorksWithTags(true)),

  adminList: protectedProcedure
    .output(z.array(WorkOutput))
    .handler(async () => listWorksWithTags(false)),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .output(WorkOutput)
    .handler(async ({ input }) => {
      const result = await getWorkWithTags(input.id);
      if (!result || !result.isPublished) {
        throw new ORPCError("NOT_FOUND", { message: "Work not found" });
      }
      return result;
    }),

  create: protectedProcedure
    .input(WorkCreateInput)
    .output(WorkOutput)
    .handler(async ({ input }) => {
      const id = generateId();
      await db.insert(work).values({
        id,
        title: input.title,
        description: input.description,
        thumbnailUrl: input.thumbnailUrl ?? null,
        siteUrl: input.siteUrl ?? null,
        repositoryUrl: input.repositoryUrl ?? null,
        isPublished: input.isPublished ?? false,
        publishedAt: input.publishedAt ? new Date(input.publishedAt) : null,
        sortOrder: input.sortOrder ?? 0,
      });

      if (input.tagIds && input.tagIds.length > 0) {
        await db.insert(workTag).values(
          input.tagIds.map((tagId) => ({ workId: id, tagId })),
        );
      }

      const result = await getWorkWithTags(id);
      if (!result) throw new ORPCError("INTERNAL_SERVER_ERROR");
      return result;
    }),

  update: protectedProcedure
    .input(WorkUpdateInput)
    .output(WorkOutput)
    .handler(async ({ input }) => {
      const existing = await db
        .select()
        .from(work)
        .where(eq(work.id, input.id))
        .limit(1);
      if (existing.length === 0) {
        throw new ORPCError("NOT_FOUND", { message: "Work not found" });
      }

      await db
        .update(work)
        .set({
          ...(input.title !== undefined && { title: input.title }),
          ...(input.description !== undefined && {
            description: input.description,
          }),
          ...(input.thumbnailUrl !== undefined && {
            thumbnailUrl: input.thumbnailUrl,
          }),
          ...(input.siteUrl !== undefined && { siteUrl: input.siteUrl }),
          ...(input.repositoryUrl !== undefined && {
            repositoryUrl: input.repositoryUrl,
          }),
          ...(input.isPublished !== undefined && {
            isPublished: input.isPublished,
          }),
          ...(input.publishedAt !== undefined && {
            publishedAt: input.publishedAt
              ? new Date(input.publishedAt)
              : null,
          }),
          ...(input.sortOrder !== undefined && { sortOrder: input.sortOrder }),
          updatedAt: new Date(),
        })
        .where(eq(work.id, input.id));

      if (input.tagIds !== undefined) {
        await db.delete(workTag).where(eq(workTag.workId, input.id));
        if (input.tagIds.length > 0) {
          await db.insert(workTag).values(
            input.tagIds.map((tagId) => ({ workId: input.id, tagId })),
          );
        }
      }

      const result = await getWorkWithTags(input.id);
      if (!result) throw new ORPCError("INTERNAL_SERVER_ERROR");
      return result;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(z.object({ success: z.literal(true) }))
    .handler(async ({ input }) => {
      const existing = await db
        .select()
        .from(work)
        .where(eq(work.id, input.id))
        .limit(1);
      if (existing.length === 0) {
        throw new ORPCError("NOT_FOUND", { message: "Work not found" });
      }
      await db.delete(work).where(eq(work.id, input.id));
      return { success: true as const };
    }),
};
