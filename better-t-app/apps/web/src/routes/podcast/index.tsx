import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/podcast/")({
  component: PodcastPage,
});

function formatDuration(seconds: number | null): string {
  if (seconds === null) return "";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
}

function PodcastPage() {
  const { data: episodes = [], isLoading } = useQuery(
    orpc.podcasts.list.queryOptions({
      input: { sortBy: "publishedAt", order: "desc" },
    }),
  );

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "0 auto",
        padding: "2rem 1.5rem",
        paddingTop: "calc(80px + 2rem)",
      }}
    >
      {/* ヘッダー */}
      <div
        style={{
          fontFamily: "var(--sc-font-mono)",
          fontSize: "10px",
          letterSpacing: "0.2em",
          color: "var(--sc-cyber)",
          marginBottom: "0.5rem",
        }}
      >
        // PODCAST
      </div>
      <h1
        style={{
          fontFamily: "var(--sc-font-jp)",
          fontWeight: 900,
          fontSize: "2rem",
          color: "var(--sc-text)",
          marginBottom: "0.5rem",
        }}
        className="dark:!text-neutral-100"
      >
        Podcast
      </h1>
      <p
        style={{
          fontFamily: "var(--sc-font-jp)",
          fontSize: "14px",
          color: "var(--sc-muted)",
          marginBottom: "3rem",
        }}
        className="dark:!text-neutral-400"
      >
        音声コンテンツ
      </p>

      {/* エピソード一覧 */}
      {isLoading ? (
        <div
          style={{
            fontFamily: "var(--sc-font-mono)",
            fontSize: "13px",
            color: "var(--sc-muted)",
            padding: "2rem 0",
          }}
        >
          Loading...
        </div>
      ) : episodes.length === 0 ? (
        <div
          style={{
            fontFamily: "var(--sc-font-mono)",
            fontSize: "13px",
            color: "var(--sc-muted)",
            padding: "3rem 0",
            textAlign: "center",
          }}
        >
          エピソードはまだありません
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {episodes.map((ep, index) => (
            <article
              key={ep.id}
              style={{
                background: "rgba(253,246,239,0.9)",
                border: "1px solid rgba(200,0,90,0.12)",
                borderRadius: "4px",
                padding: "1.5rem",
              }}
              className="dark:!bg-neutral-800/80 dark:!border-pink-900/20"
            >
              {/* エピソード番号 + タイトル */}
              <div style={{ marginBottom: "0.75rem" }}>
                <div
                  style={{
                    fontFamily: "var(--sc-font-mono)",
                    fontSize: "10px",
                    letterSpacing: "0.15em",
                    color: "var(--sc-cyber)",
                    marginBottom: "0.25rem",
                  }}
                >
                  EP.{String(episodes.length - index).padStart(3, "0")}
                  {ep.publishedAt && (
                    <span style={{ marginLeft: "1rem", color: "var(--sc-muted)" }}>
                      {new Date(ep.publishedAt).toLocaleDateString("ja-JP")}
                    </span>
                  )}
                  {ep.duration && (
                    <span style={{ marginLeft: "1rem", color: "var(--sc-muted)" }}>
                      {formatDuration(ep.duration)}
                    </span>
                  )}
                </div>
                <h2
                  style={{
                    fontFamily: "var(--sc-font-jp)",
                    fontWeight: 700,
                    fontSize: "1.2rem",
                    color: "var(--sc-text)",
                    margin: 0,
                  }}
                  className="dark:!text-neutral-100"
                >
                  {ep.title}
                </h2>
              </div>

              {/* カテゴリ */}
              {ep.categories.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "4px",
                    marginBottom: "0.75rem",
                  }}
                >
                  {ep.categories.map((c) => (
                    <span
                      key={c.id}
                      style={{
                        fontFamily: "var(--sc-font-jp)",
                        fontSize: "11px",
                        padding: "2px 8px",
                        borderRadius: "20px",
                        background: "rgba(200,0,90,0.07)",
                        color: "var(--sc-sakura)",
                        border: "1px solid rgba(200,0,90,0.15)",
                      }}
                    >
                      {c.name}
                    </span>
                  ))}
                </div>
              )}

              {/* 説明 */}
              {ep.description && (
                <p
                  style={{
                    fontFamily: "var(--sc-font-jp)",
                    fontSize: "14px",
                    color: "var(--sc-muted)",
                    lineHeight: 1.7,
                    marginBottom: "1rem",
                  }}
                  className="dark:!text-neutral-400"
                >
                  {ep.description}
                </p>
              )}

              {/* オーディオプレーヤー */}
              <audio
                controls
                src={ep.audioUrl}
                style={{
                  width: "100%",
                  height: "40px",
                  accentColor: "var(--sc-sakura)",
                }}
              >
                お使いのブラウザはオーディオ再生に対応していません。
              </audio>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
