import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  const profileQuery = useQuery(orpc.profile.get.queryOptions());
  const worksQuery = useQuery(orpc.works.list.queryOptions());

  const profile = profileQuery.data;
  const featuredWorks = worksQuery.data?.slice(0, 3) ?? [];

  return (
    <div style={{ position: "relative", overflow: "hidden" }}>
      {/* Hero Section */}
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          padding: "0 3rem",
          position: "relative",
        }}
      >
        {/* 縦ライン装飾 */}
        {[20, 50, 80].map((left, i) => (
          <div
            key={left}
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: `${left}%`,
              width: "1px",
              background:
                "linear-gradient(180deg, transparent 0%, #c8005a 40%, #005fa8 70%, transparent 100%)",
              opacity: 0.08,
              animation: `sc-vscan 6s ease-in-out infinite`,
              animationDelay: `${i * 2}s`,
            }}
          />
        ))}

        <div style={{ position: "relative", zIndex: 10, maxWidth: "700px" }}>
          {/* システム起動テキスト */}
          <div
            style={{
              fontFamily: "var(--sc-font-mono)",
              fontSize: "12px",
              letterSpacing: "0.18em",
              color: "var(--sc-cyber)",
              marginBottom: "1.2rem",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              fontWeight: 600,
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "var(--sc-cyber)",
                display: "inline-block",
                animation: "sc-pulse 2s ease-in-out infinite",
              }}
            />
            SYSTEM ONLINE / ポートフォリオ
          </div>

          {/* 名前 */}
          <h1
            style={{
              fontFamily: "var(--sc-font-jp)",
              fontWeight: 900,
              fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
              lineHeight: 1.05,
              letterSpacing: "-0.01em",
              color: "var(--sc-text)",
              marginBottom: "1rem",
            }}
            className="dark:!text-neutral-100"
          >
            {profile?.displayName ?? (
              <span style={{ color: "var(--sc-muted)", fontWeight: 300 }}>
                Loading...
              </span>
            )}
          </h1>

          {/* bio */}
          {profile?.bio && (
            <p
              style={{
                fontFamily: "var(--sc-font-mono)",
                fontSize: "15px",
                lineHeight: 1.9,
                color: "var(--sc-muted)",
                maxWidth: "560px",
                marginBottom: "2rem",
                whiteSpace: "pre-wrap",
              }}
              className="dark:!text-neutral-400"
            >
              {profile.bio}
            </p>
          )}

          {/* SNS リンク */}
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            {profile?.githubUrl && (
              <a
                href={profile.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: "var(--sc-font-mono)",
                  fontSize: "12px",
                  letterSpacing: "0.1em",
                  color: "#fff",
                  background: "var(--sc-sakura)",
                  padding: "0.5rem 1.2rem",
                  borderRadius: "2px",
                  textDecoration: "none",
                  fontWeight: 700,
                  boxShadow: "0 2px 12px rgba(200,0,90,0.3)",
                }}
              >
                GITHUB ↗
              </a>
            )}
            {profile?.twitterUrl && (
              <a
                href={profile.twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: "var(--sc-font-mono)",
                  fontSize: "12px",
                  letterSpacing: "0.1em",
                  color: "var(--sc-cyber)",
                  background: "transparent",
                  padding: "0.5rem 1.2rem",
                  borderRadius: "2px",
                  textDecoration: "none",
                  fontWeight: 700,
                  border: "1px solid var(--sc-cyber)",
                }}
              >
                X / TWITTER ↗
              </a>
            )}
            {profile?.siteUrl && (
              <a
                href={profile.siteUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: "var(--sc-font-mono)",
                  fontSize: "12px",
                  letterSpacing: "0.1em",
                  color: "var(--sc-sakura)",
                  background: "transparent",
                  padding: "0.5rem 1.2rem",
                  borderRadius: "2px",
                  textDecoration: "none",
                  fontWeight: 700,
                  border: "1px solid var(--sc-sakura)",
                }}
              >
                WEBSITE ↗
              </a>
            )}
          </div>
        </div>
      </section>

      {/* 注目作品セクション */}
      {featuredWorks.length > 0 && (
        <section
          style={{
            padding: "4rem 3rem",
            background: "rgba(247,237,227,0.5)",
            position: "relative",
            zIndex: 1,
          }}
          className="dark:!bg-neutral-900/40"
        >
          <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: "2rem",
              }}
            >
              <h2
                style={{
                  fontFamily: "var(--sc-font-mono)",
                  fontSize: "14px",
                  letterSpacing: "0.2em",
                  color: "var(--sc-sakura)",
                  fontWeight: 700,
                }}
              >
                // FEATURED WORKS
              </h2>
              <Link
                to="/works"
                style={{
                  fontFamily: "var(--sc-font-mono)",
                  fontSize: "12px",
                  letterSpacing: "0.1em",
                  color: "var(--sc-cyber)",
                  textDecoration: "none",
                }}
                className="hover:underline"
              >
                作品を全て見る →
              </Link>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {featuredWorks.map((w) => (
                <Link
                  key={w.id}
                  to="/works/$workId"
                  params={{ workId: w.id }}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    style={{
                      background: "rgba(253,246,239,0.9)",
                      border: "1px solid rgba(200,0,90,0.12)",
                      borderRadius: "4px",
                      overflow: "hidden",
                      transition: "all 0.2s",
                      boxShadow: "0 2px 8px rgba(200,0,90,0.06)",
                    }}
                    className="dark:!bg-neutral-800/80 dark:!border-pink-900/20 hover:!shadow-[0_4px_20px_rgba(200,0,90,0.15)]"
                  >
                    {w.thumbnailUrl ? (
                      <img
                        src={w.thumbnailUrl}
                        alt={w.title}
                        style={{
                          width: "100%",
                          height: "160px",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          height: "160px",
                          background:
                            "linear-gradient(135deg, var(--sc-sakura3), rgba(180,160,255,0.2))",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontFamily: "var(--sc-font-mono)",
                          fontSize: "24px",
                          color: "var(--sc-sakura)",
                          opacity: 0.4,
                        }}
                      >
                        ◈
                      </div>
                    )}
                    <div style={{ padding: "1rem" }}>
                      <h3
                        style={{
                          fontFamily: "var(--sc-font-jp)",
                          fontWeight: 700,
                          fontSize: "16px",
                          color: "var(--sc-text)",
                          marginBottom: "0.5rem",
                        }}
                        className="dark:!text-neutral-100"
                      >
                        {w.title}
                      </h3>
                      <p
                        style={{
                          fontFamily: "var(--sc-font-mono)",
                          fontSize: "12px",
                          color: "var(--sc-muted)",
                          lineHeight: 1.6,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                        className="dark:!text-neutral-400"
                      >
                        {w.description}
                      </p>
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
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <style>{`
        @keyframes sc-vscan {
          0%, 100% { opacity: 0.06; }
          50% { opacity: 0.14; }
        }
        @keyframes sc-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
