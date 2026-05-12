import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

import { MarkdownRenderer } from "@/components/markdown-renderer";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/news/$slug")({
  component: NewsDetailPage,
});

const NEWS_TYPE_LABELS: Record<string, string> = {
  site_update: "SITE UPDATE",
  personal: "PERSONAL",
};

function NewsDetailPage() {
  const { slug } = Route.useParams();
  const {
    data: item,
    isLoading,
    isError,
  } = useQuery(orpc.news.getBySlug.queryOptions({ input: { slug } }));

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

  if (isError || !item) {
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
          ニュースが見つかりません
        </h1>
        <Link
          to="/news"
          style={{
            fontFamily: "var(--sc-font-mono)",
            fontSize: "13px",
            color: "var(--sc-cyber)",
            textDecoration: "none",
          }}
        >
          ← ニュース一覧へ戻る
        </Link>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "0 auto",
        padding: "3rem clamp(1rem, 4vw, 1.5rem)",
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
        className="dark:!text-neutral-500"
      >
        <Link
          to="/news"
          style={{ color: "var(--sc-cyber)", textDecoration: "none" }}
        >
          NEWS
        </Link>
        <span>/</span>
        <span>{item.title}</span>
      </div>

      {/* 種別バッジ + 日付 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          marginBottom: "1rem",
        }}
      >
        <span
          style={{
            fontFamily: "var(--sc-font-mono)",
            fontSize: "10px",
            letterSpacing: "0.12em",
            padding: "0.15rem 0.6rem",
            borderRadius: "2px",
            background:
              item.newsType === "site_update"
                ? "rgba(0,180,120,0.15)"
                : "rgba(200,0,90,0.12)",
            color:
              item.newsType === "site_update" ? "#00a868" : "var(--sc-sakura)",
          }}
        >
          {NEWS_TYPE_LABELS[item.newsType] ?? item.newsType}
        </span>
        <span
          style={{
            fontFamily: "var(--sc-font-mono)",
            fontSize: "12px",
            color: "var(--sc-muted)",
          }}
          className="dark:!text-neutral-500"
        >
          {item.publishedAt
            ? new Date(item.publishedAt).toLocaleDateString("ja-JP", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : new Date(item.createdAt).toLocaleDateString("ja-JP", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
        </span>
      </div>

      {/* タイトル */}
      <h1
        style={{
          fontFamily: "var(--sc-font-jp)",
          fontWeight: 900,
          fontSize: "2rem",
          color: "var(--sc-text)",
          lineHeight: 1.3,
          marginBottom: "2rem",
        }}
        className="dark:!text-neutral-100"
      >
        {item.title}
      </h1>

      {/* 本文 */}
      <MarkdownRenderer content={item.content} />

      {/* フッター */}
      <div
        style={{
          marginTop: "3rem",
          paddingTop: "1.5rem",
          borderTop: "1px solid rgba(200,0,90,0.12)",
        }}
      >
        <Link
          to="/news"
          style={{
            fontFamily: "var(--sc-font-mono)",
            fontSize: "13px",
            color: "var(--sc-cyber)",
            textDecoration: "none",
          }}
        >
          ← ニュース一覧へ戻る
        </Link>
      </div>
    </div>
  );
}
