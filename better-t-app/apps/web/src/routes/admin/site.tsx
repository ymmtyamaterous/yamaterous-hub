import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@better-t-app/ui/components/button";
import { Input } from "@better-t-app/ui/components/input";
import { Label } from "@better-t-app/ui/components/label";

import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/admin/site")({
  component: AdminSitePage,
});

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

const hintStyle = {
  fontFamily: "var(--sc-font-mono)",
  fontSize: "11px",
  color: "var(--sc-muted)",
  marginTop: "0.25rem",
  opacity: 0.7,
} as const;

const sectionHeadStyle = {
  fontFamily: "var(--sc-font-mono)",
  fontSize: "10px",
  letterSpacing: "0.2em",
  color: "var(--sc-cyber)",
  marginBottom: "0.5rem",
} as const;

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
      <Label style={labelStyle}>{label}</Label>
      {children}
      {hint && <p style={hintStyle}>{hint}</p>}
    </div>
  );
}

function AdminSitePage() {
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useQuery(orpc.profile.get.queryOptions());

  const [form, setForm] = useState({
    // ヘッダー
    logoSubtitle: "",
    // LP ヒーロー
    heroTagline: "",
    heroGreeting: "",
    h1Line1: "",
    h1Line2: "",
    h1Line3: "",
    heroSubText: "",
  });
  const [initialized, setInitialized] = useState(false);

  if (profile && !initialized) {
    setForm({
      logoSubtitle: profile.logoSubtitle,
      heroTagline: profile.heroTagline,
      heroGreeting: profile.heroGreeting,
      h1Line1: profile.h1Line1,
      h1Line2: profile.h1Line2,
      h1Line3: profile.h1Line3,
      heroSubText: profile.heroSubText,
    });
    setInitialized(true);
  }

  const updateMutation = useMutation(
    orpc.profile.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(orpc.profile.get.queryOptions());
        toast.success("サイト設定を保存しました");
      },
      onError: () => toast.error("保存に失敗しました"),
    }),
  );

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((v) => ({ ...v, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateMutation.mutateAsync(form);
  };

  if (isLoading) {
    return (
      <div style={{ fontFamily: "var(--sc-font-mono)", fontSize: "13px", color: "var(--sc-muted)" }}>
        Loading...
      </div>
    );
  }

  return (
    <div>
      <div style={sectionHeadStyle}>// SITE SETTINGS</div>
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
        サイト設定
      </h1>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "2.5rem", maxWidth: "600px" }}
      >
        {/* ── ヘッダー設定 ── */}
        <section>
          <div
            style={{
              fontFamily: "var(--sc-font-mono)",
              fontSize: "10px",
              letterSpacing: "0.2em",
              color: "var(--sc-sakura)",
              marginBottom: "1rem",
              paddingBottom: "0.5rem",
              borderBottom: "1px solid rgba(200,0,90,0.12)",
            }}
          >
            // HEADER
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <Field
              label="ロゴ サブタイトル"
              hint={`ロゴ下に小さく表示されるテキスト（例：やまてろす・ハブ）`}
            >
              <Input
                value={form.logoSubtitle}
                onChange={set("logoSubtitle")}
                style={inputStyle}
                placeholder="やまてろす・ハブ"
              />
            </Field>
          </div>
        </section>

        {/* ── LP ヒーロー設定 ── */}
        <section>
          <div
            style={{
              fontFamily: "var(--sc-font-mono)",
              fontSize: "10px",
              letterSpacing: "0.2em",
              color: "var(--sc-sakura)",
              marginBottom: "1rem",
              paddingBottom: "0.5rem",
              borderBottom: "1px solid rgba(200,0,90,0.12)",
            }}
          >
            // LP / HERO
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <Field
              label="SYS_ONLINE バッジ テキスト"
              hint={`ヒーロー左上のバッジ後に続くテキスト（例：Portfolio · やまてろす）`}
            >
              <Input
                value={form.heroTagline}
                onChange={set("heroTagline")}
                style={inputStyle}
                placeholder="Portfolio · やまてろす"
              />
            </Field>

            <Field
              label="h1 1行目（グリッチ・さくら色）"
              hint={`大見出し1行目。空欄の場合はプロフィールの表示名が使用されます`}
            >
              <Input
                value={form.h1Line1}
                onChange={set("h1Line1")}
                style={inputStyle}
                placeholder="（空欄の場合は表示名を使用）"
              />
            </Field>

            <Field
              label="h1 2行目（通常テキスト）"
              hint={`大見出し2行目（例：のポートフォリオ）`}
            >
              <Input
                value={form.h1Line2}
                onChange={set("h1Line2")}
                style={inputStyle}
                placeholder="のポートフォリオ"
              />
            </Field>

            <Field
              label="h1 3行目（アウトライン）"
              hint={`大見出し3行目。輪郭文字で表示されます（例：hub.）`}
            >
              <Input
                value={form.h1Line3}
                onChange={set("h1Line3")}
                style={inputStyle}
                placeholder="hub."
              />
            </Field>

            <Field
              label="挨拶テキスト"
              hint={`本文上部に表示されるコードスタイルの挨拶（例：Hello_World();）`}
            >
              <Input
                value={form.heroGreeting}
                onChange={set("heroGreeting")}
                style={inputStyle}
                placeholder="Hello_World();"
              />
            </Field>

            <Field
              label="ヒーロー補足テキスト"
              hint={`挨拶の下に表示される補足文。空欄の場合はプロフィールの自己紹介が使用されます`}
            >
              <textarea
                value={form.heroSubText}
                onChange={set("heroSubText")}
                rows={3}
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
                placeholder="（空欄の場合は自己紹介を使用）"
                className="dark:!text-neutral-200 focus:outline-none focus:ring-1 focus:ring-[var(--sc-sakura)]"
              />
            </Field>
          </div>
        </section>

        <div>
          <Button
            type="submit"
            disabled={updateMutation.isPending}
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
              cursor: updateMutation.isPending ? "not-allowed" : "pointer",
            }}
          >
            {updateMutation.isPending ? "保存中..." : "保存する"}
          </Button>
        </div>
      </form>
    </div>
  );
}
