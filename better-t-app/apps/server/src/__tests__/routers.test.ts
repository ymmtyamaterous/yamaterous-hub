/**
 * API ルーターのユニットテスト
 * Bun のビルトインテストランナーと mock.module を使用
 *
 * NOTE: mock.module は import より前に評価されるため、
 *       このファイルはモック設定後にルーターをインポートする。
 */
import { beforeEach, describe, expect, mock, test } from "bun:test";
import { createClient } from "@libsql/client";
import { call } from "@orpc/server";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import * as schema from "../../../../packages/db/src/schema";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

// インメモリ SQLite を使用
const testClient = createClient({ url: ":memory:" });
const testDb = drizzle({ client: testClient, schema });

// マイグレーションを実行してテーブルを作成
const migrationsFolder = resolve(
  __dirname,
  "../../../../packages/db/src/migrations",
);
await migrate(testDb, { migrationsFolder });

// @better-t-app/db をモック
mock.module("@better-t-app/db", () => ({
  db: testDb,
  createDb: () => testDb,
}));

// 環境変数モック
mock.module("@better-t-app/env/server", () => ({
  env: {
    DATABASE_URL: ":memory:",
    BETTER_AUTH_SECRET: "test-secret",
    BETTER_AUTH_URL: "http://localhost:3000",
    CORS_ORIGIN: "http://localhost:3001",
  },
}));

// better-auth モック
mock.module("@better-t-app/auth", () => ({
  auth: {
    api: { getSession: async () => null },
  },
}));

// モック設定後にインポート
const { profileRouter } = await import("@better-t-app/api/routers/profile");
const { worksRouter } = await import("@better-t-app/api/routers/works");
const { tagsRouter } = await import("@better-t-app/api/routers/tags");

const authContext = {
  context: { session: { user: { id: "user-1" } } },
} as never;
const publicContext = { context: {} } as never;

// テスト間でテーブルをクリア
beforeEach(async () => {
  await testDb.delete(schema.workTag);
  await testDb.delete(schema.work);
  await testDb.delete(schema.tag);
  await testDb.delete(schema.profile);
});

// ────────────────────────────────────────────────────────────────────────────
// Profile Router
// ────────────────────────────────────────────────────────────────────────────

describe("profileRouter", () => {
  test("get: プロフィールが存在しない場合 NOT_FOUND を投げる", async () => {
    await expect(
      call(profileRouter.get, undefined, publicContext),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  test("get: プロフィールを取得できる", async () => {
    await testDb.insert(schema.profile).values({
      id: "test-id",
      displayName: "テストユーザー",
      bio: "テストの自己紹介",
    });

    const result = await call(profileRouter.get, undefined, publicContext);
    expect(result.displayName).toBe("テストユーザー");
    expect(result.bio).toBe("テストの自己紹介");
  });
});

// ────────────────────────────────────────────────────────────────────────────
// Tags Router
// ────────────────────────────────────────────────────────────────────────────

describe("tagsRouter", () => {
  test("list: タグ一覧を取得できる", async () => {
    await testDb.insert(schema.tag).values([
      { id: "tag-1", name: "TypeScript" },
      { id: "tag-2", name: "React" },
    ]);

    const result = await call(tagsRouter.list, undefined, publicContext);
    expect(result).toHaveLength(2);
    expect(result.map((t: { name: string }) => t.name)).toContain("TypeScript");
  });

  test("create: タグを作成できる", async () => {
    const result = await call(tagsRouter.create, { name: "Bun" }, authContext);
    expect(result.name).toBe("Bun");
    expect(result.id).toBeDefined();
  });

  test("delete: タグを削除できる", async () => {
    await testDb.insert(schema.tag).values({ id: "del-tag", name: "削除対象" });
    const result = await call(tagsRouter.delete, { id: "del-tag" }, authContext);
    expect(result.success).toBe(true);
  });

  test("delete: 存在しないタグで NOT_FOUND を投げる", async () => {
    await expect(
      call(tagsRouter.delete, { id: "not-exist" }, authContext),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});

// ────────────────────────────────────────────────────────────────────────────
// Works Router
// ────────────────────────────────────────────────────────────────────────────

describe("worksRouter", () => {
  test("list: 公開作品のみ返す", async () => {
    await testDb.insert(schema.work).values([
      {
        id: "w1",
        title: "公開作品",
        description: "説明1",
        isPublished: true,
        sortOrder: 0,
      },
      {
        id: "w2",
        title: "非公開作品",
        description: "説明2",
        isPublished: false,
        sortOrder: 1,
      },
    ]);

    const result = await call(worksRouter.list, undefined, publicContext);
    expect(result).toHaveLength(1);
    expect(result[0]?.title).toBe("公開作品");
  });

  test("adminList: すべての作品を返す", async () => {
    await testDb.insert(schema.work).values([
      {
        id: "w1",
        title: "公開作品",
        description: "説明1",
        isPublished: true,
        sortOrder: 0,
      },
      {
        id: "w2",
        title: "非公開作品",
        description: "説明2",
        isPublished: false,
        sortOrder: 1,
      },
    ]);

    const result = await call(worksRouter.adminList, undefined, authContext);
    expect(result).toHaveLength(2);
  });

  test("create: 作品を作成できる", async () => {
    const result = await call(
      worksRouter.create,
      {
        title: "新しい作品",
        description: "詳細説明",
        isPublished: false,
      },
      authContext,
    );
    expect(result.title).toBe("新しい作品");
    expect(result.isPublished).toBe(false);
    expect(result.tags).toHaveLength(0);
  });

  test("create: タグ付きで作品を作成できる", async () => {
    await testDb.insert(schema.tag).values({ id: "tag-ts", name: "TypeScript" });

    const result = await call(
      worksRouter.create,
      {
        title: "タグ付き作品",
        description: "説明",
        tagIds: ["tag-ts"],
      },
      authContext,
    );
    expect(result.tags).toHaveLength(1);
    expect(result.tags[0]?.name).toBe("TypeScript");
  });

  test("update: 作品を更新できる", async () => {
    await testDb.insert(schema.work).values({
      id: "upd-w",
      title: "元のタイトル",
      description: "元の説明",
      isPublished: false,
      sortOrder: 0,
    });

    const result = await call(
      worksRouter.update,
      { id: "upd-w", title: "新しいタイトル", isPublished: true },
      authContext,
    );
    expect(result.title).toBe("新しいタイトル");
    expect(result.isPublished).toBe(true);
  });

  test("delete: 作品を削除できる", async () => {
    await testDb.insert(schema.work).values({
      id: "del-w",
      title: "削除対象",
      description: "説明",
      isPublished: false,
      sortOrder: 0,
    });

    const result = await call(worksRouter.delete, { id: "del-w" }, authContext);
    expect(result.success).toBe(true);
  });

  test("getById: 非公開作品は NOT_FOUND を返す", async () => {
    await testDb.insert(schema.work).values({
      id: "private-w",
      title: "非公開",
      description: "説明",
      isPublished: false,
      sortOrder: 0,
    });

    await expect(
      call(worksRouter.getById, { id: "private-w" }, publicContext),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});
