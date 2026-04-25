import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@better-t-app/ui/components/button";
import { Input } from "@better-t-app/ui/components/input";
import { Label } from "@better-t-app/ui/components/label";

import { orpc } from "@/utils/orpc";

export interface WorkFormValues {
  title: string;
  description: string;
  thumbnailUrl: string;
  siteUrl: string;
  repositoryUrl: string;
  isPublished: boolean;
  sortOrder: number;
  tagIds: string[];
}

interface WorkFormProps {
  initialValues?: Partial<WorkFormValues>;
  onSubmit: (values: WorkFormValues) => Promise<void>;
  submitLabel: string;
  isSubmitting: boolean;
}

const inputStyle = {
  fontFamily: "var(--sc-font-jp)",
  borderColor: "rgba(200,0,90,0.2)",
  borderRadius: "2px",
  fontSize: "14px",
} as const;

const labelStyle = {
  fontFamily: "var(--sc-font-mono)",
  fontSize: "11px",
  letterSpacing: "0.12em",
  color: "var(--sc-muted)",
} as const;

const fieldWrapStyle = {
  display: "flex",
  flexDirection: "column" as const,
  gap: "0.4rem",
};

export function WorkForm({
  initialValues,
  onSubmit,
  submitLabel,
  isSubmitting,
}: WorkFormProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [values, setValues] = useState<WorkFormValues>({
    title: initialValues?.title ?? "",
    description: initialValues?.description ?? "",
    thumbnailUrl: initialValues?.thumbnailUrl ?? "",
    siteUrl: initialValues?.siteUrl ?? "",
    repositoryUrl: initialValues?.repositoryUrl ?? "",
    isPublished: initialValues?.isPublished ?? false,
    sortOrder: initialValues?.sortOrder ?? 0,
    tagIds: initialValues?.tagIds ?? [],
  });

  const [newTagName, setNewTagName] = useState("");

  const { data: allTags = [] } = useQuery(orpc.tags.list.queryOptions());

  const createTagMutation = useMutation(
    orpc.tags.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(orpc.tags.list.queryOptions());
        setNewTagName("");
      },
      onError: () => toast.error("タグの作成に失敗しました"),
    }),
  );

  const handleAddTag = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter" || !newTagName.trim()) return;
    e.preventDefault();
    const existing = allTags.find(
      (t) => t.name.toLowerCase() === newTagName.trim().toLowerCase(),
    );
    if (existing) {
      if (!values.tagIds.includes(existing.id)) {
        setValues((v) => ({ ...v, tagIds: [...v.tagIds, existing.id] }));
      }
      setNewTagName("");
      return;
    }
    const created = await createTagMutation.mutateAsync({
      name: newTagName.trim(),
    });
    setValues((v) => ({ ...v, tagIds: [...v.tagIds, created.id] }));
  };

  const removeTag = (id: string) => {
    setValues((v) => ({ ...v, tagIds: v.tagIds.filter((t) => t !== id) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!values.title.trim() || !values.description.trim()) {
      toast.error("タイトルと説明は必須です");
      return;
    }
    await onSubmit(values);
  };

  const selectedTags = allTags.filter((t) => values.tagIds.includes(t.id));
  const availableTags = allTags.filter((t) => !values.tagIds.includes(t.id));

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: "640px" }}
    >
      {/* タイトル */}
      <div style={fieldWrapStyle}>
        <Label style={labelStyle}>TITLE *</Label>
        <Input
          value={values.title}
          onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
          style={inputStyle}
          required
        />
      </div>

      {/* 説明 */}
      <div style={fieldWrapStyle}>
        <Label style={labelStyle}>DESCRIPTION *</Label>
        <textarea
          value={values.description}
          onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
          rows={5}
          required
          style={{
            ...inputStyle,
            padding: "0.5rem 0.75rem",
            border: "1px solid rgba(200,0,90,0.2)",
            borderRadius: "2px",
            background: "transparent",
            resize: "vertical",
            width: "100%",
            color: "var(--sc-text)",
          }}
          className="dark:!text-neutral-200 focus:outline-none focus:ring-1 focus:ring-[var(--sc-sakura)]"
        />
      </div>

      {/* サムネイル URL */}
      <div style={fieldWrapStyle}>
        <Label style={labelStyle}>THUMBNAIL URL</Label>
        <Input
          value={values.thumbnailUrl}
          onChange={(e) =>
            setValues((v) => ({ ...v, thumbnailUrl: e.target.value }))
          }
          style={inputStyle}
          type="url"
          placeholder="https://..."
        />
      </div>

      {/* サイト URL */}
      <div style={fieldWrapStyle}>
        <Label style={labelStyle}>SITE URL</Label>
        <Input
          value={values.siteUrl}
          onChange={(e) =>
            setValues((v) => ({ ...v, siteUrl: e.target.value }))
          }
          style={inputStyle}
          type="url"
          placeholder="https://..."
        />
      </div>

      {/* リポジトリ URL */}
      <div style={fieldWrapStyle}>
        <Label style={labelStyle}>REPOSITORY URL</Label>
        <Input
          value={values.repositoryUrl}
          onChange={(e) =>
            setValues((v) => ({ ...v, repositoryUrl: e.target.value }))
          }
          style={inputStyle}
          type="url"
          placeholder="https://github.com/..."
        />
      </div>

      {/* 表示順 */}
      <div style={fieldWrapStyle}>
        <Label style={labelStyle}>SORT ORDER</Label>
        <Input
          value={values.sortOrder}
          onChange={(e) =>
            setValues((v) => ({
              ...v,
              sortOrder: Number.parseInt(e.target.value) || 0,
            }))
          }
          style={{ ...inputStyle, width: "120px" }}
          type="number"
          min={0}
        />
      </div>

      {/* タグ */}
      <div style={fieldWrapStyle}>
        <Label style={labelStyle}>TAGS</Label>
        {/* 選択済みタグ */}
        {selectedTags.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "0.5rem" }}>
            {selectedTags.map((t) => (
              <span
                key={t.id}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  fontFamily: "var(--sc-font-mono)",
                  fontSize: "11px",
                  letterSpacing: "0.06em",
                  padding: "3px 8px",
                  background: "rgba(200,0,90,0.08)",
                  border: "1px solid rgba(200,0,90,0.2)",
                  borderRadius: "2px",
                  color: "var(--sc-sakura)",
                }}
              >
                {t.name}
                <button
                  type="button"
                  onClick={() => removeTag(t.id)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    display: "flex",
                    color: "var(--sc-sakura)",
                  }}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
        {/* 追加 */}
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Input
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            onKeyDown={handleAddTag}
            placeholder="タグ名を入力して Enter"
            style={{ ...inputStyle, fontSize: "13px" }}
            list="tag-suggestions"
          />
          <datalist id="tag-suggestions">
            {availableTags.map((t) => (
              <option key={t.id} value={t.name} />
            ))}
          </datalist>
        </div>
      </div>

      {/* 公開設定 */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <button
          type="button"
          onClick={() => setValues((v) => ({ ...v, isPublished: !v.isPublished }))}
          style={{
            width: "40px",
            height: "22px",
            borderRadius: "11px",
            border: "none",
            cursor: "pointer",
            background: values.isPublished ? "var(--sc-sakura)" : "rgba(0,0,0,0.15)",
            position: "relative",
            transition: "background 0.2s",
          }}
        >
          <span
            style={{
              position: "absolute",
              top: "2px",
              left: values.isPublished ? "20px" : "2px",
              width: "18px",
              height: "18px",
              background: "#fff",
              borderRadius: "50%",
              transition: "left 0.2s",
            }}
          />
        </button>
        <span
          style={{
            fontFamily: "var(--sc-font-mono)",
            fontSize: "12px",
            letterSpacing: "0.08em",
            color: values.isPublished ? "var(--sc-sakura)" : "var(--sc-muted)",
          }}
        >
          {values.isPublished ? "公開" : "非公開"}
        </span>
      </div>

      {/* ボタン */}
      <div style={{ display: "flex", gap: "1rem", paddingTop: "0.5rem" }}>
        <Button
          type="submit"
          disabled={isSubmitting}
          style={{
            fontFamily: "var(--sc-font-mono)",
            fontSize: "12px",
            letterSpacing: "0.1em",
            color: "#fff",
            background: "var(--sc-sakura)",
            border: "none",
            borderRadius: "2px",
            padding: "0.6rem 1.5rem",
            fontWeight: 700,
            boxShadow: "0 2px 12px rgba(200,0,90,0.3)",
            cursor: isSubmitting ? "not-allowed" : "pointer",
          }}
        >
          {isSubmitting ? "保存中..." : submitLabel}
        </Button>
        <button
          type="button"
          onClick={() => navigate({ to: "/admin/works" })}
          style={{
            fontFamily: "var(--sc-font-mono)",
            fontSize: "12px",
            letterSpacing: "0.1em",
            color: "var(--sc-muted)",
            background: "transparent",
            border: "1px solid rgba(0,0,0,0.12)",
            borderRadius: "2px",
            padding: "0.6rem 1.5rem",
            cursor: "pointer",
          }}
        >
          キャンセル
        </button>
      </div>
    </form>
  );
}
