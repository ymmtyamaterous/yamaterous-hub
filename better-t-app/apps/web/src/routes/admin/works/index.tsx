import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/admin/works/")({
  component: AdminWorksPage,
});

function AdminWorksPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: works = [], isLoading } = useQuery(
    orpc.works.adminList.queryOptions(),
  );

  const deleteMutation = useMutation(
    orpc.works.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(orpc.works.adminList.queryOptions());
        toast.success("作品を削除しました");
      },
      onError: () => toast.error("削除に失敗しました"),
    }),
  );

  const toggleMutation = useMutation(
    orpc.works.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(orpc.works.adminList.queryOptions());
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
        // CONTENT MANAGEMENT
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
          作品管理
        </h1>
        <Link
          to="/admin/works/new"
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
          + 新しい作品を追加
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
        ) : works.length === 0 ? (
          <div
            style={{
              padding: "3rem",
              textAlign: "center",
              fontFamily: "var(--sc-font-mono)",
              fontSize: "13px",
              color: "var(--sc-muted)",
            }}
          >
            作品がまだありません
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
                {["タイトル", "状態", "表示順", "操作"].map((h) => (
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
              {works.map((w) => (
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
                    <button
                      type="button"
                      onClick={() =>
                        toggleMutation.mutate({
                          id: w.id,
                          isPublished: !w.isPublished,
                        })
                      }
                      style={{
                        fontFamily: "var(--sc-font-mono)",
                        fontSize: "11px",
                        padding: "2px 10px",
                        borderRadius: "2px",
                        border: "none",
                        cursor: "pointer",
                        color: w.isPublished ? "#fff" : "var(--sc-muted)",
                        background: w.isPublished
                          ? "var(--sc-sakura)"
                          : "rgba(0,0,0,0.06)",
                        transition: "all 0.15s",
                      }}
                    >
                      {w.isPublished ? "公開中" : "非公開"}
                    </button>
                  </td>
                  <td
                    style={{
                      padding: "0.75rem 1rem",
                      fontFamily: "var(--sc-font-mono)",
                      fontSize: "13px",
                      color: "var(--sc-muted)",
                    }}
                    className="dark:!text-neutral-400"
                  >
                    {w.sortOrder}
                  </td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <Link
                        to="/admin/works/$workId/edit"
                        params={{ workId: w.id }}
                        style={{
                          fontFamily: "var(--sc-font-mono)",
                          fontSize: "11px",
                          letterSpacing: "0.06em",
                          color: "var(--sc-cyber)",
                          textDecoration: "none",
                          padding: "3px 10px",
                          border: "1px solid var(--sc-cyber)",
                          borderRadius: "2px",
                        }}
                        className="hover:!bg-blue-50"
                      >
                        編集
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(w.id, w.title)}
                        style={{
                          fontFamily: "var(--sc-font-mono)",
                          fontSize: "11px",
                          letterSpacing: "0.06em",
                          color: "var(--sc-cyber3)",
                          background: "transparent",
                          border: "1px solid var(--sc-cyber3)",
                          borderRadius: "2px",
                          padding: "3px 10px",
                          cursor: "pointer",
                        }}
                        className="hover:!bg-red-50"
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
