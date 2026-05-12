import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { orpc } from "@/utils/orpc";

const NEWS_TYPE_LABELS: Record<string, string> = {
  site_update: "SITE UPDATE",
  personal: "PERSONAL",
};

export function LatestNewsSection() {
  const { data: newsList = [] } = useQuery(
    orpc.news.list.queryOptions({
      input: { sortBy: "publishedAt", order: "desc" },
    }),
  );

  const latestNews = newsList.slice(0, 3);

  if (latestNews.length === 0) return null;

  return (
    <section
      style={{
        padding: "clamp(3rem, 8vw, 6rem) clamp(1.25rem, 5vw, 3rem)",
        borderTop: "1px solid rgba(200,0,90,0.1)",
        position: "relative",
        zIndex: 1,
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div
          className="sc-s-tag sc-reveal"
          style={{
            fontFamily: "var(--sc-font-mono)",
            fontSize: "10px",
            letterSpacing: "0.25em",
            color: "var(--sc-sakura)",
            marginBottom: "1rem",
          }}
        >
          Latest Updates
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            flexWrap: "wrap",
            gap: "0.75rem",
            marginBottom: "2.5rem",
          }}
        >
          <h2
            className="sc-reveal"
            style={{
              fontFamily: "var(--sc-font-jp)",
              fontWeight: 900,
              fontSize: "clamp(2.2rem, 4vw, 3.4rem)",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
              color: "var(--sc-text)",
              margin: 0,
            }}
          >
            Recent{" "}
            <span style={{ color: "var(--sc-sakura)" }}>News</span>
          </h2>
          <Link
            to="/news"
            style={{
              fontFamily: "var(--sc-font-mono)",
              fontSize: "12px",
              letterSpacing: "0.1em",
              color: "var(--sc-cyber)",
              textDecoration: "none",
            }}
            className="hover:underline"
          >
            ニュースを全て見る →
          </Link>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          {latestNews.map((item) => (
            <Link
              key={item.id}
              to="/news/$slug"
              params={{ slug: item.slug }}
              style={{ textDecoration: "none" }}
              className="sc-reveal"
            >
              <article
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "1.25rem",
                  padding: "1.1rem 1.5rem",
                  border: "1px solid rgba(200,0,90,0.12)",
                  borderRadius: "4px",
                  background: "rgba(253,246,239,0.5)",
                  transition: "border-color 0.15s, background 0.15s",
                  flexWrap: "wrap",
                }}
                className="dark:!bg-neutral-800/40 dark:!border-pink-900/20 hover:!border-[var(--sc-sakura)] dark:hover:!border-pink-600"
              >
                {/* 日付 */}
                <div
                  style={{
                    fontFamily: "var(--sc-font-mono)",
                    fontSize: "11px",
                    color: "var(--sc-muted)",
                    whiteSpace: "nowrap",
                    paddingTop: "2px",
                    minWidth: "80px",
                  }}
                  className="dark:!text-neutral-500"
                >
                  {(item.publishedAt
                    ? new Date(item.publishedAt)
                    : new Date(item.createdAt)
                  ).toLocaleDateString("ja-JP", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  })}
                </div>

                {/* 種別バッジ */}
                <span
                  style={{
                    fontFamily: "var(--sc-font-mono)",
                    fontSize: "9px",
                    letterSpacing: "0.1em",
                    padding: "2px 7px",
                    borderRadius: "2px",
                    whiteSpace: "nowrap",
                    background:
                      item.newsType === "site_update"
                        ? "rgba(0,180,120,0.13)"
                        : "rgba(200,0,90,0.1)",
                    color:
                      item.newsType === "site_update"
                        ? "#00a868"
                        : "var(--sc-sakura)",
                    alignSelf: "center",
                  }}
                >
                  {NEWS_TYPE_LABELS[item.newsType] ?? item.newsType}
                </span>

                {/* タイトル + 概要 */}
                <div style={{ flex: 1, minWidth: "200px" }}>
                  <div
                    style={{
                      fontFamily: "var(--sc-font-jp)",
                      fontWeight: 700,
                      fontSize: "0.95rem",
                      color: "var(--sc-text)",
                      lineHeight: 1.4,
                    }}
                    className="dark:!text-neutral-100"
                  >
                    {item.title}
                  </div>
                  {item.excerpt && (
                    <div
                      style={{
                        fontFamily: "var(--sc-font-jp)",
                        fontSize: "12px",
                        color: "var(--sc-muted)",
                        marginTop: "0.2rem",
                        lineHeight: 1.5,
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: "vertical",
                      }}
                      className="dark:!text-neutral-500"
                    >
                      {item.excerpt}
                    </div>
                  )}
                </div>

                <span
                  style={{
                    fontFamily: "var(--sc-font-mono)",
                    fontSize: "11px",
                    color: "var(--sc-cyber)",
                    alignSelf: "center",
                    whiteSpace: "nowrap",
                  }}
                >
                  読む →
                </span>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
