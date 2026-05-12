import MDEditor from "@uiw/react-md-editor";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/admin/news/$newsId/")({
  component: EditNewsPage,
});

function EditNewsPage() {
  const { newsId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: item, isLoading } = useQuery(
    orpc.news.adminGet.queryOptions({ input: { id: newsId } }),
  );

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [newsType, setNewsType] = useState<"site_update" | "personal">("personal");
  const [isPublished, setIsPublished] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (item && !initialized) {
      setTitle(item.title);
      setSlug(item.slug);
      setExcerpt(item.excerpt);
      setContent(item.content);
      setNewsType(item.newsType);
      setIsPublished(item.isPublished);
      setInitialized(true);
    }
  }, [item, initialized]);

  const updateMutation = useMutation(
    orpc.news.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(orpc.news.adminList.queryOptions());
        queryClient.invalidateQueries(
          orpc.news.adminGet.queryOptions({ input: { id: newsId } }),
        );
        toast.success("ニュースを更新しました");
        navigate({ to: "/admin/news" });
      },
      onError: (err: { message?: string }) =>
        toast.error(err?.message ?? "ニュースの更新に失敗しました"),
    }),
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim()) {
      toast.error("タイトルとスラッグは必須です");
      return;
    }
    updateMutation.mutate({
      id: newsId,
      title,
      slug,
      content,
      excerpt,
      newsType,
      isPublished,
    });
  };

  const inputStyle: React.CSSProperties = {
    fontFamily: "var(--sc-font-jp)",
    fontSize: "14px",
    padding: "0.5rem 0.75rem",
    border: "1px solid rgba(200,0,90,0.2)",
    borderRadius: "3px",
    background: "rgba(253,246,239,0.8)",
    color: "var(--sc-text)",
    width: "100%",
    boxSizing: "border-box",
    outline: "none",
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "var(--sc-font-mono)",
    fontSize: "11px",
    letterSpacing: "0.1em",
    color: "var(--sc-muted)",
    marginBottom: "0.3rem",
    display: "block",
  };

  if (isLoading) {
    return (
      <div
        style={{
          fontFamily: "var(--sc-font-mono)",
          fontSize: "13px",
          color: "var(--sc-muted)",
        }}
      >
        Loading...
      </div>
    );
  }

  if (!item) {
    return (
      <div
        style={{
          fontFamily: "var(--sc-font-jp)",
          fontSize: "14px",
          color: "var(--sc-muted)",
        }}
      >
        ニュースが見つかりません
      </div>
    );
  }

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
        // EDIT NEWS
      </div>
      <h1
        style={{
          fontFamily: "var(--sc-font-jp)",
          fontWeight: 900,
          fontSize: "1.8rem",
          color: "var(--sc-text)",
          marginBottom: "1.5rem",
        }}
        className="dark:!text-neutral-100"
      >
        ニュースを編集
      </h1>

      <form onSubmit={handleSubmit} style={{ maxWidth: "860px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          {/* タイトル */}
          <div>
            <label style={labelStyle}>タイトル *</label>
            <input
              style={inputStyle}
              placeholder="ニュースのタイトル"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="dark:!bg-neutral-800/80 dark:!text-neutral-100 dark:!border-pink-900/30"
            />
          </div>

          {/* スラッグ */}
          <div>
            <label style={labelStyle}>スラッグ *</label>
            <input
              style={inputStyle}
              placeholder="url-slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              pattern="[a-z0-9\-]+"
              title="小文字英数字とハイフンのみ"
              className="dark:!bg-neutral-800/80 dark:!text-neutral-100 dark:!border-pink-900/30"
            />
          </div>

          {/* 種別 */}
          <div>
            <label style={labelStyle}>種別</label>
            <select
              style={{ ...inputStyle, cursor: "pointer" }}
              value={newsType}
              onChange={(e) => setNewsType(e.target.value as typeof newsType)}
              className="dark:!bg-neutral-800/80 dark:!text-neutral-100 dark:!border-pink-900/30"
            >
              <option value="personal">個人ニュース</option>
              <option value="site_update">サイト更新</option>
            </select>
          </div>

          {/* 概要 */}
          <div>
            <label style={labelStyle}>概要（任意）</label>
            <textarea
              style={{
                ...inputStyle,
                resize: "vertical",
                minHeight: "60px",
                fontFamily: "var(--sc-font-jp)",
              }}
              placeholder="一覧ページに表示される概要文"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="dark:!bg-neutral-800/80 dark:!text-neutral-100 dark:!border-pink-900/30"
            />
          </div>

          {/* 本文 */}
          <div>
            <label style={labelStyle}>本文（Markdown）</label>
            <div data-color-mode="light" className="dark:[&]:!data-color-mode-dark">
              <MDEditor
                value={content}
                onChange={(v) => setContent(v ?? "")}
                height={400}
              />
            </div>
          </div>

          {/* 公開設定 */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <input
              type="checkbox"
              id="isPublished"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              style={{ cursor: "pointer", width: "16px", height: "16px" }}
            />
            <label
              htmlFor="isPublished"
              style={{
                fontFamily: "var(--sc-font-jp)",
                fontSize: "14px",
                color: "var(--sc-text)",
                cursor: "pointer",
              }}
              className="dark:!text-neutral-100"
            >
              公開する
            </label>
          </div>

          {/* ボタン */}
          <div style={{ display: "flex", gap: "1rem", paddingTop: "0.5rem" }}>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              style={{
                fontFamily: "var(--sc-font-mono)",
                fontSize: "13px",
                letterSpacing: "0.08em",
                color: "#fff",
                background: updateMutation.isPending
                  ? "rgba(200,0,90,0.5)"
                  : "var(--sc-sakura)",
                padding: "0.6rem 1.8rem",
                borderRadius: "2px",
                border: "none",
                cursor: updateMutation.isPending ? "not-allowed" : "pointer",
                fontWeight: 700,
                boxShadow: "0 2px 12px rgba(200,0,90,0.25)",
              }}
            >
              {updateMutation.isPending ? "更新中..." : "更新する"}
            </button>
            <button
              type="button"
              onClick={() => navigate({ to: "/admin/news" })}
              style={{
                fontFamily: "var(--sc-font-mono)",
                fontSize: "13px",
                color: "var(--sc-muted)",
                background: "transparent",
                padding: "0.6rem 1.2rem",
                borderRadius: "2px",
                border: "1px solid rgba(200,0,90,0.2)",
                cursor: "pointer",
              }}
            >
              キャンセル
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
