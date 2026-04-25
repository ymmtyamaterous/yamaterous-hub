import { db } from "@better-t-app/db";
import { profile } from "@better-t-app/db/schema/content";
import { migrate } from "drizzle-orm/libsql/migrator";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export async function runMigrationsAndSeed() {
  // マイグレーション実行
  const migrationsFolder = resolve(__dirname, "../../../packages/db/src/migrations");
  await migrate(db, { migrationsFolder });

  // シード: profile が存在しなければ初期レコードを挿入
  const existing = await db.select().from(profile).limit(1);
  if (existing.length === 0) {
    await db.insert(profile).values({
      id: "default",
      displayName: "Yamaterous",
      bio: "",
      avatarUrl: null,
      githubUrl: null,
      twitterUrl: null,
      siteUrl: null,
    });
    console.log("[seed] Profile initial record inserted.");
  }

  console.log("[db] Migration and seed completed.");
}
