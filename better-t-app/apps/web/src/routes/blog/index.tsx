import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/blog/")({
  component: BlogIndexPage,
});

function BlogIndexPage() {
  const { data: posts = [], isLoading } = useQuery(
    orpc.posts.list.queryOptions(),
  );

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "0 auto",
        padding: "3rem 1.5rem",
      }}
    >
      {/* ヘッダー */}
      <div style={{ marginBottom: "3rem" }}>
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
          記事がまだありません
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {posts.map((post) => (
            <Link
              key={post.id}
              to="/blog/$slug"
              params={{ slug: post.slug }}
              style={{ textDecoration: "none" }}
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
                className="dark:!bg-neutral-800/80 dark:!border-pink-900/20 hover:!border-[var(--sc-sakura)] hover:!shadow-[0_2px_16px_rgba(200,0,90,0.12)]"
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
