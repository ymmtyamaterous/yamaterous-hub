import { auth } from "@better-t-app/auth";
import { db } from "@better-t-app/db";
import { user } from "@better-t-app/db/schema/auth";
import { profile } from "@better-t-app/db/schema/content";
import { eq } from "drizzle-orm";
import { migrate } from "drizzle-orm/libsql/migrator";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

const ADMIN_EMAIL = "ymmtyamaterous@gmail.com";
const ADMIN_PASSWORD = "password";
const ADMIN_NAME = "Yamaterous";

export async function runMigrationsAndSeed() {
  // マイグレーション実行
  // MIGRATIONS_FOLDER 環境変数が設定されている場合はそちらを優先（Docker環境向け）
  const migrationsFolder =
    process.env.MIGRATIONS_FOLDER ??
    resolve(__dirname, "../../../packages/db/src/migrations");
  console.log(`[db] Running migrations from: ${migrationsFolder}`);
  await migrate(db, { migrationsFolder });
  console.log("[db] Migrations applied.");

  // シード: profile が存在しなければ初期レコードを挿入
  const existingProfile = await db.select().from(profile).limit(1);
  if (existingProfile.length === 0) {
    await db.insert(profile).values({
      id: "default",
      displayName: ADMIN_NAME,
      bio: "",
      avatarUrl: null,
      githubUrl: null,
      twitterUrl: null,
      siteUrl: null,
    });
    console.log("[seed] Profile initial record inserted.");
  }

  // シード: 管理者ユーザーが存在しなければ作成
  const existingUser = await db
    .select()
    .from(user)
    .where(eq(user.email, ADMIN_EMAIL))
    .limit(1);
  if (existingUser.length === 0) {
    await auth.api.signUpEmail({
      body: {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        name: ADMIN_NAME,
      },
    });
    console.log(`[seed] Admin user created: ${ADMIN_EMAIL}`);
  }

  console.log("[db] Migration and seed completed.");
}
