import { ORPCError } from "@orpc/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@better-t-app/db";
import { work, workReleaseNote } from "@better-t-app/db/schema/content";

import { protectedProcedure, publicProcedure } from "../index";

const semverPattern = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;
const VersionInput = z.string().regex(semverPattern, "バージョンは 1.0.0 形式で入力してください");

const ReleaseNoteOutput = z.object({
  id: z.string(),
  workId: z.string(),
  version: z.string(),
  title: z.string(),
  content: z.string(),
  isPublished: z.boolean(),
  publishedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

function toReleaseNoteOutput(row: typeof workReleaseNote.$inferSelect) {
  return {
    id: row.id,
    workId: row.workId,
    version: row.version,
    title: row.title,
    content: row.content,
    isPublished: row.isPublished,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function compareVersions(left: string, right: string) {
  const parse = (version: string) => {
    const [core, prerelease] = version.split("-", 2);
    const parts = core!.split(".").map(Number);
    return { parts, prerelease: prerelease ?? null };
  };
  const a = parse(left);
  const b = parse(right);

  for (let index = 0; index < 3; index += 1) {
    const difference = a.parts[index]! - b.parts[index]!;
    if (difference !== 0) return difference;
  }
  if (a.prerelease === b.prerelease) return 0;
  if (a.prerelease === null) return 1;
  if (b.prerelease === null) return -1;
  return a.prerelease.localeCompare(b.prerelease, undefined, { numeric: true });
}

async function ensureWorkExists(workId: string) {
  const result = await db.select({ id: work.id }).from(work).where(eq(work.id, workId)).limit(1);
  if (result.length === 0) {
    throw new ORPCError("NOT_FOUND", { message: "Work not found" });
  }
}

async function listReleaseNotes(workId: string, publishedOnly: boolean) {
  const conditions = [eq(workReleaseNote.workId, workId)];
  if (publishedOnly) conditions.push(eq(workReleaseNote.isPublished, true));

  const rows = await db
    .select()
    .from(workReleaseNote)
    .where(and(...conditions))
    .orderBy(desc(workReleaseNote.createdAt));

  return rows
    .sort((a, b) => compareVersions(b.version, a.version))
    .map(toReleaseNoteOutput);
}

export const releaseNotesRouter = {
  list: publicProcedure
    .input(z.object({ workId: z.string() }))
    .output(z.array(ReleaseNoteOutput))
    .handler(async ({ input }) => listReleaseNotes(input.workId, true)),

  adminList: protectedProcedure
    .input(z.object({ workId: z.string() }))
    .output(z.array(ReleaseNoteOutput))
    .handler(async ({ input }) => {
      await ensureWorkExists(input.workId);
      return listReleaseNotes(input.workId, false);
    }),

  create: protectedProcedure
    .input(z.object({
      workId: z.string(),
      version: VersionInput,
      title: z.string().max(200).optional(),
      content: z.string().min(1),
      isPublished: z.boolean().optional(),
      publishedAt: z.string().datetime().nullable().optional(),
    }))
    .output(ReleaseNoteOutput)
    .handler(async ({ input }) => {
      await ensureWorkExists(input.workId);
      const id = crypto.randomUUID();
      const duplicate = await db
        .select({ id: workReleaseNote.id })
        .from(workReleaseNote)
        .where(
          and(
            eq(workReleaseNote.workId, input.workId),
            eq(workReleaseNote.version, input.version),
          ),
        )
        .limit(1);
      if (duplicate[0]) {
        throw new ORPCError("CONFLICT", { message: "このバージョンはすでに登録されています" });
      }

      try {
        await db.insert(workReleaseNote).values({
          id,
          workId: input.workId,
          version: input.version,
          title: input.title ?? "",
          content: input.content,
          isPublished: input.isPublished ?? false,
          publishedAt: input.publishedAt
            ? new Date(input.publishedAt)
            : input.isPublished
              ? new Date()
              : null,
        });
      } catch (error) {
        if (error instanceof Error && /unique|constraint/i.test(error.message)) {
          throw new ORPCError("CONFLICT", { message: "このバージョンはすでに登録されています" });
        }
        throw error;
      }

      const created = await db.select().from(workReleaseNote).where(eq(workReleaseNote.id, id)).limit(1);
      if (!created[0]) throw new ORPCError("INTERNAL_SERVER_ERROR");
      return toReleaseNoteOutput(created[0]);
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      version: VersionInput.optional(),
      title: z.string().max(200).optional(),
      content: z.string().min(1).optional(),
      isPublished: z.boolean().optional(),
      publishedAt: z.string().datetime().nullable().optional(),
    }))
    .output(ReleaseNoteOutput)
    .handler(async ({ input }) => {
      const existing = await db.select().from(workReleaseNote).where(eq(workReleaseNote.id, input.id)).limit(1);
      if (!existing[0]) throw new ORPCError("NOT_FOUND", { message: "Release note not found" });

      if (input.version !== undefined && input.version !== existing[0].version) {
        const duplicate = await db
          .select({ id: workReleaseNote.id })
          .from(workReleaseNote)
          .where(
            and(
              eq(workReleaseNote.workId, existing[0].workId),
              eq(workReleaseNote.version, input.version),
            ),
          )
          .limit(1);
        if (duplicate[0]) {
          throw new ORPCError("CONFLICT", { message: "このバージョンはすでに登録されています" });
        }
      }

      try {
        const shouldSetPublishedAt =
          input.isPublished === true &&
          input.publishedAt === undefined &&
          existing[0].publishedAt === null;
        await db
          .update(workReleaseNote)
          .set({
            ...(input.version !== undefined && { version: input.version }),
            ...(input.title !== undefined && { title: input.title }),
            ...(input.content !== undefined && { content: input.content }),
            ...(input.isPublished !== undefined && { isPublished: input.isPublished }),
            ...(input.publishedAt !== undefined && {
              publishedAt: input.publishedAt ? new Date(input.publishedAt) : null,
            }),
            ...(shouldSetPublishedAt && { publishedAt: new Date() }),
            updatedAt: new Date(),
          })
          .where(eq(workReleaseNote.id, input.id));
      } catch (error) {
        if (error instanceof Error && /unique|constraint/i.test(error.message)) {
          throw new ORPCError("CONFLICT", { message: "このバージョンはすでに登録されています" });
        }
        throw error;
      }

      const updated = await db.select().from(workReleaseNote).where(eq(workReleaseNote.id, input.id)).limit(1);
      if (!updated[0]) throw new ORPCError("INTERNAL_SERVER_ERROR");
      return toReleaseNoteOutput(updated[0]);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(z.object({ success: z.literal(true) }))
    .handler(async ({ input }) => {
      const result = await db.delete(workReleaseNote).where(eq(workReleaseNote.id, input.id)).returning({ id: workReleaseNote.id });
      if (result.length === 0) {
        throw new ORPCError("NOT_FOUND", { message: "Release note not found" });
      }
      return { success: true as const };
    }),
};
