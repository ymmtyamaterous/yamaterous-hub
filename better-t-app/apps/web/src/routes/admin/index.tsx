import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

// ── 小コンポーネント ──────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  color,
  sub,
}: {
  label: string;
  value: number | string;
  color: string;
  sub?: string;
}) {
  return (
    <div
      style={{
        background: "rgba(253,246,239,0.9)",
        border: "1px solid rgba(200,0,90,0.12)",
        borderRadius: "4px",
        padding: "1.25rem 1.5rem",
        boxShadow: "0 2px 8px rgba(200,0,90,0.04)",
      }}
      className="dark:!bg-neutral-800/80 dark:!border-pink-900/20"
    >
      <div
        style={{
          fontFamily: "var(--sc-font-mono)",
          fontSize: "10px",
          letterSpacing: "0.15em",
          color: "var(--sc-muted)",
          marginBottom: "0.4rem",
        }}
        className="dark:!text-neutral-500"
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "var(--sc-font-mono)",
          fontSize: "2.2rem",
          fontWeight: 700,
          color,
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      {sub && (
        <div
          style={{
            fontFamily: "var(--sc-font-mono)",
            fontSize: "10px",
            color: "var(--sc-muted)",
            marginTop: "0.3rem",
          }}
          className="dark:!text-neutral-500"
        >
          {sub}
        </div>
      )}
    </div>
  );
}

type SortMode = "total" | "admin" | "public";

const SORT_OPTIONS: { mode: SortMode; label: string }[] = [
  { mode: "total", label: "総計" },
  { mode: "admin", label: "管理者" },
  { mode: "public", label: "一般" },
];

