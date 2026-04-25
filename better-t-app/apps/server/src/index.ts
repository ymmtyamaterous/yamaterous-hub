import { createContext } from "@better-t-app/api/context";
import { appRouter } from "@better-t-app/api/routers/index";
import { auth } from "@better-t-app/auth";
import { env } from "@better-t-app/env/server";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { serveStatic } from "hono/bun";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { mkdir } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import { runMigrationsAndSeed } from "./setup";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

// 起動時に DB マイグレーションとシードを実行
await runMigrationsAndSeed();

// アップロードディレクトリを作成
const uploadsDir = resolve(__dirname, "../uploads");
await mkdir(uploadsDir, { recursive: true });

const app = new Hono();

app.use(logger());
app.use(
  "/*",
  cors({
    origin: env.CORS_ORIGIN,
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

// 画像アップロードエンドポイント
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/gif", "image/webp"]);
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

app.post("/api/upload", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  let formData: FormData;
  try {
    formData = await c.req.formData();
  } catch {
    return c.json({ error: "Invalid form data" }, 400);
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return c.json({ error: "No file provided" }, 400);
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return c.json({ error: "Invalid file type. Allowed: jpeg, png, gif, webp" }, 400);
  }

  if (file.size > MAX_FILE_SIZE) {
    return c.json({ error: "File too large (max 5MB)" }, 400);
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const safeName = `${Date.now()}-${randomBytes(8).toString("hex")}.${ext}`;
  const destPath = join(uploadsDir, safeName);

  const buffer = await file.arrayBuffer();
  await Bun.write(destPath, buffer);

  return c.json({ url: `/uploads/${safeName}` });
});

// アップロードファイルの静的配信
app.use("/uploads/*", serveStatic({ root: resolve(__dirname, "..") }));

export const apiHandler = new OpenAPIHandler(appRouter, {
  plugins: [
    new OpenAPIReferencePlugin({
      schemaConverters: [new ZodToJsonSchemaConverter()],
    }),
  ],
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});

export const rpcHandler = new RPCHandler(appRouter, {
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});

app.use("/*", async (c, next) => {
  const context = await createContext({ context: c });

  const rpcResult = await rpcHandler.handle(c.req.raw, {
    prefix: "/rpc",
    context: context,
  });

  if (rpcResult.matched) {
    return c.newResponse(rpcResult.response.body, rpcResult.response);
  }

  const apiResult = await apiHandler.handle(c.req.raw, {
    prefix: "/api-reference",
    context: context,
  });

  if (apiResult.matched) {
    return c.newResponse(apiResult.response.body, apiResult.response);
  }

  await next();
});

app.get("/", (c) => {
  return c.text("OK");
});

// 静的ファイル配信（本番ビルド時）
const staticDir = resolve(__dirname, "../../web/dist");
app.use(
  "/*",
  serveStatic({
    root: staticDir,
  }),
);
// SPA フォールバック
app.get("*", async (c) => {
  const indexFile = Bun.file(resolve(staticDir, "index.html"));
  if (await indexFile.exists()) {
    return new Response(indexFile, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }
  return c.text("Not Found", 404);
});

export default app;
