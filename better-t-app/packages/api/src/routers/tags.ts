import { ORPCError } from "@orpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@better-t-app/db";
import { tag } from "@better-t-app/db/schema/content";

import { protectedProcedure, publicProcedure } from "../index";

const TagOutput = z.object({
  id: z.string(),
  name: z.string(),
});

export const tagsRouter = {
  list: publicProcedure
    .output(z.array(TagOutput))
    .handler(async () => {
      const rows = await db.select().from(tag).orderBy(tag.name);
      return rows.map((r) => ({ id: r.id, name: r.name }));
    }),

  create: protectedProcedure
    .input(z.object({ name: z.string().min(1).max(50) }))
    .output(TagOutput)
    .handler(async ({ input }) => {
      const id = crypto.randomUUID();
      const inserted = await db
        .insert(tag)
        .values({ id, name: input.name })
        .returning();
      const [created] = inserted;
      if (!created) throw new ORPCError("INTERNAL_SERVER_ERROR");
      return { id: created.id, name: created.name };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(z.object({ success: z.literal(true) }))
    .handler(async ({ input }) => {
      const existing = await db
        .select()
        .from(tag)
        .where(eq(tag.id, input.id))
        .limit(1);
      if (existing.length === 0) {
        throw new ORPCError("NOT_FOUND", { message: "Tag not found" });
      }
      await db.delete(tag).where(eq(tag.id, input.id));
      return { success: true as const };
    }),
};