function RankingTable({
  title,
  rows,
  labelKey,
  countKey,
  adminCountKey,
  publicCountKey,
}: {
  title: string;
  rows: Record<string, unknown>[];
  labelKey: string;
  countKey: string;
  adminCountKey?: string;
  publicCountKey?: string;
}) {
  const [sortMode, setSortMode] = useState<SortMode>("total");

  const getSortKey = (mode: SortMode) => {
    if (mode === "admin" && adminCountKey) return adminCountKey;
    if (mode === "public" && publicCountKey) return publicCountKey;
    return countKey;
  };

  const sortedRows =
    adminCountKey && publicCountKey
      ? [...rows].sort((a, b) => {
          const key = getSortKey(sortMode);
          return (Number(b[key]) ?? 0) - (Number(a[key]) ?? 0);
        })
      : rows;

  const activeSortKey = getSortKey(sortMode);

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "0.75rem",
          flexWrap: "wrap",
          gap: "0.5rem",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--sc-font-mono)",
            fontSize: "11px",
            letterSpacing: "0.15em",
            color: "var(--sc-sakura)",
          }}
        >
          {title}
        </h2>
        {adminCountKey && publicCountKey && (
          <div
            style={{
              display: "flex",
              gap: "0.25rem",
            }}
          >
            {SORT_OPTIONS.map(({ mode, label }) => (
              <button
                key={mode}
                type="button"
                onClick={() => setSortMode(mode)}
                style={{
                  fontFamily: "var(--sc-font-mono)",
                  fontSize: "10px",
                  letterSpacing: "0.08em",
                  padding: "0.2rem 0.6rem",
                  border: "1px solid",
                  borderRadius: "3px",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  borderColor:
                    sortMode === mode
                      ? "var(--sc-cyber)"
                      : "rgba(200,0,90,0.2)",
                  background:
                    sortMode === mode
                      ? "var(--sc-cyber)"
                      : "transparent",
                  color:
                    sortMode === mode ? "#fff" : "var(--sc-muted)",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
      <div
        style={{
          background: "rgba(253,246,239,0.9)",
          border: "1px solid rgba(200,0,90,0.12)",
          borderRadius: "4px",
          overflow: "hidden",
        }}
        className="dark:!bg-neutral-800/80 dark:!border-pink-900/20"
      >
        {sortedRows.length === 0 ? (
          <div
            style={{
              padding: "1.5rem",
              textAlign: "center",
              fontFamily: "var(--sc-font-mono)",
              fontSize: "12px",
              color: "var(--sc-muted)",
            }}
          >
            データなし
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              {sortedRows.map((row, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: ランキング行はインデックスで管理
                <tr
                  key={i}
                  style={{ borderBottom: "1px solid rgba(200,0,90,0.06)" }}
                >
                  <td
                    style={{
                      padding: "0.6rem 1rem",
                      fontFamily: "var(--sc-font-mono)",
                      fontSize: "11px",
                      color: "var(--sc-muted)",
                      width: "2rem",
                    }}
                    className="dark:!text-neutral-500"
                  >
                    {i + 1}
                  </td>
                  <td
                    style={{
                      padding: "0.6rem 0.5rem",
                      fontFamily: "var(--sc-font-jp)",
                      fontSize: "13px",
                      color: "var(--sc-text)",
                      wordBreak: "break-all",
                    }}
                    className="dark:!text-neutral-200"
                  >
                    {String(row[labelKey])}
                  </td>
                  <td
                    style={{
                      padding: "0.6rem 1rem",
                      fontFamily: "var(--sc-font-mono)",
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "var(--sc-cyber)",
                      textAlign: "right",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {String(row[activeSortKey])}
                  </td>
                  {adminCountKey && publicCountKey && (
                    <td
                      style={{
                        padding: "0.6rem 1rem",
                        fontFamily: "var(--sc-font-mono)",
                        fontSize: "11px",
                        color: "var(--sc-muted)",
                        textAlign: "right",
                        whiteSpace: "nowrap",
                      }}
                      className="dark:!text-neutral-500"
                    >
                      <span style={{ color: "var(--sc-sakura)" }}>
                        管理者:{String(row[adminCountKey])}
                      </span>
                      {" / "}
                      <span>一般:{String(row[publicCountKey])}</span>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ── メインコンポーネント ──────────────────────────────────────────────────────

function AdminDashboard() {
  const { data: works = [] } = useQuery(orpc.works.adminList.queryOptions());
  const { data: podcasts = [] } = useQuery(orpc.podcasts.adminList.queryOptions());
  const { data: analytics, isLoading: analyticsLoading } = useQuery(
    orpc.analytics.getStats.queryOptions(),
  );

  const totalWorks = works.length;
  const publishedWorks = works.filter((w) => w.isPublished).length;
  const totalPodcasts = podcasts.length;
  const publishedPodcasts = podcasts.filter((p) => p.isPublished).length;

  return (
    <div>
      <div
        style={{
          fontFamily: "var(--sc-font-mono)",
          fontSize: "10px",
          letterSpacing: "0.2em",
          color: "var(--sc-cyber)",
          marginBottom: "0.5rem",
        }}
      >
        // OVERVIEW
      </div>
      <h1
        style={{
          fontFamily: "var(--sc-font-jp)",
          fontWeight: 900,
          fontSize: "1.8rem",
          color: "var(--sc-text)",
          marginBottom: "2rem",
        }}
        className="dark:!text-neutral-100"
      >
        ダッシュボード
      </h1>

      {/* ── コンテンツ統計 ── */}
      <div
        style={{
          fontFamily: "var(--sc-font-mono)",
          fontSize: "11px",
          letterSpacing: "0.15em",
          color: "var(--sc-sakura)",
          marginBottom: "0.75rem",
        }}
      >
        // CONTENT
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: "1rem",
          marginBottom: "2.5rem",
        }}
      >
        <StatCard label="作品数" value={totalWorks} color="var(--sc-cyber)" />
        <StatCard label="公開中" value={publishedWorks} color="var(--sc-sakura)" />
        <StatCard
          label="非公開"
          value={totalWorks - publishedWorks}
          color="var(--sc-muted)"
        />
        <StatCard label="Podcast 数" value={totalPodcasts} color="var(--sc-cyber)" />
        <StatCard label="Podcast 公開中" value={publishedPodcasts} color="var(--sc-sakura)" />
      </div>

      {/* ── アクセス統計 ── */}
      <div
        style={{
          fontFamily: "var(--sc-font-mono)",
          fontSize: "11px",
          letterSpacing: "0.15em",
          color: "var(--sc-sakura)",
          marginBottom: "0.75rem",
        }}
      >
        // ACCESS METRICS
      </div>
      {analyticsLoading ? (
        <div
          style={{
            fontFamily: "var(--sc-font-mono)",
            fontSize: "12px",
            color: "var(--sc-muted)",
            marginBottom: "2.5rem",
          }}
        >
          Loading...
        </div>
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
              gap: "1rem",
              marginBottom: "2.5rem",
            }}
          >
            <StatCard
              label="総PV数"
              value={analytics?.totalPageViews ?? 0}
              color="var(--sc-cyber)"
            />
            <StatCard
              label="管理者PV"
              value={analytics?.adminPageViews ?? 0}
              color="var(--sc-sakura)"
              sub="管理者によるアクセス"
            />
            <StatCard
              label="一般PV"
              value={analytics?.publicPageViews ?? 0}
              color="var(--sc-cyber)"
              sub="一般ユーザーによるアクセス"
            />
            <StatCard
              label="今日のPV"
              value={analytics?.todayPageViews ?? 0}
              color="var(--sc-sakura)"
              sub="過去24時間"
            />
            <StatCard
              label="今週のPV"
              value={analytics?.weekPageViews ?? 0}
              color="var(--sc-muted)"
              sub="過去7日間"
            />
          </div>

          {/* ランキング */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(min(320px, 100%), 1fr))",
              gap: "2rem",
              marginBottom: "3rem",
            }}
          >
            <RankingTable
              title="// TOP PAGES"
              rows={(analytics?.topPaths ?? []) as Record<string, unknown>[]}
              labelKey="path"
              countKey="count"
              adminCountKey="adminCount"
              publicCountKey="publicCount"
            />
            <RankingTable
              title="// TOP WORK CLICKS"
              rows={(analytics?.topWorkClicks ?? []) as Record<string, unknown>[]}
              labelKey="targetTitle"
              countKey="count"
              adminCountKey="adminCount"
              publicCountKey="publicCount"
            />
            <RankingTable
              title="// TOP POST CLICKS"
              rows={(analytics?.topPostClicks ?? []) as Record<string, unknown>[]}
              labelKey="targetTitle"
              countKey="count"
              adminCountKey="adminCount"
              publicCountKey="publicCount"
            />
          </div>
        </>
      )}

      {/* ── 最近の作品 ── */}
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--sc-font-mono)",
              fontSize: "12px",
              letterSpacing: "0.15em",
              color: "var(--sc-sakura)",
            }}
          >
            // RECENT WORKS
          </h2>
          <Link
            to="/admin/works"
            style={{
              fontFamily: "var(--sc-font-mono)",
              fontSize: "11px",
              color: "var(--sc-cyber)",
              textDecoration: "none",
              letterSpacing: "0.08em",
            }}
            className="hover:underline"
          >
            すべて見る →
          </Link>
        </div>

        <div
          style={{
            background: "rgba(253,246,239,0.9)",
            border: "1px solid rgba(200,0,90,0.12)",
            borderRadius: "4px",
            overflow: "hidden",
          }}
          className="dark:!bg-neutral-800/80 dark:!border-pink-900/20"
        >
          {works.length === 0 ? (
            <div
              style={{
                padding: "2rem",
                textAlign: "center",
                fontFamily: "var(--sc-font-mono)",
                fontSize: "13px",
                color: "var(--sc-muted)",
              }}
            >
              作品がまだありません。{" "}
              <Link
                to="/admin/works/new"
                style={{ color: "var(--sc-sakura)" }}
                className="hover:underline"
              >
                追加する →
              </Link>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr
                  style={{
                    borderBottom: "1px solid rgba(200,0,90,0.1)",
                    background: "rgba(200,0,90,0.03)",
                  }}
                >
                  {["タイトル", "状態", "更新日"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "0.75rem 1rem",
                        textAlign: "left",
                        fontFamily: "var(--sc-font-mono)",
                        fontSize: "11px",
                        letterSpacing: "0.1em",
                        color: "var(--sc-muted)",
                        fontWeight: 600,
                      }}
                      className="dark:!text-neutral-400"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {works.slice(0, 5).map((w) => (
                  <tr
                    key={w.id}
                    style={{ borderBottom: "1px solid rgba(200,0,90,0.06)" }}
                  >
                    <td
                      style={{
                        padding: "0.75rem 1rem",
                        fontFamily: "var(--sc-font-jp)",
                        fontSize: "14px",
                        color: "var(--sc-text)",
                      }}
                      className="dark:!text-neutral-200"
                    >
                      {w.title}
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <span
                        style={{
                          fontFamily: "var(--sc-font-mono)",
                          fontSize: "11px",
                          padding: "2px 8px",
                          borderRadius: "2px",
                          color: w.isPublished ? "#fff" : "var(--sc-muted)",
                          background: w.isPublished
                            ? "var(--sc-sakura)"
                            : "rgba(0,0,0,0.06)",
                        }}
                      >
                        {w.isPublished ? "公開" : "非公開"}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "0.75rem 1rem",
                        fontFamily: "var(--sc-font-mono)",
                        fontSize: "11px",
                        color: "var(--sc-muted)",
                      }}
                      className="dark:!text-neutral-500"
                    >
                      {new Date(w.updatedAt).toLocaleDateString("ja-JP")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
