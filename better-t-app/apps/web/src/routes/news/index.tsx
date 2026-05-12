import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { client, orpc } from "@/utils/orpc";

export const Route = createFileRoute("/news/")({
  component: NewsIndexPage,
});

const NEWS_TYPE_LABELS: Record<string, string> = {
  "": "すべて",
  site_update: "サイト更新",
  personal: "個人ニュース",
};

function NewsIndexPage() {
  const [newsType, setNewsType] = useState<"" | "site_update" | "personal">("");
  const [keyword, setKeyword] = useState("");

  const filters = {
    keyword: keyword || undefined,
    newsType: newsType || undefined,
  };

  const { data: newsList = [], isLoading } = useQuery(
    orpc.news.list.queryOptions({ input: filters }),
  );

  const { mutate: trackClick } = useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      client.analytics.trackClick({
        eventType: "news_click",
        targetId: id,
        targetTitle: title,
      }),
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
          // NEWS
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
          ニュース
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
          サイトの更新情報や製作者の近況をお届けします。
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
            placeholder="ニュースを検索..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="sc-filter-input dark:!bg-neutral-800/80 dark:!text-neutral-100 dark:!border-pink-900/30"
          />
        </div>

        {/* 種別フィルター */}
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {(["", "site_update", "personal"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setNewsType(type)}
              style={{
                fontFamily: "var(--sc-font-jp)",
                fontSize: "12px",
                padding: "0.3rem 0.8rem",
                border: "1px solid rgba(200,0,90,0.25)",
                borderRadius: "3px",
                cursor: "pointer",
                background:
                  newsType === type
                    ? "var(--sc-sakura)"
                    : "rgba(253,246,239,0.8)",
                color:
                  newsType === type ? "#fff" : "var(--sc-muted)",
                transition: "all 0.15s",
              }}
              className={
                newsType === type
                  ? "dark:!bg-pink-700 dark:!border-pink-700"
                  : "dark:!bg-neutral-800/80 dark:!border-pink-900/30 dark:!text-neutral-400"
              }
            >
              {NEWS_TYPE_LABELS[type]}
            </button>
          ))}
        </div>
      </div>

      {/* ニュース一覧 */}
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
      ) : newsList.length === 0 ? (
        <div
          style={{
            fontFamily: "var(--sc-font-jp)",
            fontSize: "14px",
            color: "var(--sc-muted)",
            textAlign: "center",
            padding: "3rem 0",
          }}
          className="dark:!text-neutral-500"
        >
          ニュースがありません
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {newsList.map((item) => (
            <Link
              key={item.id}
              to="/news/$slug"
              params={{ slug: item.slug }}
              onClick={() => trackClick({ id: item.id, title: item.title })}
              style={{ textDecoration: "none" }}
            >
              <article
                style={{
                  padding: "1.25rem 1.5rem",
                  border: "1px solid rgba(200,0,90,0.12)",
                  borderRadius: "4px",
                  background: "rgba(253,246,239,0.6)",
                  cursor: "pointer",
                  transition: "border-color 0.15s, background 0.15s",
                }}
                className="dark:!bg-neutral-800/50 dark:!border-pink-900/20 hover:!border-[var(--sc-sakura)] dark:hover:!border-pink-600"
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginBottom: "0.4rem",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--sc-font-mono)",
                      fontSize: "10px",
                      letterSpacing: "0.1em",
                      padding: "0.1rem 0.5rem",
                      borderRadius: "2px",
                      background:
                        item.newsType === "site_update"
                          ? "rgba(0,180,120,0.15)"
                          : "rgba(200,0,90,0.12)",
                      color:
                        item.newsType === "site_update"
                          ? "#00a868"
                          : "var(--sc-sakura)",
                    }}
                  >
                    {item.newsType === "site_update" ? "SITE UPDATE" : "PERSONAL"}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--sc-font-mono)",
                      fontSize: "11px",
                      color: "var(--sc-muted)",
                    }}
                    className="dark:!text-neutral-500"
                  >
                    {item.publishedAt
                      ? new Date(item.publishedAt).toLocaleDateString("ja-JP")
                      : new Date(item.createdAt).toLocaleDateString("ja-JP")}
                  </span>
                </div>
                <h2
                  style={{
                    fontFamily: "var(--sc-font-jp)",
                    fontWeight: 700,
                    fontSize: "1rem",
                    color: "var(--sc-text)",
                    margin: 0,
                    marginBottom: item.excerpt ? "0.4rem" : 0,
                  }}
                  className="dark:!text-neutral-100"
                >
                  {item.title}
                </h2>
                {item.excerpt && (
                  <p
                    style={{
                      fontFamily: "var(--sc-font-jp)",
                      fontSize: "13px",
                      color: "var(--sc-muted)",
                      margin: 0,
                      lineHeight: 1.6,
                    }}
                    className="dark:!text-neutral-400"
                  >
                    {item.excerpt}
                  </p>
                )}
              </article>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
