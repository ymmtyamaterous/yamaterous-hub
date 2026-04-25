import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { data: works = [] } = useQuery(orpc.works.adminList.queryOptions());

  const totalWorks = works.length;
  const publishedWorks = works.filter((w) => w.isPublished).length;

  const stats = [
    { label: "作品数", value: totalWorks, color: "var(--sc-cyber)" },
    { label: "公開中", value: publishedWorks, color: "var(--sc-sakura)" },
    {
      label: "非公開",
      value: totalWorks - publishedWorks,
      color: "var(--sc-muted)",
    },
  ];

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

      {/* 統計カード */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: "1rem",
          marginBottom: "3rem",
        }}
      >
        {stats.map((s) => (
          <div
            key={s.label}
            style={{
              background: "rgba(253,246,239,0.9)",
              border: "1px solid rgba(200,0,90,0.12)",
              borderRadius: "4px",
              padding: "1.5rem",
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
                marginBottom: "0.5rem",
              }}
              className="dark:!text-neutral-500"
            >
              {s.label}
            </div>
            <div
              style={{
                fontFamily: "var(--sc-font-mono)",
                fontSize: "2.5rem",
                fontWeight: 700,
                color: s.color,
                lineHeight: 1,
              }}
            >
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* 最近の作品 */}
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
