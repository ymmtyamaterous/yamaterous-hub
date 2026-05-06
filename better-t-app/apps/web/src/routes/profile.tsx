import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";

import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { data: profile, isLoading } = useQuery(orpc.profile.get.queryOptions());

  if (isLoading) {
    return (
      <div
        style={{
          maxWidth: "760px",
          margin: "0 auto",
          padding: "6rem 2rem",
          fontFamily: "var(--sc-font-mono)",
          fontSize: "13px",
          color: "var(--sc-muted)",
        }}
      >
        Loading...
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div style={{ maxWidth: "760px", margin: "0 auto", padding: "5rem clamp(1rem, 4vw, 2rem) 4rem" }}>
      {/* セクションラベル */}
      <div
        style={{
          fontFamily: "var(--sc-font-mono)",
          fontSize: "11px",
          letterSpacing: "0.2em",
          color: "var(--sc-cyber)",
          marginBottom: "0.5rem",
        }}
      >
        // PROFILE
      </div>

      {/* タイトル */}
      <h1
        style={{
          fontFamily: "var(--sc-font-jp)",
          fontWeight: 900,
          fontSize: "clamp(2rem, 5vw, 3rem)",
          color: "var(--sc-text)",
          lineHeight: 1.1,
          marginBottom: "3rem",
        }}
        className="dark:!text-neutral-100"
      >
        <span style={{ color: "var(--sc-sakura)" }}>P</span>ROFILE
      </h1>

      {/* カード */}
      <div
        style={{
          background: "rgba(253,246,239,0.9)",
          border: "1px solid rgba(200,0,90,0.12)",
          borderRadius: "6px",
          overflow: "hidden",
        }}
        className="dark:!bg-neutral-800/80 dark:!border-pink-900/20"
      >
        {/* アクセント上部ライン */}
        <div
          style={{
            height: "3px",
            background: "linear-gradient(90deg, var(--sc-sakura), var(--sc-cyber))",
          }}
        />

        <div style={{ padding: "2.5rem clamp(1.25rem, 4vw, 2.5rem)" }}>
          {/* アバター + 名前エリア */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1.75rem",
              marginBottom: "2rem",
              flexWrap: "wrap",
            }}
          >
            {/* アバター */}
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.displayName}
                style={{
                  width: "96px",
                  height: "96px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "3px solid rgba(200,0,90,0.25)",
                  flexShrink: 0,
                }}
              />
            ) : (
              <div
                style={{
                  width: "96px",
                  height: "96px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, var(--sc-sakura), var(--sc-cyber))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  fontSize: "2.2rem",
                  fontWeight: 900,
                  color: "#fff",
                  fontFamily: "var(--sc-font-mono)",
                }}
              >
                {profile.displayName.charAt(0).toUpperCase()}
              </div>
            )}

            {/* 名前 */}
            <div>
              <div
                style={{
                  fontFamily: "var(--sc-font-mono)",
                  fontSize: "10px",
                  letterSpacing: "0.18em",
                  color: "var(--sc-muted)",
                  marginBottom: "0.3rem",
                }}
              >
                DISPLAY_NAME
              </div>
              <div
                style={{
                  fontFamily: "var(--sc-font-jp)",
                  fontWeight: 900,
                  fontSize: "clamp(1.4rem, 4vw, 1.9rem)",
                  color: "var(--sc-text)",
                  lineHeight: 1.2,
                }}
                className="dark:!text-neutral-100"
              >
                {profile.displayName}
              </div>
            </div>
          </div>

          {/* 区切り線 */}
          <div
            style={{
              borderTop: "1px solid rgba(200,0,90,0.1)",
              marginBottom: "2rem",
            }}
            className="dark:!border-pink-900/20"
          />

          {/* 自己紹介 */}
          {profile.bio && (
            <div style={{ marginBottom: "2rem" }}>
              <div
                style={{
                  fontFamily: "var(--sc-font-mono)",
                  fontSize: "10px",
                  letterSpacing: "0.18em",
                  color: "var(--sc-muted)",
                  marginBottom: "0.75rem",
                }}
              >
                BIO
              </div>
              <p
                style={{
                  fontFamily: "var(--sc-font-jp)",
                  fontSize: "15px",
                  lineHeight: 1.85,
                  color: "var(--sc-text)",
                  whiteSpace: "pre-wrap",
                  margin: 0,
                }}
                className="dark:!text-neutral-300"
              >
                {profile.bio}
              </p>
            </div>
          )}

          {/* リンク */}
          {(profile.githubUrl || profile.twitterUrl || profile.siteUrl) && (
            <>
              <div
                style={{
                  borderTop: "1px solid rgba(200,0,90,0.1)",
                  marginBottom: "1.5rem",
                }}
                className="dark:!border-pink-900/20"
              />
              <div
                style={{
                  fontFamily: "var(--sc-font-mono)",
                  fontSize: "10px",
                  letterSpacing: "0.18em",
                  color: "var(--sc-muted)",
                  marginBottom: "0.75rem",
                }}
              >
                LINKS
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
                {profile.githubUrl && (
                  <a
                    href={profile.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      fontFamily: "var(--sc-font-mono)",
                      fontSize: "12px",
                      letterSpacing: "0.06em",
                      color: "var(--sc-text)",
                      textDecoration: "none",
                      padding: "0.5rem 1rem",
                      border: "1px solid rgba(200,0,90,0.2)",
                      borderRadius: "3px",
                      background: "rgba(200,0,90,0.04)",
                      transition: "all 0.15s",
                    }}
                    className="dark:!text-neutral-200 dark:!border-pink-900/30 hover:!border-[var(--sc-sakura)] hover:!text-[var(--sc-sakura)]"
                  >
                    <ExternalLink size={13} />
                    GitHub
                  </a>
                )}
                {profile.twitterUrl && (
                  <a
                    href={profile.twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      fontFamily: "var(--sc-font-mono)",
                      fontSize: "12px",
                      letterSpacing: "0.06em",
                      color: "var(--sc-text)",
                      textDecoration: "none",
                      padding: "0.5rem 1rem",
                      border: "1px solid rgba(200,0,90,0.2)",
                      borderRadius: "3px",
                      background: "rgba(200,0,90,0.04)",
                      transition: "all 0.15s",
                    }}
                    className="dark:!text-neutral-200 dark:!border-pink-900/30 hover:!border-[var(--sc-cyber)] hover:!text-[var(--sc-cyber)]"
                  >
                    <ExternalLink size={13} />
                    Twitter / X
                  </a>
                )}
                {profile.siteUrl && (
                  <a
                    href={profile.siteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      fontFamily: "var(--sc-font-mono)",
                      fontSize: "12px",
                      letterSpacing: "0.06em",
                      color: "var(--sc-text)",
                      textDecoration: "none",
                      padding: "0.5rem 1rem",
                      border: "1px solid rgba(200,0,90,0.2)",
                      borderRadius: "3px",
                      background: "rgba(200,0,90,0.04)",
                      transition: "all 0.15s",
                    }}
                    className="dark:!text-neutral-200 dark:!border-pink-900/30 hover:!border-[var(--sc-cyber)] hover:!text-[var(--sc-cyber)]"
                  >
                    <ExternalLink size={13} />
                    Website
                  </a>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
