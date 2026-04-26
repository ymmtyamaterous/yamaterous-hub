import { and, count, desc, gte, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "@better-t-app/db";
import { clickEvent, pageView } from "@better-t-app/db/schema/content";

import { protectedProcedure, publicProcedure } from "../index";

function generateId() {
  return crypto.randomUUID();
}

/** ISO 8601 タイムスタンプ(ms)を返す */
function nowMs() {
  return Date.now();
}

/** 指定日数前の Unix タイムスタンプ(ms) */
function daysAgo(days: number) {
  return nowMs() - days * 24 * 60 * 60 * 1000;
}

export const analyticsRouter = {
  // ── 公開エンドポイント（フロントエンドから記録） ────────────────────────

  trackPageView: publicProcedure
    .input(
      z.object({
        path: z.string().max(2048),
        referrer: z.string().max(2048).nullable().optional(),
        ipHash: z.string().max(64).nullable().optional(),
        userAgent: z.string().max(512).nullable().optional(),
      }),
    )
    .output(z.object({ ok: z.boolean() }))
    .handler(async ({ input }) => {
      await db.insert(pageView).values({
        id: generateId(),
        path: input.path,
        referrer: input.referrer ?? null,
        ipHash: input.ipHash ?? null,
        userAgent: input.userAgent ?? null,
      });
      return { ok: true };
    }),

  trackClick: publicProcedure
    .input(
      z.object({
        eventType: z.enum(["work_click", "post_click"]),
        targetId: z.string().max(128),
        targetTitle: z.string().max(512),
      }),
    )
    .output(z.object({ ok: z.boolean() }))
    .handler(async ({ input }) => {
      await db.insert(clickEvent).values({
        id: generateId(),
        eventType: input.eventType,
        targetId: input.targetId,
        targetTitle: input.targetTitle,
      });
      return { ok: true };
    }),

  // ── 管理者専用エンドポイント（集計） ─────────────────────────────────────

  getStats: protectedProcedure
    .output(
      z.object({
        totalPageViews: z.number(),
        todayPageViews: z.number(),
        weekPageViews: z.number(),
        topPaths: z.array(
          z.object({ path: z.string(), count: z.number() }),
        ),
        topWorkClicks: z.array(
          z.object({
            targetId: z.string(),
            targetTitle: z.string(),
            count: z.number(),
          }),
        ),
        topPostClicks: z.array(
          z.object({
            targetId: z.string(),
            targetTitle: z.string(),
            count: z.number(),
          }),
        ),
      }),
    )
    .handler(async () => {
      const todayStart = daysAgo(1);
      const weekStart = daysAgo(7);

      const [totalResult] = await db
        .select({ value: count() })
        .from(pageView);

      const [todayResult] = await db
        .select({ value: count() })
        .from(pageView)
        .where(gte(pageView.createdAt, new Date(todayStart)));

      const [weekResult] = await db
        .select({ value: count() })
        .from(pageView)
        .where(gte(pageView.createdAt, new Date(weekStart)));

      const topPaths = await db
        .select({
          path: pageView.path,
          count: count(),
        })
        .from(pageView)
        .groupBy(pageView.path)
        .orderBy(desc(count()))
        .limit(10);

      const topWorkClicks = await db
        .select({
          targetId: clickEvent.targetId,
          targetTitle: clickEvent.targetTitle,
          count: count(),
        })
        .from(clickEvent)
        .where(and(sql`${clickEvent.eventType} = 'work_click'`))
        .groupBy(clickEvent.targetId, clickEvent.targetTitle)
        .orderBy(desc(count()))
        .limit(10);

      const topPostClicks = await db
        .select({
          targetId: clickEvent.targetId,
          targetTitle: clickEvent.targetTitle,
          count: count(),
        })
        .from(clickEvent)
        .where(and(sql`${clickEvent.eventType} = 'post_click'`))
        .groupBy(clickEvent.targetId, clickEvent.targetTitle)
        .orderBy(desc(count()))
        .limit(10);

      return {
        totalPageViews: totalResult?.value ?? 0,
        todayPageViews: todayResult?.value ?? 0,
        weekPageViews: weekResult?.value ?? 0,
        topPaths: topPaths.map((r) => ({ path: r.path, count: r.count })),
        topWorkClicks: topWorkClicks.map((r) => ({
          targetId: r.targetId,
          targetTitle: r.targetTitle,
          count: r.count,
        })),
        topPostClicks: topPostClicks.map((r) => ({
          targetId: r.targetId,
          targetTitle: r.targetTitle,
          count: r.count,
        })),
      };
    }),
};
