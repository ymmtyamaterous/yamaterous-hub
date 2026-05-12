import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useState } from "react";

import { orpc } from "@/utils/orpc";

type TabType = "site_update" | "personal";

const TABS: { key: TabType; label: string }[] = [
  { key: "site_update", label: "サイト更新情報" },
  { key: "personal", label: "個人的ニュース" },
];

function NewsItem({ item }: { item: { id: string; slug: string; title: string; excerpt: string | null; publishedAt: string | null; createdAt: string; newsType: string } }) {
  return (
    <Link
      to="/news/$slug"
      params={{ slug: item.slug }}
      style={{ textDecoration: "none" }}
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
  );
}

export function LatestNewsSection() {
  const [activeTab, setActiveTab] = useState<TabType>("site_update");

  const { data: siteUpdateNews = [] } = useQuery(
    orpc.news.list.queryOptions({
      input: { newsType: "site_update", sortBy: "publishedAt", order: "desc" },
    }),
  );
  const { data: personalNews = [] } = useQuery(
    orpc.news.list.queryOptions({
      input: { newsType: "personal", sortBy: "publishedAt", order: "desc" },
    }),
  );

  const siteUpdateItems = siteUpdateNews.slice(0, 3);
  const personalItems = personalNews.slice(0, 3);

  if (siteUpdateItems.length === 0 && personalItems.length === 0) return null;

  const currentItems = activeTab === "site_update" ? siteUpdateItems : personalItems;

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
            marginBottom: "2rem",
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

        {/* タブ */}
        <div
          style={{
            display: "flex",
            gap: "0",
            marginBottom: "1.5rem",
            borderBottom: "1px solid rgba(200,0,90,0.15)",
          }}
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            const count = tab.key === "site_update" ? siteUpdateItems.length : personalItems.length;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                style={{
                  fontFamily: "var(--sc-font-mono)",
                  fontSize: "11px",
                  letterSpacing: "0.08em",
                  padding: "0.6rem 1.2rem",
                  border: "none",
                  borderBottom: isActive
                    ? "2px solid var(--sc-sakura)"
                    : "2px solid transparent",
                  background: "transparent",
                  color: isActive ? "var(--sc-sakura)" : "var(--sc-muted)",
                  cursor: "pointer",
                  transition: "color 0.15s, border-color 0.15s",
                  marginBottom: "-1px",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                }}
              >
                {tab.label}
                {count > 0 && (
                  <span
                    style={{
                      fontSize: "9px",
                      padding: "1px 5px",
                      borderRadius: "9999px",
                      background: isActive
                        ? "var(--sc-sakura)"
                        : "rgba(200,0,90,0.12)",
                      color: isActive ? "#fff" : "var(--sc-muted)",
                      transition: "background 0.15s, color 0.15s",
                    }}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ニュース一覧 */}
        {currentItems.length > 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            {currentItems.map((item) => (
              <NewsItem key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div
            style={{
              fontFamily: "var(--sc-font-mono)",
              fontSize: "12px",
              color: "var(--sc-muted)",
              padding: "2rem 0",
              textAlign: "center",
            }}
          >
            // no entries
          </div>
        )}
      </div>
    </section>
  );
}
