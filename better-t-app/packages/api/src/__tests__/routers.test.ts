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
const { podcastsRouter } = await import("@better-t-app/api/routers/podcasts");

const authCtx = { context: { session: { user: { id: "user-1", name: "Test" } } } };
const publicCtx = { context: {} };

beforeEach(async () => {
  await testDb.delete(schema.workTag);
  await testDb.delete(schema.work);
  await testDb.delete(schema.tag);
  await testDb.delete(schema.profile);
  await testDb.delete(schema.clickEvent);
  await testDb.delete(schema.pageView);
  await testDb.delete(schema.podcastCategory);
  await testDb.delete(schema.podcast);
  await testDb.delete(schema.postCategory);
  await testDb.delete(schema.post);
  await testDb.delete(schema.category);
  await testDb.delete(schema.news);
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
    const result = await call(worksRouter.list, {}, publicCtx);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("公開");
  });
  test("adminList: すべての作品を返す", async () => {
    await testDb.insert(schema.work).values([
      { id: "w1", title: "公開", description: "説明1", isPublished: true, sortOrder: 0 },
      { id: "w2", title: "非公開", description: "説明2", isPublished: false, sortOrder: 1 },
    ]);
    const result = await call(worksRouter.adminList, {}, authCtx);
    expect(result).toHaveLength(2);
  });
  test("list: tagId で公開作品を絞り込める", async () => {
    await testDb.insert(schema.tag).values([
      { id: "tag-a", name: "タグA" },
      { id: "tag-b", name: "タグB" },
    ]);
    await testDb.insert(schema.work).values([
      { id: "w1", title: "タグAの作品", description: "説明1", isPublished: true, sortOrder: 0 },
      { id: "w2", title: "タグBの作品", description: "説明2", isPublished: true, sortOrder: 1 },
      { id: "w3", title: "タグなし", description: "説明3", isPublished: true, sortOrder: 2 },
    ]);
    await testDb.insert(schema.workTag).values([
      { workId: "w1", tagId: "tag-a" },
      { workId: "w2", tagId: "tag-b" },
    ]);
    const result = await call(worksRouter.list, { tagId: "tag-a" }, publicCtx);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("タグAの作品");
  });
  test("adminList: tagId で全作品を絞り込める", async () => {
    await testDb.insert(schema.tag).values([{ id: "tag-x", name: "TagX" }]);
    await testDb.insert(schema.work).values([
      { id: "w1", title: "TagX作品", description: "説明1", isPublished: false, sortOrder: 0 },
      { id: "w2", title: "タグなし", description: "説明2", isPublished: true, sortOrder: 1 },
    ]);
    await testDb.insert(schema.workTag).values([{ workId: "w1", tagId: "tag-x" }]);
    const result = await call(worksRouter.adminList, { tagId: "tag-x" }, authCtx);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("TagX作品");
  });
  test("reorder: 作品の表示順を一括更新できる", async () => {
    await testDb.insert(schema.work).values([
      { id: "r1", title: "作品1", description: "説明", isPublished: false, sortOrder: 1 },
      { id: "r2", title: "作品2", description: "説明", isPublished: false, sortOrder: 2 },
    ]);
    const result = await call(
      worksRouter.reorder,
      { updates: [{ id: "r1", sortOrder: 2 }, { id: "r2", sortOrder: 1 }] },
      authCtx,
    );
    expect(result.success).toBe(true);
    const after = await call(worksRouter.adminList, {}, authCtx);
    const r1 = after.find((w) => w.id === "r1");
    const r2 = after.find((w) => w.id === "r2");
    expect(r1?.sortOrder).toBe(2);
    expect(r2?.sortOrder).toBe(1);
  });
  test("create: 作品を作成できる", async () => {
    const result = await call(worksRouter.create, { title: "新しい作品", description: "詳細説明", isPublished: false }, authCtx);
    expect(result.title).toBe("新しい作品");
    expect(result.tags).toHaveLength(0);
  });
  test("create: sortOrder 未指定時に既存最大値 +1 が自動設定される", async () => {
    await testDb.insert(schema.work).values([
      { id: "auto-w1", title: "既存1", description: "説明", isPublished: false, sortOrder: 3 },
      { id: "auto-w2", title: "既存2", description: "説明", isPublished: false, sortOrder: 7 },
    ]);
    const result = await call(worksRouter.create, { title: "自動順序", description: "説明" }, authCtx);
    expect(result.sortOrder).toBe(8);
  });
  test("create: sortOrder 未指定かつ作品が存在しない場合は 1 が設定される", async () => {
    const result = await call(worksRouter.create, { title: "初回作品", description: "説明" }, authCtx);
    expect(result.sortOrder).toBe(1);
  });
  test("create: sortOrder を明示指定した場合はその値が使われる", async () => {
    await testDb.insert(schema.work).values({ id: "existing", title: "既存", description: "説明", isPublished: false, sortOrder: 10 });
    const result = await call(worksRouter.create, { title: "指定順序", description: "説明", sortOrder: 5 }, authCtx);
    expect(result.sortOrder).toBe(5);
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

  test("trackPageView: 未認証は isAdmin=false で記録される", async () => {
    await call(analyticsRouter.trackPageView, { path: "/works", referrer: null }, publicCtx);

    const stats = await call(analyticsRouter.getStats, undefined, authCtx);
    expect(stats.totalPageViews).toBe(1);
    expect(stats.adminPageViews).toBe(0);
    expect(stats.publicPageViews).toBe(1);
    expect(stats.topPaths[0].adminCount).toBe(0);
    expect(stats.topPaths[0].publicCount).toBe(1);
  });

  test("trackPageView: 認証済みは isAdmin=true で記録される", async () => {
    await call(analyticsRouter.trackPageView, { path: "/works", referrer: null }, authCtx);

    const stats = await call(analyticsRouter.getStats, undefined, authCtx);
    expect(stats.totalPageViews).toBe(1);
    expect(stats.adminPageViews).toBe(1);
    expect(stats.publicPageViews).toBe(0);
    expect(stats.topPaths[0].adminCount).toBe(1);
    expect(stats.topPaths[0].publicCount).toBe(0);
  });

  test("trackPageView: 管理者と一般の混在を正しく集計できる", async () => {
    await call(analyticsRouter.trackPageView, { path: "/works", referrer: null }, publicCtx);
    await call(analyticsRouter.trackPageView, { path: "/works", referrer: null }, publicCtx);
    await call(analyticsRouter.trackPageView, { path: "/works", referrer: null }, authCtx);

    const stats = await call(analyticsRouter.getStats, undefined, authCtx);
    expect(stats.totalPageViews).toBe(3);
    expect(stats.adminPageViews).toBe(1);
    expect(stats.publicPageViews).toBe(2);
    expect(stats.topPaths[0].count).toBe(3);
    expect(stats.topPaths[0].adminCount).toBe(1);
    expect(stats.topPaths[0].publicCount).toBe(2);
  });

  test("trackClick: 未認証は isAdmin=false で記録される", async () => {
    await call(analyticsRouter.trackClick, { eventType: "work_click", targetId: "w1", targetTitle: "作品A" }, publicCtx);

    const stats = await call(analyticsRouter.getStats, undefined, authCtx);
    expect(stats.topWorkClicks[0].adminCount).toBe(0);
    expect(stats.topWorkClicks[0].publicCount).toBe(1);
  });

  test("trackClick: 認証済みは isAdmin=true で記録される", async () => {
    await call(analyticsRouter.trackClick, { eventType: "work_click", targetId: "w1", targetTitle: "作品A" }, authCtx);

    const stats = await call(analyticsRouter.getStats, undefined, authCtx);
    expect(stats.topWorkClicks[0].adminCount).toBe(1);
    expect(stats.topWorkClicks[0].publicCount).toBe(0);
  });
});

