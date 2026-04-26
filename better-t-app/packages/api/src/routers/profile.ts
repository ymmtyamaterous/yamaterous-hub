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
  // サイト設定
  logoSubtitle: z.string(),
  heroTagline: z.string(),
  heroGreeting: z.string(),
  h1Line1: z.string(),
  h1Line2: z.string(),
  h1Line3: z.string(),
  heroSubText: z.string(),
  theme: z.enum(["sakura-cyber", "sea-cyber", "autumn-cyber"]),
});

const ProfileUpdateInput = z.object({
  displayName: z.string().min(1).max(50).optional(),
  bio: z.string().optional(),
  avatarUrl: z.string().url().nullable().optional(),
  githubUrl: z.string().url().nullable().optional(),
  twitterUrl: z.string().url().nullable().optional(),
  siteUrl: z.string().url().nullable().optional(),
  // サイト設定
  logoSubtitle: z.string().max(60).optional(),
  heroTagline: z.string().max(100).optional(),
  heroGreeting: z.string().max(100).optional(),
  h1Line1: z.string().max(60).optional(),
  h1Line2: z.string().max(60).optional(),
  h1Line3: z.string().max(60).optional(),
  heroSubText: z.string().max(300).optional(),
  theme: z.enum(["sakura-cyber", "sea-cyber", "autumn-cyber"]).optional(),
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
    // サイト設定
    logoSubtitle: row.logoSubtitle,
    heroTagline: row.heroTagline,
    heroGreeting: row.heroGreeting,
    h1Line1: row.h1Line1,
    h1Line2: row.h1Line2,
    h1Line3: row.h1Line3,
    heroSubText: row.heroSubText,
    theme: (["sakura-cyber", "sea-cyber", "autumn-cyber"].includes(row.theme) ? row.theme : "sakura-cyber") as "sakura-cyber" | "sea-cyber" | "autumn-cyber",
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
          ...(input.displayName !== undefined && { displayName: input.displayName }),
          ...(input.bio !== undefined && { bio: input.bio }),
          ...(input.avatarUrl !== undefined && { avatarUrl: input.avatarUrl }),
          ...(input.githubUrl !== undefined && { githubUrl: input.githubUrl }),
          ...(input.twitterUrl !== undefined && { twitterUrl: input.twitterUrl }),
          ...(input.siteUrl !== undefined && { siteUrl: input.siteUrl }),
          // サイト設定
          ...(input.logoSubtitle !== undefined && { logoSubtitle: input.logoSubtitle }),
          ...(input.heroTagline !== undefined && { heroTagline: input.heroTagline }),
          ...(input.heroGreeting !== undefined && { heroGreeting: input.heroGreeting }),
          ...(input.h1Line1 !== undefined && { h1Line1: input.h1Line1 }),
          ...(input.h1Line2 !== undefined && { h1Line2: input.h1Line2 }),
          ...(input.h1Line3 !== undefined && { h1Line3: input.h1Line3 }),
          ...(input.heroSubText !== undefined && { heroSubText: input.heroSubText }),
          ...(input.theme !== undefined && { theme: input.theme }),
          updatedAt: new Date(),
        })
        .where(eq(profile.id, current.id))
        .returning();
      return toOutput(updated[0]);
    }),
};
