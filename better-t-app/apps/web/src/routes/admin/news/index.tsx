import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/admin/news/")({
  component: AdminNewsPage,
});

const NEWS_TYPE_LABELS: Record<string, string> = {
  "": "すべて",
  site_update: "サイト更新",
  personal: "個人ニュース",
};

function AdminNewsPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState("");
  const [newsType, setNewsType] = useState<"" | "site_update" | "personal">("");
  const [sortBy, setSortBy] = useState<"publishedAt" | "createdAt" | "title">("createdAt");
  const [order, setOrder] = useState<"asc" | "desc">("desc");

  const filters = {
    keyword: keyword || undefined,
    newsType: newsType || undefined,
    sortBy,
    order,
  };

  const { data: newsList = [], isLoading } = useQuery(
    orpc.news.adminList.queryOptions({ input: filters }),
  );

  const deleteMutation = useMutation(
    orpc.news.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.news.adminList.queryOptions({ input: filters }).queryKey,
        });
        toast.success("ニュースを削除しました");
      },
      onError: () => toast.error("削除に失敗しました"),
    }),
  );

  const toggleMutation = useMutation(
    orpc.news.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.news.adminList.queryOptions({ input: filters }).queryKey,
        });
      },
      onError: () => toast.error("更新に失敗しました"),
    }),
  );

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`「${title}」を削除しますか？`)) return;
    deleteMutation.mutate({ id });
  };

  const inputStyle: React.CSSProperties = {
    fontFamily: "var(--sc-font-jp)",
    fontSize: "13px",
    padding: "0.4rem 0.65rem",
    border: "1px solid rgba(200,0,90,0.2)",
    borderRadius: "3px",
    background: "rgba(253,246,239,0.8)",
    color: "var(--sc-text)",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "var(--sc-font-mono)",
    fontSize: "10px",
    letterSpacing: "0.1em",
    color: "var(--sc-muted)",
    marginBottom: "0.2rem",
    display: "block",
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
        // NEWS MANAGEMENT
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
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
          ニュース管理
        </h1>
        <Link
          to="/admin/news/new"
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
          + 新しいニュースを作成
        </Link>
      </div>

      {/* フィルターパネル */}
      <div
        style={{
          background: "rgba(253,246,239,0.9)",
          border: "1px solid rgba(200,0,90,0.12)",
          borderRadius: "4px",
          padding: "1rem 1.2rem",
          marginBottom: "1.25rem",
          display: "flex",
          flexWrap: "wrap",
          gap: "0.75rem",
          alignItems: "flex-end",
        }}
        className="dark:!bg-neutral-800/80 dark:!border-pink-900/20"
      >
        {/* キーワード */}
        <div style={{ flex: "1 1 160px", minWidth: "130px" }}>
          <label style={labelStyle}>キーワード</label>
          <input
            style={{ ...inputStyle, width: "100%" }}
            placeholder="タイトルで検索"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="dark:!bg-neutral-700/50 dark:!text-neutral-100 dark:!border-pink-900/30"
          />
        </div>

        {/* 種別フィルター */}
        <div style={{ flex: "1 1 130px", minWidth: "110px" }}>
          <label style={labelStyle}>種別</label>
          <select
            style={{ ...inputStyle, width: "100%", cursor: "pointer" }}
            value={newsType}
            onChange={(e) => setNewsType(e.target.value as typeof newsType)}
            className="dark:!bg-neutral-700/50 dark:!text-neutral-100 dark:!border-pink-900/30"
          >
            {(["", "site_update", "personal"] as const).map((t) => (
              <option key={t} value={t}>{NEWS_TYPE_LABELS[t]}</option>
            ))}
          </select>
        </div>

        {/* ソート */}
        <div style={{ flex: "0 0 120px" }}>
          <label style={labelStyle}>ソート</label>
          <select
            style={{ ...inputStyle, width: "100%", cursor: "pointer" }}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="dark:!bg-neutral-700/50 dark:!text-neutral-100 dark:!border-pink-900/30"
          >
            <option value="createdAt">作成日</option>
            <option value="publishedAt">公開日</option>
            <option value="title">タイトル</option>
          </select>
        </div>

        {/* 順序 */}
        <div style={{ flex: "0 0 90px" }}>
          <label style={labelStyle}>順序</label>
          <select
            style={{ ...inputStyle, width: "100%", cursor: "pointer" }}
            value={order}
            onChange={(e) => setOrder(e.target.value as typeof order)}
            className="dark:!bg-neutral-700/50 dark:!text-neutral-100 dark:!border-pink-900/30"
          >
            <option value="desc">降順</option>
            <option value="asc">昇順</option>
          </select>
        </div>

        {/* リセット */}
        <button
          type="button"
          onClick={() => {
            setKeyword("");
            setNewsType("");
            setSortBy("createdAt");
            setOrder("desc");
          }}
          style={{
            fontFamily: "var(--sc-font-mono)",
            fontSize: "11px",
            padding: "0.4rem 0.9rem",
            border: "1px solid rgba(200,0,90,0.2)",
            borderRadius: "2px",
            background: "transparent",
            color: "var(--sc-muted)",
            cursor: "pointer",
            alignSelf: "flex-end",
          }}
        >
          リセット
        </button>
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
        ) : newsList.length === 0 ? (
          <div
            style={{
              padding: "3rem",
              textAlign: "center",
              fontFamily: "var(--sc-font-mono)",
              fontSize: "13px",
              color: "var(--sc-muted)",
            }}
          >
            ニュースがまだありません
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
                {["タイトル", "種別", "状態", "作成日", "操作"].map((h) => (
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
              {newsList.map((item) => (
                <tr
                  key={item.id}
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
                    {item.title}
                  </td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <span
                      style={{
                        fontFamily: "var(--sc-font-mono)",
                        fontSize: "11px",
                        padding: "2px 8px",
                        borderRadius: "2px",
                        background:
                          item.newsType === "site_update"
                            ? "rgba(0,180,120,0.12)"
                            : "rgba(200,0,90,0.08)",
                        color:
                          item.newsType === "site_update"
                            ? "#00a868"
                            : "var(--sc-sakura)",
                      }}
                    >
                      {item.newsType === "site_update" ? "サイト更新" : "個人"}
                    </span>
                  </td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <button
                      type="button"
                      onClick={() =>
                        toggleMutation.mutate({
                          id: item.id,
                          isPublished: !item.isPublished,
                        })
                      }
                      style={{
                        fontFamily: "var(--sc-font-mono)",
                        fontSize: "11px",
                        padding: "2px 10px",
                        borderRadius: "20px",
                        border: "none",
                        cursor: "pointer",
                        background: item.isPublished
                          ? "rgba(0,180,120,0.15)"
                          : "rgba(200,200,200,0.2)",
                        color: item.isPublished ? "#00a868" : "var(--sc-muted)",
                        fontWeight: 600,
                      }}
                    >
                      {item.isPublished ? "公開中" : "非公開"}
                    </button>
                  </td>
                  <td
                    style={{
                      padding: "0.75rem 1rem",
                      fontFamily: "var(--sc-font-mono)",
                      fontSize: "12px",
                      color: "var(--sc-muted)",
                    }}
                    className="dark:!text-neutral-500"
                  >
                    {new Date(item.createdAt).toLocaleDateString("ja-JP")}
                  </td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        type="button"
                        onClick={() =>
                          navigate({ to: "/admin/news/$newsId", params: { newsId: item.id } })
                        }
                        style={{
                          fontFamily: "var(--sc-font-mono)",
                          fontSize: "11px",
                          padding: "0.3rem 0.7rem",
                          border: "1px solid rgba(200,0,90,0.25)",
                          borderRadius: "2px",
                          background: "transparent",
                          color: "var(--sc-sakura)",
                          cursor: "pointer",
                        }}
                      >
                        編集
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id, item.title)}
                        style={{
                          fontFamily: "var(--sc-font-mono)",
                          fontSize: "11px",
                          padding: "0.3rem 0.7rem",
                          border: "1px solid rgba(200,0,90,0.15)",
                          borderRadius: "2px",
                          background: "transparent",
                          color: "var(--sc-muted)",
                          cursor: "pointer",
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
