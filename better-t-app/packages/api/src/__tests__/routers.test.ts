/**
 * API ルーターのユニットテスト
 * Bun のビルトインテストランナーと mock.module を使用
 */
import { beforeEach, describe, expect, mock, test } from "bun:test";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import * as schema from "@better-t-app/db/schema/index";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const testClient = createClient({ url: ":memory:" });
const testDb = drizzle({ client: testClient, schema });
const migrationsFolder = resolve(__dirname, "../../../db/src/migrations");
await migrate(testDb, { migrationsFolder });

mock.module("@better-t-app/db", () => ({ db: testDb, createDb: () => testDb }));
mock.module("@better-t-app/env/server", () => ({
  env: { DATABASE_URL: ":memory:", BETTER_AUTH_SECRET: "test-secret", BETTER_AUTH_URL: "http://localhost:3000", CORS_ORIGIN: "http://localhost:3001" },
}));
mock.module("@better-t-app/auth", () => ({ auth: { api: { getSession: async () => null } } }));

const { call } = await import("@orpc/server");
const { profileRouter } = await import("@better-t-app/api/routers/profile");
const { worksRouter } = await import("@better-t-app/api/routers/works");
const { tagsRouter } = await import("@better-t-app/api/routers/tags");
const { analyticsRouter } = await import("@better-t-app/api/routers/analytics");

const authCtx = { context: { session: { user: { id: "user-1", name: "Test" } } } };
const publicCtx = { context: {} };

beforeEach(async () => {
  await testDb.delete(schema.workTag);
  await testDb.delete(schema.work);
  await testDb.delete(schema.tag);
  await testDb.delete(schema.profile);
  await testDb.delete(schema.clickEvent);
  await testDb.delete(schema.pageView);
});

