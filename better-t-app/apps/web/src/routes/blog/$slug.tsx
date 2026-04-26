import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

import { MarkdownRenderer } from "@/components/markdown-renderer";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/blog/$slug")({
  component: BlogPostPage,
});

function BlogPostPage() {
  const { slug } = Route.useParams();
  const { data: post, isLoading, isError } = useQuery(
    orpc.posts.getBySlug.queryOptions({ input: { slug } }),
  );

  if (isLoading) {
    return (
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: "3rem 1.5rem",
          fontFamily: "var(--sc-font-mono)",
          fontSize: "13px",
          color: "var(--sc-muted)",
        }}
      >
        Loading...
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: "3rem 1.5rem",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: "var(--sc-font-mono)",
            fontSize: "10px",
            letterSpacing: "0.25em",
            color: "var(--sc-sakura)",
            marginBottom: "1rem",
          }}
        >
          // 404
        </div>
        <h1
          style={{
            fontFamily: "var(--sc-font-jp)",
            fontWeight: 900,
            fontSize: "1.8rem",
            color: "var(--sc-text)",
            marginBottom: "1rem",
          }}
          className="dark:!text-neutral-100"
        >
          記事が見つかりません
        </h1>
        <Link
          to="/blog"
          style={{
            fontFamily: "var(--sc-font-mono)",
            fontSize: "13px",
            color: "var(--sc-cyber)",
            textDecoration: "none",
          }}
        >
          ← ブログ一覧へ戻る
        </Link>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "0 auto",
        padding: "3rem 1.5rem",
      }}
    >
      {/* パンくずリスト */}
      <div
        style={{
          fontFamily: "var(--sc-font-mono)",
          fontSize: "11px",
          color: "var(--sc-muted)",
          marginBottom: "2rem",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        <Link
          to="/blog"
          style={{ color: "var(--sc-cyber)", textDecoration: "none" }}
        >
          BLOG
        </Link>
        <span>›</span>
        <span style={{ color: "var(--sc-muted)" }}>
          {post.slug}
        </span>
      </div>

      {/* 記事ヘッダー */}
      <header style={{ marginBottom: "2.5rem" }}>
        <h1
          style={{
            fontFamily: "var(--sc-font-jp)",
            fontWeight: 900,
            fontSize: "2rem",
            color: "var(--sc-text)",
            lineHeight: 1.3,
            marginBottom: "1rem",
          }}
          className="dark:!text-neutral-100"
        >
          {post.title}
        </h1>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1.5rem",
            flexWrap: "wrap",
            borderTop: "1px solid rgba(200,0,90,0.1)",
            paddingTop: "1rem",
          }}
        >
          <time
            dateTime={post.publishedAt ?? post.createdAt}
            style={{
              fontFamily: "var(--sc-font-mono)",
              fontSize: "12px",
              color: "var(--sc-muted)",
            }}
            className="dark:!text-neutral-500"
          >
            {new Date(post.publishedAt ?? post.createdAt).toLocaleDateString(
              "ja-JP",
              { year: "numeric", month: "long", day: "numeric" },
            )}
          </time>
          {post.excerpt && (
            <p
              style={{
                fontFamily: "var(--sc-font-jp)",
                color: "var(--sc-muted)",
                margin: 0,
                fontSize: "0.9rem",
              }}
              className="dark:!text-neutral-400"
            >
              {post.excerpt}
            </p>
          )}
        </div>

        {/* カテゴリバッジ */}
        {post.categories.length > 0 && (
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "0.75rem" }}>
            {post.categories.map((c) => (
              <Link
                key={c.id}
                to="/blog"
                search={{ categoryId: c.id } as Record<string, string>}
                style={{ textDecoration: "none" }}
              >
                <span
                  style={{
                    fontFamily: "var(--sc-font-jp)",
                    fontSize: "12px",
                    padding: "3px 11px",
                    borderRadius: "20px",
                    background: "rgba(200,0,90,0.07)",
                    color: "var(--sc-sakura)",
                    border: "1px solid rgba(200,0,90,0.18)",
                    cursor: "pointer",
                    display: "inline-block",
                    transition: "all 0.15s",
                  }}
                  className="sc-category-badge"
                >
                  {c.name}
                </span>
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* 記事本文 */}
      <div
        style={{
          background: "rgba(253,246,239,0.6)",
          border: "1px solid rgba(200,0,90,0.08)",
          borderRadius: "4px",
          padding: "2.5rem",
          marginBottom: "3rem",
        }}
        className="dark:!bg-neutral-800/50 dark:!border-pink-900/10"
      >
        <MarkdownRenderer content={post.content} />
      </div>

      {/* フッターナビ */}
      <div
        style={{
          borderTop: "1px solid rgba(200,0,90,0.1)",
          paddingTop: "1.5rem",
        }}        className="sc-post-header-divider"      >
        <Link
          to="/blog"
          style={{
            fontFamily: "var(--sc-font-mono)",
            fontSize: "13px",
            color: "var(--sc-cyber)",
            textDecoration: "none",
            letterSpacing: "0.05em",
          }}
        >
          ← ブログ一覧へ戻る
        </Link>
      </div>
    </div>
  );
}
