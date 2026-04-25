import { ORPCError } from "@orpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@better-t-app/db";
import { profile } from "@better-t-app/db/schema/content";

import { protectedProcedure, publicProcedure } from "../index";

const ProfileOutput = z.object({
  id: z.string(),
  displayName: z.string(),
  bio: z.string(),
  avatarUrl: z.string().nullable(),
  githubUrl: z.string().nullable(),
  twitterUrl: z.string().nullable(),
  siteUrl: z.string().nullable(),
  updatedAt: z.string(),
});

const ProfileUpdateInput = z.object({
  displayName: z.string().min(1).max(50).optional(),
  bio: z.string().optional(),
  avatarUrl: z.string().url().nullable().optional(),
  githubUrl: z.string().url().nullable().optional(),
  twitterUrl: z.string().url().nullable().optional(),
  siteUrl: z.string().url().nullable().optional(),
});

function toOutput(row: typeof profile.$inferSelect) {
  return {
    id: row.id,
    displayName: row.displayName,
    bio: row.bio,
    avatarUrl: row.avatarUrl ?? null,
    githubUrl: row.githubUrl ?? null,
    twitterUrl: row.twitterUrl ?? null,
    siteUrl: row.siteUrl ?? null,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export const profileRouter = {
  get: publicProcedure.output(ProfileOutput).handler(async () => {
    const rows = await db.select().from(profile).limit(1);
    if (rows.length === 0) {
      throw new ORPCError("NOT_FOUND", { message: "Profile not found" });
    }
    return toOutput(rows[0]);
  }),

  update: protectedProcedure
    .input(ProfileUpdateInput)
    .output(ProfileOutput)
    .handler(async ({ input }) => {
      const rows = await db.select().from(profile).limit(1);
      if (rows.length === 0) {
        throw new ORPCError("NOT_FOUND", { message: "Profile not found" });
      }
      const current = rows[0];
      const updated = await db
        .update(profile)
        .set({
          ...(input.displayName !== undefined && {
            displayName: input.displayName,
          }),
          ...(input.bio !== undefined && { bio: input.bio }),
          ...(input.avatarUrl !== undefined && { avatarUrl: input.avatarUrl }),
          ...(input.githubUrl !== undefined && { githubUrl: input.githubUrl }),
          ...(input.twitterUrl !== undefined && {
            twitterUrl: input.twitterUrl,
          }),
          ...(input.siteUrl !== undefined && { siteUrl: input.siteUrl }),
          updatedAt: new Date(),
        })
        .where(eq(profile.id, current.id))
        .returning();
      return toOutput(updated[0]);
    }),
};
