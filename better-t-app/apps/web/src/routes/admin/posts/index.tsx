import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/admin/posts/")({
  component: AdminPostsPage,
});

function AdminPostsPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: posts = [], isLoading } = useQuery(
    orpc.posts.adminList.queryOptions(),
  );

  const deleteMutation = useMutation(
    orpc.posts.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(orpc.posts.adminList.queryOptions());
        toast.success("記事を削除しました");
      },
      onError: () => toast.error("削除に失敗しました"),
    }),
  );

  const toggleMutation = useMutation(
    orpc.posts.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(orpc.posts.adminList.queryOptions());
      },
      onError: () => toast.error("更新に失敗しました"),
    }),
  );

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`「${title}」を削除しますか？`)) return;
    deleteMutation.mutate({ id });
  };

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
        // BLOG MANAGEMENT
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <h1
          style={{
            fontFamily: "var(--sc-font-jp)",
            fontWeight: 900,
            fontSize: "1.8rem",
            color: "var(--sc-text)",
          }}
          className="dark:!text-neutral-100"
        >
          記事管理
        </h1>
        <Link
          to="/admin/posts/new"
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
          + 新しい記事を作成
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
        {isLoading ? (
          <div
            style={{
              padding: "2rem",
              fontFamily: "var(--sc-font-mono)",
              fontSize: "13px",
              color: "var(--sc-muted)",
            }}
          >
            Loading...
          </div>
        ) : posts.length === 0 ? (
          <div
            style={{
              padding: "3rem",
              textAlign: "center",
              fontFamily: "var(--sc-font-mono)",
              fontSize: "13px",
              color: "var(--sc-muted)",
            }}
          >
            記事がまだありません
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
                {["タイトル", "スラッグ", "状態", "作成日", "操作"].map((h) => (
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
              {posts.map((p) => (
                <tr
                  key={p.id}
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
                    {p.title}
                  </td>
                  <td
                    style={{
                      padding: "0.75rem 1rem",
                      fontFamily: "var(--sc-font-mono)",
                      fontSize: "12px",
                      color: "var(--sc-muted)",
                    }}
                    className="dark:!text-neutral-400"
                  >
                    {p.slug}
                  </td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <button
                      type="button"
                      onClick={() =>
                        toggleMutation.mutate({
                          id: p.id,
                          isPublished: !p.isPublished,
                        })
                      }
                      style={{
                        fontFamily: "var(--sc-font-mono)",
                        fontSize: "11px",
                        padding: "2px 10px",
                        borderRadius: "2px",
                        border: "none",
                        cursor: "pointer",
                        color: p.isPublished ? "#fff" : "var(--sc-muted)",
                        background: p.isPublished
                          ? "var(--sc-sakura)"
                          : "rgba(0,0,0,0.06)",
                        transition: "all 0.15s",
                      }}
                    >
                      {p.isPublished ? "公開中" : "非公開"}
                    </button>
                  </td>
                  <td
                    style={{
                      padding: "0.75rem 1rem",
                      fontFamily: "var(--sc-font-mono)",
                      fontSize: "12px",
                      color: "var(--sc-muted)",
                    }}
                    className="dark:!text-neutral-400"
                  >
                    {new Date(p.createdAt).toLocaleDateString("ja-JP")}
                  </td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <Link
                        to="/admin/posts/$postId/edit"
                        params={{ postId: p.id }}
                        style={{
                          fontFamily: "var(--sc-font-mono)",
                          fontSize: "11px",
                          padding: "3px 10px",
                          borderRadius: "2px",
                          border: "1px solid var(--sc-cyber)",
                          color: "var(--sc-cyber)",
                          textDecoration: "none",
                          transition: "all 0.15s",
                        }}
                      >
                        編集
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(p.id, p.title)}
                        style={{
                          fontFamily: "var(--sc-font-mono)",
                          fontSize: "11px",
                          padding: "3px 10px",
                          borderRadius: "2px",
                          border: "1px solid rgba(200,0,90,0.3)",
                          color: "var(--sc-sakura)",
                          background: "transparent",
                          cursor: "pointer",
                          transition: "all 0.15s",
                        }}
                      >
                        削除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
