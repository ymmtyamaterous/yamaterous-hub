import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@better-t-app/ui/components/button";
import { Input } from "@better-t-app/ui/components/input";
import { Label } from "@better-t-app/ui/components/label";

import { orpc } from "@/utils/orpc";

const semverPattern = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;

type ReleaseNoteForm = {
  version: string;
  title: string;
  content: string;
  isPublished: boolean;
};

const emptyForm: ReleaseNoteForm = {
  version: "",
  title: "",
  content: "",
  isPublished: false,
};

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

export function ReleaseNoteManager({ workId }: { workId: string }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<ReleaseNoteForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { data: releaseNotes = [], isLoading } = useQuery(
    orpc.releaseNotes.adminList.queryOptions({ input: { workId } }),
  );

  const invalidate = () =>
    queryClient.invalidateQueries(
      orpc.releaseNotes.adminList.queryOptions({ input: { workId } }),
    );

  const createMutation = useMutation(
    orpc.releaseNotes.create.mutationOptions({
      onSuccess: () => {
        invalidate();
        resetForm();
        toast.success("リリースノートを追加しました");
      },
      onError: (error: { message?: string }) =>
        toast.error(error.message ?? "リリースノートの追加に失敗しました"),
    }),
  );

  const updateMutation = useMutation(
    orpc.releaseNotes.update.mutationOptions({
      onSuccess: () => {
        invalidate();
        resetForm();
        toast.success("リリースノートを更新しました");
      },
      onError: (error: { message?: string }) =>
        toast.error(error.message ?? "リリースノートの更新に失敗しました"),
    }),
  );

  const deleteMutation = useMutation(
    orpc.releaseNotes.delete.mutationOptions({
      onSuccess: () => {
        invalidate();
        toast.success("リリースノートを削除しました");
      },
      onError: () => toast.error("リリースノートの削除に失敗しました"),
    }),
  );

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setIsFormOpen(false);
  };

  const startEdit = (note: (typeof releaseNotes)[number]) => {
    setForm({
      version: note.version,
      title: note.title,
      content: note.content,
      isPublished: note.isPublished,
    });
    setEditingId(note.id);
    setIsFormOpen(true);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!semverPattern.test(form.version)) {
      toast.error("バージョンは 1.0.0 形式で入力してください");
      return;
    }
    if (!form.content.trim()) {
      toast.error("本文は必須です");
      return;
    }

    const values = {
      version: form.version,
      title: form.title,
      content: form.content,
      isPublished: form.isPublished,
    };
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...values });
    } else {
      createMutation.mutate({ workId, ...values });
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <section style={{ marginTop: "3rem", maxWidth: "640px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", marginBottom: "1rem" }}>
        <div>
          <div style={{ ...labelStyle, color: "var(--sc-cyber)", marginBottom: "0.3rem" }}>
            // RELEASE NOTES
          </div>
          <h2 style={{ fontFamily: "var(--sc-font-jp)", fontSize: "1.35rem", fontWeight: 900, color: "var(--sc-text)", margin: 0 }}>
            リリースノート
          </h2>
        </div>
        {!isFormOpen && (
          <Button type="button" onClick={() => setIsFormOpen(true)} style={{ fontFamily: "var(--sc-font-mono)", fontSize: "11px", background: "var(--sc-sakura)", color: "#fff" }}>
            <Plus size={14} /> 追加
          </Button>
        )}
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem", padding: "1.25rem", marginBottom: "1rem", border: "1px solid rgba(200,0,90,0.18)", borderRadius: "4px", background: "rgba(200,0,90,0.03)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 2fr)", gap: "0.75rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <Label style={labelStyle}>VERSION *</Label>
              <Input value={form.version} onChange={(event) => setForm((value) => ({ ...value, version: event.target.value }))} placeholder="1.0.0" pattern={semverPattern.source} required style={inputStyle} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <Label style={labelStyle}>TITLE</Label>
              <Input value={form.title} onChange={(event) => setForm((value) => ({ ...value, title: event.target.value }))} placeholder="アップデートの概要" style={inputStyle} />
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <Label style={labelStyle}>CONTENT *</Label>
            <textarea value={form.content} onChange={(event) => setForm((value) => ({ ...value, content: event.target.value }))} rows={5} required style={{ ...inputStyle, padding: "0.5rem 0.75rem", border: "1px solid rgba(200,0,90,0.2)", background: "transparent", resize: "vertical", color: "var(--sc-text)" }} />
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", ...labelStyle, cursor: "pointer" }}>
            <input type="checkbox" checked={form.isPublished} onChange={(event) => setForm((value) => ({ ...value, isPublished: event.target.checked }))} style={{ accentColor: "var(--sc-sakura)" }} />
            公開する
          </label>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
            <Button type="button" variant="outline" onClick={resetForm} disabled={isSubmitting} style={{ fontFamily: "var(--sc-font-mono)", fontSize: "11px" }}><X size={14} /> キャンセル</Button>
            <Button type="submit" disabled={isSubmitting} style={{ fontFamily: "var(--sc-font-mono)", fontSize: "11px", background: "var(--sc-sakura)", color: "#fff" }}>{isSubmitting ? "保存中..." : editingId ? "更新する" : "追加する"}</Button>
          </div>
        </form>
      )}

      {isLoading ? (
        <p style={{ ...labelStyle, margin: "1rem 0" }}>Loading...</p>
      ) : releaseNotes.length === 0 ? (
        <p style={{ fontFamily: "var(--sc-font-jp)", color: "var(--sc-muted)", fontSize: "14px" }}>リリースノートはまだありません。</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {releaseNotes.map((note) => (
            <article key={note.id} style={{ padding: "1rem", border: "1px solid rgba(200,0,90,0.12)", borderRadius: "4px", background: "rgba(253,246,239,0.55)" }} className="dark:!bg-neutral-800/50">
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
                <div>
                  <div style={{ fontFamily: "var(--sc-font-mono)", color: "var(--sc-sakura)", fontWeight: 700, fontSize: "13px" }}>v{note.version} {!note.isPublished && <span style={{ color: "var(--sc-muted)", fontWeight: 400 }}>・下書き</span>}</div>
                  {note.title && <div style={{ fontFamily: "var(--sc-font-jp)", color: "var(--sc-text)", fontSize: "14px", marginTop: "0.25rem" }}>{note.title}</div>}
                </div>
                <div style={{ display: "flex", gap: "0.35rem" }}>
                  <Button type="button" variant="ghost" size="icon" onClick={() => startEdit(note)} aria-label={`バージョン ${note.version} を編集`}><Pencil size={14} /></Button>
                  <Button type="button" variant="ghost" size="icon" onClick={() => { if (confirm(`v${note.version} を削除しますか？`)) deleteMutation.mutate({ id: note.id }); }} aria-label={`バージョン ${note.version} を削除`}><Trash2 size={14} /></Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