describe("profileRouter", () => {
  test("get: プロフィールが存在しない場合 NOT_FOUND を投げる", async () => {
    await expect(call(profileRouter.get, undefined, publicCtx)).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
  test("get: プロフィールを取得できる", async () => {
    await testDb.insert(schema.profile).values({ id: "test-id", displayName: "テストユーザー", bio: "自己紹介" });
    const result = await call(profileRouter.get, undefined, publicCtx);
    expect(result.displayName).toBe("テストユーザー");
  });
});

describe("tagsRouter", () => {
  test("list: タグ一覧を取得できる", async () => {
    await testDb.insert(schema.tag).values([{ id: "tag-1", name: "TypeScript" }, { id: "tag-2", name: "React" }]);
    const result = await call(tagsRouter.list, undefined, publicCtx);
    expect(result).toHaveLength(2);
  });
  test("create: タグを作成できる", async () => {
    const result = await call(tagsRouter.create, { name: "Bun" }, authCtx);
    expect(result.name).toBe("Bun");
  });
  test("delete: タグを削除できる", async () => {
    await testDb.insert(schema.tag).values({ id: "del-tag", name: "削除対象" });
    const result = await call(tagsRouter.delete, { id: "del-tag" }, authCtx);
    expect(result.success).toBe(true);
  });
  test("delete: 存在しないタグで NOT_FOUND を投げる", async () => {
    await expect(call(tagsRouter.delete, { id: "not-exist" }, authCtx)).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});

describe("worksRouter", () => {
  test("list: 公開作品のみ返す", async () => {
    await testDb.insert(schema.work).values([
      { id: "w1", title: "公開", description: "説明1", isPublished: true, sortOrder: 0 },
      { id: "w2", title: "非公開", description: "説明2", isPublished: false, sortOrder: 1 },
    ]);
    const result = await call(worksRouter.list, undefined, publicCtx);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("公開");
  });
  test("adminList: すべての作品を返す", async () => {
    await testDb.insert(schema.work).values([
      { id: "w1", title: "公開", description: "説明1", isPublished: true, sortOrder: 0 },
      { id: "w2", title: "非公開", description: "説明2", isPublished: false, sortOrder: 1 },
    ]);
    const result = await call(worksRouter.adminList, undefined, authCtx);
    expect(result).toHaveLength(2);
  });
  test("create: 作品を作成できる", async () => {
    const result = await call(worksRouter.create, { title: "新しい作品", description: "詳細説明", isPublished: false }, authCtx);
    expect(result.title).toBe("新しい作品");
    expect(result.tags).toHaveLength(0);
  });
  test("create: タグ付きで作品を作成できる", async () => {
    await testDb.insert(schema.tag).values({ id: "tag-ts", name: "TypeScript" });
    const result = await call(worksRouter.create, { title: "タグ付き作品", description: "説明", tagIds: ["tag-ts"] }, authCtx);
    expect(result.tags).toHaveLength(1);
    expect(result.tags[0].name).toBe("TypeScript");
  });
  test("update: 作品を更新できる", async () => {
    await testDb.insert(schema.work).values({ id: "upd-w", title: "元のタイトル", description: "説明", isPublished: false, sortOrder: 0 });
    const result = await call(worksRouter.update, { id: "upd-w", title: "新しいタイトル", isPublished: true }, authCtx);
    expect(result.title).toBe("新しいタイトル");
    expect(result.isPublished).toBe(true);
  });
  test("delete: 作品を削除できる", async () => {
    await testDb.insert(schema.work).values({ id: "del-w", title: "削除対象", description: "説明", isPublished: false, sortOrder: 0 });
    const result = await call(worksRouter.delete, { id: "del-w" }, authCtx);
    expect(result.success).toBe(true);
  });
  test("getById: 非公開作品は NOT_FOUND を返す", async () => {
    await testDb.insert(schema.work).values({ id: "private-w", title: "非公開", description: "説明", isPublished: false, sortOrder: 0 });
    await expect(call(worksRouter.getById, { id: "private-w" }, publicCtx)).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});

describe("analyticsRouter", () => {
  test("trackPageView: ページビューを記録できる", async () => {
    const result = await call(
      analyticsRouter.trackPageView,
      { path: "/works", referrer: null },
      publicCtx,
    );
    expect(result.ok).toBe(true);
  });

  test("trackClick: クリックイベントを記録できる", async () => {
    const result = await call(
      analyticsRouter.trackClick,
      { eventType: "work_click", targetId: "work-1", targetTitle: "テスト作品" },
      publicCtx,
    );
    expect(result.ok).toBe(true);
  });

  test("getStats: 統計を取得できる（認証あり）", async () => {
    await call(analyticsRouter.trackPageView, { path: "/", referrer: null }, publicCtx);
    await call(analyticsRouter.trackPageView, { path: "/works", referrer: null }, publicCtx);
    await call(analyticsRouter.trackClick, { eventType: "work_click", targetId: "w1", targetTitle: "作品A" }, publicCtx);
    await call(analyticsRouter.trackClick, { eventType: "post_click", targetId: "p1", targetTitle: "記事A" }, publicCtx);

    const stats = await call(analyticsRouter.getStats, undefined, authCtx);
    expect(stats.totalPageViews).toBe(2);
    expect(stats.topPaths).toHaveLength(2);
    expect(stats.topWorkClicks[0].targetTitle).toBe("作品A");
    expect(stats.topPostClicks[0].targetTitle).toBe("記事A");
  });

  test("getStats: 認証なしは UNAUTHORIZED を投げる", async () => {
    await expect(call(analyticsRouter.getStats, undefined, publicCtx)).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });

  test("trackPageView: 同じパスを複数記録できる", async () => {
    await call(analyticsRouter.trackPageView, { path: "/works", referrer: null }, publicCtx);
    await call(analyticsRouter.trackPageView, { path: "/works", referrer: null }, publicCtx);
    await call(analyticsRouter.trackPageView, { path: "/works", referrer: null }, publicCtx);

    const stats = await call(analyticsRouter.getStats, undefined, authCtx);
    expect(stats.totalPageViews).toBe(3);
    expect(stats.topPaths[0].path).toBe("/works");
    expect(stats.topPaths[0].count).toBe(3);
  });
});

