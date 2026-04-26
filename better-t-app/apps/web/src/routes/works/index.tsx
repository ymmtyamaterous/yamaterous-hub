import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";

import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/works/")({
  component: WorksPage,
});

function WorksPage() {
  const { data: works = [], isLoading } = useQuery(orpc.works.list.queryOptions());
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "3rem clamp(1rem, 4vw, 2rem)" }}>
      {/* ページタイトル */}
      <div style={{ marginBottom: "3rem" }}>
        <div
          style={{
            fontFamily: "var(--sc-font-mono)",
            fontSize: "12px",
            letterSpacing: "0.18em",
            color: "var(--sc-cyber)",
            marginBottom: "0.5rem",
          }}
        >
          // PORTFOLIO
        </div>
        <h1
          style={{
            fontFamily: "var(--sc-font-jp)",
            fontWeight: 900,
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            color: "var(--sc-text)",
            lineHeight: 1.1,
          }}
          className="dark:!text-neutral-100"
        >
          <span style={{ color: "var(--sc-sakura)" }}>W</span>ORKS
        </h1>
        <p
          style={{
            fontFamily: "var(--sc-font-mono)",
            fontSize: "13px",
            color: "var(--sc-muted)",
            marginTop: "0.5rem",
          }}
          className="dark:!text-neutral-400"
        >
          自作サイト・Webアプリの一覧
        </p>
      </div>

      {/* 作品グリッド */}
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
      ) : works.length === 0 ? (
        <div
          style={{
            fontFamily: "var(--sc-font-mono)",
            fontSize: "13px",
            color: "var(--sc-muted)",
            padding: "4rem 0",
            textAlign: "center",
          }}
        >
          作品はまだありません
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(300px, 100%), 1fr))",
            gap: "1.5rem",
          }}
        >
          {works.map((w) => (
            // biome-ignore lint/a11y/useKeyWithClickEvents: カード全体をクリックで詳細遷移
            <div
              key={w.id}
              onClick={() => navigate({ to: "/works/$workId", params: { workId: w.id } })}
              style={{ textDecoration: "none", cursor: "pointer" }}
            >
              <article
                style={{
                  background: "rgba(253,246,239,0.9)",
                  border: "1px solid rgba(200,0,90,0.12)",
                  borderRadius: "4px",
                  overflow: "hidden",
                  transition: "all 0.2s",
                  boxShadow: "0 2px 8px rgba(200,0,90,0.06)",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
                className="sc-page-card dark:!bg-neutral-800/80 dark:!border-pink-900/20 hover:!translate-y-[-2px]"
              >
                {/* サムネイル */}
                {w.thumbnailUrl ? (
                  <img
                    src={w.thumbnailUrl}
                    alt={w.title}
                    style={{ width: "100%", height: "180px", objectFit: "cover" }}
                  />
                ) : (
                  <div
                    style={{
                      height: "180px",
                      background:
                        "linear-gradient(135deg, var(--sc-sakura3), rgba(180,160,255,0.2))",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "var(--sc-font-mono)",
                      fontSize: "32px",
                      color: "var(--sc-sakura)",
                      opacity: 0.4,
                    }}
                  >
                    ◈
                  </div>
                )}

                <div style={{ padding: "1.25rem", flex: 1, display: "flex", flexDirection: "column" }}>
                  <h2
                    style={{
                      fontFamily: "var(--sc-font-jp)",
                      fontWeight: 700,
                      fontSize: "17px",
                      color: "var(--sc-text)",
                      marginBottom: "0.5rem",
                    }}
                    className="dark:!text-neutral-100"
                  >
                    {w.title}
                  </h2>
                  <p
                    style={{
                      fontFamily: "var(--sc-font-mono)",
                      fontSize: "12px",
                      color: "var(--sc-muted)",
                      lineHeight: 1.7,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      flex: 1,
                    }}
                    className="dark:!text-neutral-400"
                  >
                    {w.description}
                  </p>

                  {/* タグ */}
                  {w.tags.length > 0 && (
                    <div
                      style={{
                        marginTop: "0.75rem",
                        display: "flex",
                        gap: "0.4rem",
                        flexWrap: "wrap",
                      }}
                    >
                      {w.tags.map((t) => (
                        <span key={t.id} className="sc-tag">
                          {t.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* リンクアイコン */}
                  <div
                    style={{
                      marginTop: "0.75rem",
                      display: "flex",
                      gap: "0.75rem",
                    }}
                  >
                    {w.siteUrl && (
                      <a
                        href={w.siteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          fontFamily: "var(--sc-font-mono)",
                          fontSize: "11px",
                          color: "var(--sc-sakura)",
                          textDecoration: "none",
                          letterSpacing: "0.06em",
                        }}
                        className="hover:underline"
                      >
                        Site ↗
                      </a>
                    )}
                    {w.repositoryUrl && (
                      <a
                        href={w.repositoryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          fontFamily: "var(--sc-font-mono)",
                          fontSize: "11px",
                          color: "var(--sc-cyber)",
                          textDecoration: "none",
                          letterSpacing: "0.06em",
                        }}
                        className="hover:underline"
                      >
                        Repo ↗
                      </a>
                    )}
                  </div>
                </div>
              </article>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
