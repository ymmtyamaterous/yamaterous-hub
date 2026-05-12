import MDEditor from "@uiw/react-md-editor";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/admin/posts/$postId/edit")({
  component: EditPostPage,
});

function EditPostPage() {
  const { postId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: post, isLoading } = useQuery(
    orpc.posts.adminGet.queryOptions({ input: { id: postId } }),
  );

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

  const { data: categories = [] } = useQuery(orpc.categories.list.queryOptions());

  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setSlug(post.slug);
      setExcerpt(post.excerpt);
      setContent(post.content);
      setIsPublished(post.isPublished);
      setSelectedCategoryIds(post.categories.map((c) => c.id));
    }
  }, [post]);

  const updateMutation = useMutation(
    orpc.posts.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(orpc.posts.adminList.queryOptions());
        queryClient.invalidateQueries(
          orpc.posts.adminGet.queryOptions({ input: { id: postId } }),
        );
        toast.success("記事を更新しました");
        navigate({ to: "/admin/posts" });
      },
      onError: (err: { message?: string }) =>
        toast.error(err?.message ?? "記事の更新に失敗しました"),
    }),
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim()) {
      toast.error("タイトルとスラッグは必須です");
      return;
    }
    updateMutation.mutate({
      id: postId,
      title,
      slug,
      content,
      excerpt,
      isPublished,
      categoryIds: selectedCategoryIds,
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
          padding: "3rem",
          fontFamily: "var(--sc-font-mono)",
          fontSize: "13px",
          color: "var(--sc-muted)",
        }}
      >
        Loading...
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
        // EDIT POST
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
        記事を編集
      </h1>

      <form onSubmit={handleSubmit}>
        {/* メタ情報 */}
        <div
          style={{
            background: "rgba(253,246,239,0.9)",
            border: "1px solid rgba(200,0,90,0.12)",
            borderRadius: "4px",
            padding: "1.5rem",
            marginBottom: "1.5rem",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
          }}
          className="dark:!bg-neutral-800/80 dark:!border-pink-900/20"
        >
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>タイトル *</label>
            <input
              style={inputStyle}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="記事のタイトル"
              required
              className="dark:!bg-neutral-700/50 dark:!text-neutral-100 dark:!border-pink-900/30"
            />
          </div>
          <div>
            <label style={labelStyle}>スラッグ * (URL: /blog/スラッグ)</label>
            <input
              style={inputStyle}
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="my-post-slug"
              pattern="[a-z0-9\-]+"
              title="小文字英数字とハイフンのみ"
              required
              className="dark:!bg-neutral-700/50 dark:!text-neutral-100 dark:!border-pink-900/30"
            />
          </div>
          <div>
            <label style={labelStyle}>概要（省略可）</label>
            <input
              style={inputStyle}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="記事の短い説明（一覧ページに表示されます）"
              className="dark:!bg-neutral-700/50 dark:!text-neutral-100 dark:!border-pink-900/30"
            />
          </div>
          {/* カテゴリ選択 */}
          {categories.length > 0 && (
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>カテゴリ（複数選択可）</label>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.5rem",
                }}
              >
                {categories.map((cat) => {
                  const checked = selectedCategoryIds.includes(cat.id);
                  return (
                    <label
                      key={cat.id}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.3rem",
                        padding: "0.3rem 0.75rem",
                        border: checked
                          ? "1px solid var(--sc-sakura)"
                          : "1px solid rgba(200,0,90,0.2)",
                        borderRadius: "20px",
                        background: checked
                          ? "rgba(200,0,90,0.08)"
                          : "transparent",
                        cursor: "pointer",
                        fontFamily: "var(--sc-font-jp)",
                        fontSize: "12px",
                        color: checked ? "var(--sc-sakura)" : "var(--sc-muted)",
                        userSelect: "none",
                        transition: "all 0.15s",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          setSelectedCategoryIds((prev) =>
                            e.target.checked
                              ? [...prev, cat.id]
                              : prev.filter((id) => id !== cat.id),
                          );
                        }}
                        style={{ display: "none" }}
                      />
                      {cat.name}
                    </label>
                  );
                })}
              </div>
            </div>
          )}
          <div
            style={{
              gridColumn: "1 / -1",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <input
              type="checkbox"
              id="isPublished"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              style={{ accentColor: "var(--sc-sakura)", width: "16px", height: "16px" }}
            />
            <label
              htmlFor="isPublished"
              style={{
                ...labelStyle,
                marginBottom: 0,
                cursor: "pointer",
                fontSize: "13px",
              }}
            >
              公開する
            </label>
          </div>
        </div>

        {/* マークダウンエディタ（分割プレビュー） */}
        <div
          style={{
            marginBottom: "1.5rem",
            border: "1px solid rgba(200,0,90,0.12)",
            borderRadius: "4px",
            overflow: "hidden",
          }}
          data-color-mode="light"
        >
          <div
            style={{
              padding: "0.5rem 1rem",
              background: "rgba(200,0,90,0.04)",
              borderBottom: "1px solid rgba(200,0,90,0.1)",
              fontFamily: "var(--sc-font-mono)",
              fontSize: "11px",
              letterSpacing: "0.1em",
              color: "var(--sc-muted)",
            }}
          >
            // CONTENT EDITOR
          </div>
          <MDEditor
            value={content}
            onChange={(v) => setContent(v ?? "")}
            height={500}
            preview="live"
            style={{
              borderRadius: 0,
              border: "none",
            }}
          />
        </div>

        {/* 送信ボタン */}
        <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={() => navigate({ to: "/admin/posts" })}
            style={{
              fontFamily: "var(--sc-font-mono)",
              fontSize: "12px",
              padding: "0.6rem 1.5rem",
              border: "1px solid rgba(200,0,90,0.2)",
              borderRadius: "2px",
              background: "transparent",
              color: "var(--sc-muted)",
              cursor: "pointer",
            }}
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={updateMutation.isPending}
            style={{
              fontFamily: "var(--sc-font-mono)",
              fontSize: "12px",
              padding: "0.6rem 1.8rem",
              border: "none",
              borderRadius: "2px",
              background: updateMutation.isPending
                ? "rgba(200,0,90,0.4)"
                : "var(--sc-sakura)",
              color: "#fff",
              cursor: updateMutation.isPending ? "not-allowed" : "pointer",
              fontWeight: 700,
              boxShadow: "0 2px 12px rgba(200,0,90,0.3)",
            }}
          >
            {updateMutation.isPending ? "更新中..." : "記事を更新"}
          </button>
        </div>
      </form>
    </div>
  );
}
