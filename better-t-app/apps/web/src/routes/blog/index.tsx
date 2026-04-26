import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { client, orpc } from "@/utils/orpc";

export const Route = createFileRoute("/blog/")({
  component: BlogIndexPage,
});

function BlogIndexPage() {
  const [keyword, setKeyword] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [sortBy, setSortBy] = useState<"publishedAt" | "createdAt" | "title">("publishedAt");
  const [order, setOrder] = useState<"asc" | "desc">("desc");

  const filters = {
    keyword: keyword || undefined,
    categoryId: categoryId || undefined,
    sortBy,
    order,
  };

  const { data: posts = [], isLoading } = useQuery(
    orpc.posts.list.queryOptions({ input: filters }),
  );

  const { data: categories = [] } = useQuery(orpc.categories.list.queryOptions());

  const { mutate: trackClick } = useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      client.analytics.trackClick({ eventType: "post_click", targetId: id, targetTitle: title }),
  });

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "0 auto",
        padding: "3rem clamp(1rem, 4vw, 1.5rem)",
      }}
    >
      {/* ヘッダー */}
      <div style={{ marginBottom: "2rem" }}>
        <div
          style={{
            fontFamily: "var(--sc-font-mono)",
            fontSize: "10px",
            letterSpacing: "0.25em",
            color: "var(--sc-sakura)",
            marginBottom: "0.5rem",
          }}
        >
          // BLOG
        </div>
        <h1
          style={{
            fontFamily: "var(--sc-font-jp)",
            fontWeight: 900,
            fontSize: "2.2rem",
            color: "var(--sc-text)",
            lineHeight: 1.2,
          }}
          className="dark:!text-neutral-100"
        >
          ブログ
        </h1>
        <p
          style={{
            fontFamily: "var(--sc-font-jp)",
            color: "var(--sc-muted)",
            marginTop: "0.5rem",
            fontSize: "0.95rem",
          }}
          className="dark:!text-neutral-400"
        >
          技術記事やメモを書いています。
        </p>
      </div>

      {/* 検索・フィルター */}
      <div style={{ marginBottom: "2rem" }}>
        {/* キーワード検索 */}
        <div style={{ marginBottom: "1rem" }}>
          <input
            style={{
              fontFamily: "var(--sc-font-jp)",
              fontSize: "14px",
              padding: "0.55rem 1rem",
              border: "1px solid rgba(200,0,90,0.2)",
              borderRadius: "3px",
              background: "rgba(253,246,239,0.8)",
              color: "var(--sc-text)",
              outline: "none",
              width: "100%",
              boxSizing: "border-box",
            }}
            placeholder="記事を検索..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="sc-filter-input dark:!bg-neutral-800/80 dark:!text-neutral-100 dark:!border-pink-900/30"
          />
        </div>

        {/* カテゴリフィルター + ソート */}
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {/* カテゴリボタン */}
          <button
            type="button"
            onClick={() => setCategoryId("")}
            style={{
              fontFamily: "var(--sc-font-jp)",
              fontSize: "12px",
              padding: "0.3rem 0.9rem",
              borderRadius: "20px",
              border: categoryId === "" ? "1px solid var(--sc-sakura)" : "1px solid rgba(200,0,90,0.2)",
              background: categoryId === "" ? "rgba(200,0,90,0.08)" : "transparent",
              color: categoryId === "" ? "var(--sc-sakura)" : "var(--sc-muted)",
              cursor: "pointer",
            }}
            className={`sc-filter-btn${categoryId === "" ? " sc-filter-btn--active" : ""}`}
          >
            すべて
          </button>
          {categories.map((c) => (
            <button
              type="button"
              key={c.id}
              onClick={() => setCategoryId(c.id === categoryId ? "" : c.id)}
              style={{
                fontFamily: "var(--sc-font-jp)",
                fontSize: "12px",
                padding: "0.3rem 0.9rem",
                borderRadius: "20px",
                border: categoryId === c.id ? "1px solid var(--sc-sakura)" : "1px solid rgba(200,0,90,0.2)",
                background: categoryId === c.id ? "rgba(200,0,90,0.08)" : "transparent",
                color: categoryId === c.id ? "var(--sc-sakura)" : "var(--sc-muted)",
                cursor: "pointer",
              }}
              className={`sc-filter-btn${categoryId === c.id ? " sc-filter-btn--active" : ""}`}
            >
              {c.name}
            </button>
          ))}

          {/* ソート（右端） */}
          <div style={{ marginLeft: "auto", display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <select
              style={{
                fontFamily: "var(--sc-font-jp)",
                fontSize: "12px",
                padding: "0.3rem 0.5rem",
                border: "1px solid rgba(200,0,90,0.2)",
                borderRadius: "3px",
                background: "rgba(253,246,239,0.8)",
                color: "var(--sc-muted)",
                cursor: "pointer",
                outline: "none",
              }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="sc-sort-select dark:!bg-neutral-800/80 dark:!text-neutral-400 dark:!border-pink-900/30"
            >
              <option value="publishedAt">公開日</option>
              <option value="createdAt">作成日</option>
              <option value="title">タイトル</option>
            </select>
            <button
              type="button"
              onClick={() => setOrder((o) => (o === "desc" ? "asc" : "desc"))}
              style={{
                fontFamily: "var(--sc-font-mono)",
                fontSize: "12px",
                padding: "0.3rem 0.6rem",
                border: "1px solid rgba(200,0,90,0.2)",
                borderRadius: "3px",
                background: "transparent",
                color: "var(--sc-muted)",
                cursor: "pointer",
              }}
              className="sc-sort-btn"
            >
              {order === "desc" ? "↓" : "↑"}
            </button>
          </div>
        </div>
      </div>

      {/* 記事一覧 */}
      {isLoading ? (
        <div
          style={{
            fontFamily: "var(--sc-font-mono)",
            fontSize: "13px",
            color: "var(--sc-muted)",
          }}
        >
          Loading...
        </div>
      ) : posts.length === 0 ? (
        <div
          style={{
            fontFamily: "var(--sc-font-mono)",
            fontSize: "13px",
            color: "var(--sc-muted)",
            padding: "3rem 0",
            textAlign: "center",
          }}
        >
          記事が見つかりません
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {posts.map((post) => (
            <Link
              key={post.id}
              to="/blog/$slug"
              params={{ slug: post.slug }}
              style={{ textDecoration: "none" }}
              onClick={() => trackClick({ id: post.id, title: post.title })}
            >
              <article
                style={{
                  background: "rgba(253,246,239,0.9)",
                  border: "1px solid rgba(200,0,90,0.12)",
                  borderRadius: "4px",
                  padding: "1.5rem",
                  transition: "all 0.15s",
                  cursor: "pointer",
                }}
                className="sc-page-card dark:!bg-neutral-800/80 dark:!border-pink-900/20 hover:!border-[var(--sc-sakura)]"
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "1rem",
                    flexWrap: "wrap",
                  }}
                >
                  <h2
                    style={{
                      fontFamily: "var(--sc-font-jp)",
                      fontWeight: 700,
                      fontSize: "1.15rem",
                      color: "var(--sc-text)",
                      margin: 0,
                      lineHeight: 1.4,
                    }}
                    className="dark:!text-neutral-100"
                  >
                    {post.title}
                  </h2>
                  <time
                    dateTime={post.publishedAt ?? post.createdAt}
                    style={{
                      fontFamily: "var(--sc-font-mono)",
                      fontSize: "11px",
                      color: "var(--sc-muted)",
                      flexShrink: 0,
                    }}
                    className="dark:!text-neutral-500"
                  >
                    {new Date(
                      post.publishedAt ?? post.createdAt,
                    ).toLocaleDateString("ja-JP")}
                  </time>
                </div>

                {/* カテゴリバッジ */}
                {post.categories.length > 0 && (
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "0.6rem" }}>
                    {post.categories.map((c) => (
                      <span
                        key={c.id}
                        style={{
                          fontFamily: "var(--sc-font-jp)",
                          fontSize: "11px",
                          padding: "2px 9px",
                          borderRadius: "20px",
                          background: "rgba(200,0,90,0.07)",
                          color: "var(--sc-sakura)",
                          border: "1px solid rgba(200,0,90,0.15)",
                        }}
                        className="sc-category-badge"
                      >
                        {c.name}
                      </span>
                    ))}
                  </div>
                )}

                {post.excerpt && (
                  <p
                    style={{
                      fontFamily: "var(--sc-font-jp)",
                      color: "var(--sc-muted)",
                      margin: "0.75rem 0 0",
                      fontSize: "0.9rem",
                      lineHeight: 1.6,
                    }}
                    className="dark:!text-neutral-400"
                  >
                    {post.excerpt}
                  </p>
                )}
                <div
                  style={{
                    marginTop: "0.75rem",
                    fontFamily: "var(--sc-font-mono)",
                    fontSize: "11px",
                    color: "var(--sc-cyber)",
                    letterSpacing: "0.08em",
                  }}
                >
                  続きを読む →
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
