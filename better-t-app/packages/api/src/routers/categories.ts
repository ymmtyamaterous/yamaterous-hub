import { ORPCError } from "@orpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@better-t-app/db";
import { category } from "@better-t-app/db/schema/content";

import { protectedProcedure, publicProcedure } from "../index";

// ── Output schema ─────────────────────────────────────────────────────────────

const CategoryOutput = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// ── Helper ────────────────────────────────────────────────────────────────────

function toCategoryOutput(row: typeof category.$inferSelect) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function generateId() {
  return crypto.randomUUID();
}

// ── Input schemas ─────────────────────────────────────────────────────────────

const CategoryCreateInput = z.object({
  name: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(
      /^[a-z0-9-]+$/,
      "スラッグは小文字英数字とハイフンのみ使用できます",
    ),
  description: z.string().optional(),
});

const CategoryUpdateInput = z.object({
  id: z.string(),
  name: z.string().min(1).optional(),
  slug: z
    .string()
    .min(1)
    .regex(
      /^[a-z0-9-]+$/,
      "スラッグは小文字英数字とハイフンのみ使用できます",
    )
    .optional(),
  description: z.string().optional(),
});

// ── Router ────────────────────────────────────────────────────────────────────

export const categoriesRouter = {
  list: publicProcedure
    .output(z.array(CategoryOutput))
    .handler(async () => {
      const rows = await db
        .select()
        .from(category)
        .orderBy(category.name);
      return rows.map(toCategoryOutput);
    }),

  create: protectedProcedure
    .input(CategoryCreateInput)
    .output(CategoryOutput)
    .handler(async ({ input }) => {
      // 名前・スラッグの重複チェック
      const existing = await db
        .select({ id: category.id })
        .from(category)
        .where(eq(category.slug, input.slug))
        .limit(1);
      if (existing.length > 0) {
        throw new ORPCError("CONFLICT", {
          message: "このスラッグは既に使用されています",
        });
      }

      const id = generateId();
      await db.insert(category).values({
        id,
        name: input.name,
        slug: input.slug,
        description: input.description ?? "",
      });

      const rows = await db
        .select()
        .from(category)
        .where(eq(category.id, id))
        .limit(1);
      const [created] = rows;
      if (!created) throw new ORPCError("INTERNAL_SERVER_ERROR");
      return toCategoryOutput(created);
    }),

  update: protectedProcedure
    .input(CategoryUpdateInput)
    .output(CategoryOutput)
    .handler(async ({ input }) => {
      const existing = await db
        .select()
        .from(category)
        .where(eq(category.id, input.id))
        .limit(1);
      if (existing.length === 0) {
        throw new ORPCError("NOT_FOUND", { message: "Category not found" });
      }
      const [existingCategory] = existing;
      if (!existingCategory) throw new ORPCError("NOT_FOUND");

      if (input.slug && input.slug !== existingCategory.slug) {
        const slugConflict = await db
          .select({ id: category.id })
          .from(category)
          .where(eq(category.slug, input.slug))
          .limit(1);
        if (slugConflict.length > 0) {
          throw new ORPCError("CONFLICT", {
            message: "このスラッグは既に使用されています",
          });
        }
      }

      await db
        .update(category)
        .set({
          ...(input.name !== undefined && { name: input.name }),
          ...(input.slug !== undefined && { slug: input.slug }),
          ...(input.description !== undefined && {
            description: input.description,
          }),
        })
        .where(eq(category.id, input.id));

      const rows = await db
        .select()
        .from(category)
        .where(eq(category.id, input.id))
        .limit(1);
      const [updated] = rows;
      if (!updated) throw new ORPCError("INTERNAL_SERVER_ERROR");
      return toCategoryOutput(updated);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .handler(async ({ input }) => {
      const existing = await db
        .select({ id: category.id })
        .from(category)
        .where(eq(category.id, input.id))
        .limit(1);
      if (existing.length === 0) {
        throw new ORPCError("NOT_FOUND", { message: "Category not found" });
      }
      await db.delete(category).where(eq(category.id, input.id));
      return { success: true };
    }),
};