describe("podcastsRouter", () => {
  test("list: 公開済みエピソードのみ返す", async () => {
    await testDb.insert(schema.podcast).values([
      { id: "ep1", title: "公開エピソード", slug: "published-ep", audioUrl: "/uploads/audio/a.m4a", isPublished: true, sortOrder: 0 },
      { id: "ep2", title: "非公開エピソード", slug: "draft-ep", audioUrl: "/uploads/audio/b.m4a", isPublished: false, sortOrder: 1 },
    ]);
    const result = await call(podcastsRouter.list, undefined, publicCtx);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("公開エピソード");
  });

  test("adminList: すべてのエピソードを返す", async () => {
    await testDb.insert(schema.podcast).values([
      { id: "ep1", title: "公開エピソード", slug: "published-ep", audioUrl: "/uploads/audio/a.m4a", isPublished: true, sortOrder: 0 },
      { id: "ep2", title: "非公開エピソード", slug: "draft-ep", audioUrl: "/uploads/audio/b.m4a", isPublished: false, sortOrder: 1 },
    ]);
    const result = await call(podcastsRouter.adminList, undefined, authCtx);
    expect(result).toHaveLength(2);
  });

  test("create: エピソードを作成できる", async () => {
    const result = await call(
      podcastsRouter.create,
      { title: "テストエピソード", slug: "test-ep", audioUrl: "/uploads/audio/test.m4a", isPublished: false },
      authCtx,
    );
    expect(result.title).toBe("テストエピソード");
    expect(result.slug).toBe("test-ep");
    expect(result.categories).toHaveLength(0);
  });

  test("create: スラッグ重複時に CONFLICT を投げる", async () => {
    await testDb.insert(schema.podcast).values({
      id: "ep-exist",
      title: "既存",
      slug: "dup-slug",
      audioUrl: "/uploads/audio/a.m4a",
      isPublished: false,
      sortOrder: 0,
    });
    await expect(
      call(podcastsRouter.create, { title: "新規", slug: "dup-slug", audioUrl: "/uploads/audio/b.m4a" }, authCtx),
    ).rejects.toMatchObject({ code: "CONFLICT" });
  });

  test("create: カテゴリ付きでエピソードを作成できる", async () => {
    await testDb.insert(schema.category).values({ id: "cat-1", name: "テック", slug: "tech" });
    const result = await call(
      podcastsRouter.create,
      { title: "カテゴリ付き", slug: "with-cat", audioUrl: "/uploads/audio/c.m4a", categoryIds: ["cat-1"] },
      authCtx,
    );
    expect(result.categories).toHaveLength(1);
    expect(result.categories[0].slug).toBe("tech");
  });

  test("create: 未認証時に UNAUTHORIZED を投げる", async () => {
    await expect(
      call(podcastsRouter.create, { title: "無認証", slug: "no-auth", audioUrl: "/uploads/audio/x.m4a" }, publicCtx),
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  test("update: エピソードを更新できる", async () => {
    await testDb.insert(schema.podcast).values({ id: "ep-upd", title: "元タイトル", slug: "orig-slug", audioUrl: "/uploads/audio/a.m4a", isPublished: false, sortOrder: 0 });
    const result = await call(podcastsRouter.update, { id: "ep-upd", title: "新タイトル", isPublished: true }, authCtx);
    expect(result.title).toBe("新タイトル");
    expect(result.isPublished).toBe(true);
  });

  test("delete: エピソードを削除できる", async () => {
    await testDb.insert(schema.podcast).values({ id: "ep-del", title: "削除対象", slug: "del-ep", audioUrl: "/uploads/audio/a.m4a", isPublished: false, sortOrder: 0 });
    const result = await call(podcastsRouter.delete, { id: "ep-del" }, authCtx);
    expect(result.success).toBe(true);
  });

  test("delete: 存在しない ID で NOT_FOUND を投げる", async () => {
    await expect(
      call(podcastsRouter.delete, { id: "not-exist" }, authCtx),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  test("getBySlug: 公開済みエピソードをスラッグで取得できる", async () => {
    await testDb.insert(schema.podcast).values({ id: "ep-slug", title: "スラッグ検索", slug: "find-me", audioUrl: "/uploads/audio/a.m4a", isPublished: true, sortOrder: 0 });
    const result = await call(podcastsRouter.getBySlug, { slug: "find-me" }, publicCtx);
    expect(result.title).toBe("スラッグ検索");
  });

  test("getBySlug: 非公開エピソードは NOT_FOUND を投げる", async () => {
    await testDb.insert(schema.podcast).values({ id: "ep-priv", title: "非公開", slug: "hidden", audioUrl: "/uploads/audio/a.m4a", isPublished: false, sortOrder: 0 });
    await expect(
      call(podcastsRouter.getBySlug, { slug: "hidden" }, publicCtx),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});

const { newsRouter } = await import("@better-t-app/api/routers/news");

describe("newsRouter", () => {
  test("list: 公開ニュースのみ返す", async () => {
    await testDb.insert(schema.news).values([
      { id: "n1", title: "公開ニュース", slug: "pub-news", isPublished: true },
      { id: "n2", title: "非公開ニュース", slug: "draft-news", isPublished: false },
    ]);
    const result = await call(newsRouter.list, undefined, publicCtx);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("公開ニュース");
  });

  test("adminList: すべてのニュースを返す", async () => {
    await testDb.insert(schema.news).values([
      { id: "n1", title: "公開ニュース", slug: "pub-news", isPublished: true },
      { id: "n2", title: "非公開ニュース", slug: "draft-news", isPublished: false },
    ]);
    const result = await call(newsRouter.adminList, undefined, authCtx);
    expect(result).toHaveLength(2);
  });

  test("list: newsType フィルターが機能する", async () => {
    await testDb.insert(schema.news).values([
      { id: "n1", title: "サイト更新", slug: "site-upd", newsType: "site_update", isPublished: true },
      { id: "n2", title: "個人ニュース", slug: "personal-news", newsType: "personal", isPublished: true },
    ]);
    const result = await call(newsRouter.list, { newsType: "site_update" }, publicCtx);
    expect(result).toHaveLength(1);
    expect(result[0].newsType).toBe("site_update");
  });

  test("list: キーワードフィルターが機能する", async () => {
    await testDb.insert(schema.news).values([
      { id: "n1", title: "リリースノート", slug: "release-note", isPublished: true },
      { id: "n2", title: "日記", slug: "diary", isPublished: true },
    ]);
    const result = await call(newsRouter.list, { keyword: "リリース" }, publicCtx);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("リリースノート");
  });

  test("create: ニュースを作成できる", async () => {
    const result = await call(
      newsRouter.create,
      { title: "新しいニュース", slug: "new-news", content: "内容", newsType: "personal", isPublished: false },
      authCtx,
    );
    expect(result.title).toBe("新しいニュース");
    expect(result.newsType).toBe("personal");
    expect(result.isPublished).toBe(false);
  });

  test("create: デフォルト newsType は personal", async () => {
    const result = await call(
      newsRouter.create,
      { title: "デフォルト種別", slug: "default-type", content: "" },
      authCtx,
    );
    expect(result.newsType).toBe("personal");
  });

  test("create: スラッグ重複時に CONFLICT を投げる", async () => {
    await testDb.insert(schema.news).values({ id: "dup", title: "既存", slug: "dup-slug", isPublished: false });
    await expect(
      call(newsRouter.create, { title: "重複", slug: "dup-slug", content: "" }, authCtx),
    ).rejects.toMatchObject({ code: "CONFLICT" });
  });

  test("create: 未認証時に UNAUTHORIZED を投げる", async () => {
    await expect(
      call(newsRouter.create, { title: "無認証", slug: "no-auth", content: "" }, publicCtx),
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  test("create: isPublished=true で publishedAt が設定される", async () => {
    const result = await call(
      newsRouter.create,
      { title: "公開ニュース", slug: "pub-now", content: "", isPublished: true },
      authCtx,
    );
    expect(result.isPublished).toBe(true);
    expect(result.publishedAt).not.toBeNull();
  });

  test("update: ニュースを更新できる", async () => {
    await testDb.insert(schema.news).values({ id: "upd-n", title: "元タイトル", slug: "orig", isPublished: false });
    const result = await call(newsRouter.update, { id: "upd-n", title: "新タイトル", isPublished: true }, authCtx);
    expect(result.title).toBe("新タイトル");
    expect(result.isPublished).toBe(true);
  });

  test("update: スラッグ重複時に CONFLICT を投げる", async () => {
    await testDb.insert(schema.news).values([
      { id: "n-a", title: "A", slug: "slug-a", isPublished: false },
      { id: "n-b", title: "B", slug: "slug-b", isPublished: false },
    ]);
    await expect(
      call(newsRouter.update, { id: "n-a", slug: "slug-b" }, authCtx),
    ).rejects.toMatchObject({ code: "CONFLICT" });
  });

  test("update: 存在しない ID で NOT_FOUND を投げる", async () => {
    await expect(
      call(newsRouter.update, { id: "not-exist", title: "更新" }, authCtx),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  test("delete: ニュースを削除できる", async () => {
    await testDb.insert(schema.news).values({ id: "del-n", title: "削除対象", slug: "del-news", isPublished: false });
    const result = await call(newsRouter.delete, { id: "del-n" }, authCtx);
    expect(result.success).toBe(true);
  });

  test("delete: 存在しない ID で NOT_FOUND を投げる", async () => {
    await expect(
      call(newsRouter.delete, { id: "not-exist" }, authCtx),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  test("getBySlug: 公開ニュースをスラッグで取得できる", async () => {
    await testDb.insert(schema.news).values({ id: "slug-n", title: "スラッグ検索", slug: "find-news", isPublished: true });
    const result = await call(newsRouter.getBySlug, { slug: "find-news" }, publicCtx);
    expect(result.title).toBe("スラッグ検索");
  });

  test("getBySlug: 非公開ニュースは NOT_FOUND を投げる", async () => {
    await testDb.insert(schema.news).values({ id: "priv-n", title: "非公開", slug: "hidden-news", isPublished: false });
    await expect(
      call(newsRouter.getBySlug, { slug: "hidden-news" }, publicCtx),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  test("adminGet: 管理者は非公開ニュースを取得できる", async () => {
    await testDb.insert(schema.news).values({ id: "admin-n", title: "非公開", slug: "admin-only", isPublished: false });
    const result = await call(newsRouter.adminGet, { id: "admin-n" }, authCtx);
    expect(result.title).toBe("非公開");
  });
});
