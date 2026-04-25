import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/works/$workId")({
  component: WorkDetailPage,
});

function WorkDetailPage() {
  const { workId } = Route.useParams();
  const { data: work, isLoading, isError } = useQuery(
    orpc.works.getById.queryOptions({ input: { id: workId } }),
  );

  if (isLoading) {
    return (
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: "3rem 2rem",
          fontFamily: "var(--sc-font-mono)",
          color: "var(--sc-muted)",
          fontSize: "13px",
        }}
      >
        Loading...
      </div>
    );
  }

  if (isError || !work) {
    return (
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: "3rem 2rem",
          fontFamily: "var(--sc-font-mono)",
          color: "var(--sc-cyber3)",
          fontSize: "13px",
        }}
      >
        作品が見つかりませんでした。
        <Link to="/works" style={{ marginLeft: "1rem", color: "var(--sc-sakura)" }}>
          ← 一覧に戻る
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "3rem 2rem" }}>
      {/* 戻るリンク */}
      <Link
        to="/works"
        style={{
          fontFamily: "var(--sc-font-mono)",
          fontSize: "12px",
          letterSpacing: "0.1em",
          color: "var(--sc-sakura)",
          textDecoration: "none",
          display: "inline-flex",
          alignItems: "center",
          gap: "0.4rem",
          marginBottom: "2rem",
        }}
        className="hover:underline"
      >
        ← 一覧に戻る
      </Link>

      {/* サムネイル */}
      {work.thumbnailUrl ? (
        <img
          src={work.thumbnailUrl}
          alt={work.title}
          style={{
            width: "100%",
            maxHeight: "400px",
            objectFit: "cover",
            borderRadius: "4px",
            marginBottom: "2rem",
            border: "1px solid rgba(200,0,90,0.12)",
          }}
        />
      ) : (
        <div
          style={{
            height: "240px",
            background:
              "linear-gradient(135deg, var(--sc-sakura3), rgba(180,160,255,0.2))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--sc-font-mono)",
            fontSize: "48px",
            color: "var(--sc-sakura)",
            opacity: 0.4,
            borderRadius: "4px",
            marginBottom: "2rem",
          }}
        >
          ◈
        </div>
      )}

      {/* タイトル */}
      <h1
        style={{
          fontFamily: "var(--sc-font-jp)",
          fontWeight: 900,
          fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
          color: "var(--sc-text)",
          lineHeight: 1.2,
          marginBottom: "1rem",
        }}
        className="dark:!text-neutral-100"
      >
        {work.title}
      </h1>

      {/* タグ */}
      {work.tags.length > 0 && (
        <div
          style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "0.75rem" }}
        >
          {work.tags.map((t) => (
            <span key={t.id} className="sc-tag">
              {t.name}
            </span>
          ))}
        </div>
      )}

      {/* 公開日 */}
      {work.publishedAt && (
        <p
          style={{
            fontFamily: "var(--sc-font-mono)",
            fontSize: "11px",
            color: "var(--sc-muted)",
            letterSpacing: "0.08em",
            marginBottom: "2rem",
          }}
          className="dark:!text-neutral-500"
        >
          {new Date(work.publishedAt).toLocaleDateString("ja-JP")} 公開
        </p>
      )}

      {/* 説明文 */}
      <div
        style={{
          fontFamily: "var(--sc-font-jp)",
          fontSize: "15px",
          lineHeight: 1.9,
          color: "var(--sc-text)",
          marginBottom: "2.5rem",
          whiteSpace: "pre-wrap",
          borderTop: "1px solid rgba(200,0,90,0.1)",
          paddingTop: "1.5rem",
        }}
        className="dark:!text-neutral-300"
      >
        {work.description}
      </div>

      {/* リンクボタン */}
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        {work.siteUrl && (
          <a
            href={work.siteUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: "var(--sc-font-mono)",
              fontSize: "12px",
              letterSpacing: "0.1em",
              color: "#fff",
              background: "var(--sc-sakura)",
              padding: "0.5rem 1.4rem",
              borderRadius: "2px",
              textDecoration: "none",
              fontWeight: 700,
              boxShadow: "0 2px 12px rgba(200,0,90,0.3)",
            }}
          >
            サイトを見る ↗
          </a>
        )}
        {work.repositoryUrl && (
          <a
            href={work.repositoryUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: "var(--sc-font-mono)",
              fontSize: "12px",
              letterSpacing: "0.1em",
              color: "var(--sc-cyber)",
              background: "transparent",
              padding: "0.5rem 1.4rem",
              borderRadius: "2px",
              textDecoration: "none",
              fontWeight: 700,
              border: "1px solid var(--sc-cyber)",
            }}
          >
            ソースを見る ↗
          </a>
        )}
      </div>
    </div>
  );
}
