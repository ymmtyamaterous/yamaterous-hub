import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/admin/categories/")({
  component: AdminCategoriesPage,
});

function AdminCategoriesPage() {
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading } = useQuery(
    orpc.categories.list.queryOptions(),
  );

  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);

  const createMutation = useMutation(
    orpc.categories.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(orpc.categories.list.queryOptions());
        toast.success("カテゴリを追加しました");
        setNewName("");
        setNewSlug("");
        setNewDesc("");
        setSlugTouched(false);
      },
      onError: (err: { message?: string }) =>
        toast.error(err?.message ?? "カテゴリの追加に失敗しました"),
    }),
  );

  const deleteMutation = useMutation(
    orpc.categories.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(orpc.categories.list.queryOptions());
        toast.success("カテゴリを削除しました");
      },
      onError: () => toast.error("削除に失敗しました"),
    }),
  );

  const handleNameChange = (value: string) => {
    setNewName(value);
    if (!slugTouched) {
      setNewSlug(
        value
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "")
          .replace(/-+/g, "-")
          .slice(0, 60),
      );
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newSlug.trim()) {
      toast.error("名前とスラッグは必須です");
      return;
    }
    createMutation.mutate({
      name: newName,
      slug: newSlug,
      description: newDesc,
    });
  };

  const inputStyle: React.CSSProperties = {
    fontFamily: "var(--sc-font-jp)",
    fontSize: "13px",
    padding: "0.45rem 0.7rem",
    border: "1px solid rgba(200,0,90,0.2)",
    borderRadius: "3px",
    background: "rgba(253,246,239,0.8)",
    color: "var(--sc-text)",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "var(--sc-font-mono)",
    fontSize: "10px",
    letterSpacing: "0.1em",
    color: "var(--sc-muted)",
    marginBottom: "0.25rem",
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
        // CATEGORY MANAGEMENT
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
        カテゴリ管理
      </h1>

      {/* 新規追加フォーム */}
      <div
        style={{
          background: "rgba(253,246,239,0.9)",
          border: "1px solid rgba(200,0,90,0.12)",
          borderRadius: "4px",
          padding: "1.5rem",
          marginBottom: "2rem",
        }}
        className="dark:!bg-neutral-800/80 dark:!border-pink-900/20"
      >
        <div
          style={{
            fontFamily: "var(--sc-font-mono)",
            fontSize: "11px",
            letterSpacing: "0.1em",
            color: "var(--sc-sakura)",
            marginBottom: "1rem",
          }}
        >
          // ADD CATEGORY
        </div>
        <form
          onSubmit={handleCreate}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 2fr auto",
            gap: "0.75rem",
            alignItems: "end",
          }}
        >
          <div>
            <label style={labelStyle}>名前 *</label>
            <input
              style={inputStyle}
              value={newName}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="技術"
              required
              className="dark:!bg-neutral-700/50 dark:!text-neutral-100 dark:!border-pink-900/30"
            />
          </div>
          <div>
            <label style={labelStyle}>スラッグ *</label>
            <input
              style={inputStyle}
              value={newSlug}
              onChange={(e) => {
                setSlugTouched(true);
                setNewSlug(e.target.value);
              }}
              placeholder="tech"
              pattern="[a-z0-9-]+"
              title="小文字英数字とハイフンのみ"
              required
              className="dark:!bg-neutral-700/50 dark:!text-neutral-100 dark:!border-pink-900/30"
            />
          </div>
          <div>
            <label style={labelStyle}>説明</label>
            <input
              style={inputStyle}
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="カテゴリの説明（任意）"
              className="dark:!bg-neutral-700/50 dark:!text-neutral-100 dark:!border-pink-900/30"
            />
          </div>
          <button
            type="submit"
            disabled={createMutation.isPending}
            style={{
              fontFamily: "var(--sc-font-mono)",
              fontSize: "12px",
              padding: "0.45rem 1.2rem",
              border: "none",
              borderRadius: "2px",
              background: createMutation.isPending
                ? "rgba(200,0,90,0.4)"
                : "var(--sc-sakura)",
              color: "#fff",
              cursor: createMutation.isPending ? "not-allowed" : "pointer",
              fontWeight: 700,
              whiteSpace: "nowrap",
              boxShadow: "0 2px 8px rgba(200,0,90,0.25)",
            }}
          >
            {createMutation.isPending ? "追加中..." : "+ 追加"}
          </button>
        </form>
      </div>

      {/* カテゴリ一覧 */}
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
        ) : categories.length === 0 ? (
          <div
            style={{
              padding: "3rem",
              textAlign: "center",
              fontFamily: "var(--sc-font-mono)",
              fontSize: "13px",
              color: "var(--sc-muted)",
            }}
          >
            カテゴリがまだありません
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
                {["名前", "スラッグ", "説明", "操作"].map((h) => (
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
              {categories.map((cat) => (
                <tr
                  key={cat.id}
                  style={{ borderBottom: "1px solid rgba(200,0,90,0.06)" }}
                >
                  <td
                    style={{
                      padding: "0.75rem 1rem",
                      fontFamily: "var(--sc-font-jp)",
                      fontSize: "14px",
                      color: "var(--sc-text)",
                      fontWeight: 600,
                    }}
                    className="dark:!text-neutral-200"
                  >
                    {cat.name}
                  </td>
                  <td
                    style={{
                      padding: "0.75rem 1rem",
                      fontFamily: "var(--sc-font-mono)",
                      fontSize: "12px",
                      color: "var(--sc-cyber)",
                    }}
                  >
                    {cat.slug}
                  </td>
                  <td
                    style={{
                      padding: "0.75rem 1rem",
                      fontFamily: "var(--sc-font-jp)",
                      fontSize: "13px",
                      color: "var(--sc-muted)",
                    }}
                    className="dark:!text-neutral-400"
                  >
                    {cat.description || "—"}
                  </td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <button
                      type="button"
                      onClick={() => {
                        if (!confirm(`「${cat.name}」を削除しますか？`)) return;
                        deleteMutation.mutate({ id: cat.id });
                      }}
                      style={{
                        fontFamily: "var(--sc-font-mono)",
                        fontSize: "11px",
                        padding: "3px 10px",
                        borderRadius: "2px",
                        border: "1px solid rgba(200,0,90,0.3)",
                        color: "var(--sc-sakura)",
                        background: "transparent",
                        cursor: "pointer",
                      }}
                    >
                      削除
                    </button>
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
