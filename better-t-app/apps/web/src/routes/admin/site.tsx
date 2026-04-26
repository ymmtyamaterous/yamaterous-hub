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

const previewLabelStyle = {
  fontFamily: "var(--sc-font-mono)",
  fontSize: "9px",
  letterSpacing: "0.18em",
  color: "var(--sc-cyber)",
  padding: "0.35rem 0.75rem",
  background: "rgba(0,95,168,0.06)",
  borderBottom: "1px solid rgba(200,0,90,0.1)",
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

type ThemeId = "sakura-cyber" | "sea-cyber";

const THEMES: { id: ThemeId; label: string; desc: string; colors: string[] }[] = [
  {
    id: "sakura-cyber",
    label: "Sakura Cyber",
    desc: "サクラピンク×サイバーブルーの日本風デジタルデザイン",
    colors: ["#c8005a", "#005fa8", "#b00040", "#fdf6ef"],
  },
  {
    id: "sea-cyber",
    label: "Sea Cyber Light",
    desc: "夏の海をテーマにしたグラスモーフィズムデザイン",
    colors: ["#00bfff", "#5ef6e6", "#00668a", "#f5fafc"],
  },
];

type FormState = {
  logoSubtitle: string;
  heroTagline: string;
  heroGreeting: string;
  h1Line1: string;
  h1Line2: string;
  h1Line3: string;
  heroSubText: string;
  theme: ThemeId;
};

function HeaderPreview({ logoSubtitle }: { logoSubtitle: string }) {
  return (
    <div
      style={{
        border: "1px solid rgba(200,0,90,0.15)",
        borderRadius: "4px",
        overflow: "hidden",
        background: "rgba(253,246,239,0.5)",
        alignSelf: "flex-start",
        minWidth: "260px",
      }}
      className="dark:!bg-neutral-900/40 dark:!border-pink-900/25"
    >
      <div style={previewLabelStyle}>// PREVIEW — HEADER LOGO</div>
      <div
        style={{
          padding: "0.9rem 1.25rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(253,246,239,0.9)",
          borderBottom: "1px solid rgba(200,0,90,0.12)",
          gap: "1rem",
        }}
        className="dark:!bg-neutral-900/80"
      >
        {/* ロゴ */}
        <div style={{ fontFamily: "var(--sc-font-jp)", fontWeight: 900, fontSize: "1.1rem", lineHeight: 1.15 }}>
          <span style={{ color: "var(--sc-sakura)", textShadow: "0 0 10px rgba(200,0,90,0.4)" }}>
            Yamaterous
          </span>
          <span style={{ color: "var(--sc-text)" }} className="dark:!text-neutral-100">
            {" Hub"}
          </span>
          <span
            style={{
              display: "block",
              fontSize: "8px",
              letterSpacing: "0.18em",
              color: "var(--sc-muted)",
              fontFamily: "var(--sc-font-mono)",
              marginTop: "-1px",
            }}
          >
            {logoSubtitle || <span style={{ opacity: 0.4 }}>（サブタイトル未設定）</span>}
          </span>
        </div>
        {/* ダミーナビ */}
        <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
          {["HOME", "WORKS"].map((label) => (
            <span
              key={label}
              style={{
                fontFamily: "var(--sc-font-mono)",
                fontSize: "10px",
                letterSpacing: "0.1em",
                color: "var(--sc-muted)",
                padding: "0.25rem 0.6rem",
                border: "1px solid transparent",
                borderRadius: "2px",
              }}
            >
              {label}
            </span>
          ))}
        </div>
      </div>
      {/* アニメーションライン */}
      <div
        style={{
          height: "1px",
          background: "linear-gradient(90deg, transparent, #c8005a 40%, #005fa8 70%, transparent)",
          opacity: 0.6,
        }}
      />
    </div>
  );
}

function HeroPreview({ form, displayName }: { form: FormState; displayName: string }) {
  const h1Line1 = form.h1Line1 || displayName || "Yamaterous";

  return (
    <div
      style={{
        border: "1px solid rgba(200,0,90,0.15)",
        borderRadius: "4px",
        overflow: "hidden",
        background: "rgba(253,246,239,0.5)",
        alignSelf: "flex-start",
        minWidth: "260px",
      }}
      className="dark:!bg-neutral-900/40 dark:!border-pink-900/25"
    >
      <div style={previewLabelStyle}>// PREVIEW — LP HERO</div>
      <div
        style={{
          padding: "1.25rem 1.25rem 1.5rem",
          background: "rgba(253,246,239,0.85)",
          position: "relative",
          overflow: "hidden",
        }}
        className="dark:!bg-neutral-900/80"
      >
        {/* 縦ライン装飾 */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "30%",
            width: "1px",
            height: "100%",
            background: "rgba(200,0,90,0.04)",
            pointerEvents: "none",
          }}
        />

        {/* SYS_ONLINE バッジ */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.35rem",
            fontFamily: "var(--sc-font-mono)",
            fontSize: "10px",
            letterSpacing: "0.1em",
            color: "var(--sc-cyber)",
            marginBottom: "0.75rem",
          }}
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "var(--sc-cyber)",
              boxShadow: "0 0 5px var(--sc-cyber)",
              flexShrink: 0,
            }}
          />
          <span style={{ color: "var(--sc-muted)" }}>[</span>
          SYS_ONLINE
          <span style={{ color: "var(--sc-muted)" }}>]</span>
          {form.heroTagline && (
            <span style={{ color: "var(--sc-muted)", fontWeight: 400 }}>
              &nbsp;{form.heroTagline}
            </span>
          )}
        </div>

        {/* h1 */}
        <div
          style={{
            fontFamily: "var(--sc-font-jp)",
            fontWeight: 900,
            lineHeight: 1.15,
            marginBottom: "0.85rem",
          }}
        >
          {h1Line1 && (
            <div
              style={{
                fontSize: "1.6rem",
                color: "var(--sc-sakura)",
                textShadow: "0 0 20px rgba(200,0,90,0.35)",
              }}
            >
              {h1Line1}
            </div>
          )}
          {form.h1Line2 && (
            <div
              style={{ fontSize: "1.6rem", color: "var(--sc-text)" }}
              className="dark:!text-neutral-100"
            >
              {form.h1Line2}
            </div>
          )}
          {form.h1Line3 && (
            <div
              style={{
                fontSize: "1.6rem",
                color: "transparent",
                WebkitTextStroke: "1.5px var(--sc-cyber)",
                opacity: 0.6,
              }}
            >
              {form.h1Line3}
            </div>
          )}
        </div>

        {/* 挨拶 + 補足テキスト */}
        {(form.heroGreeting || form.heroSubText) && (
          <div
            style={{
              fontFamily: "var(--sc-font-jp)",
              fontSize: "12px",
              color: "var(--sc-muted)",
              lineHeight: 1.7,
              paddingLeft: "0.6rem",
              borderLeft: "2px solid rgba(200,0,90,0.25)",
            }}
          >
            {form.heroGreeting && (
              <div
                style={{
                  fontFamily: "var(--sc-font-mono)",
                  fontSize: "11px",
                  color: "var(--sc-cyber)",
                  letterSpacing: "0.06em",
                  marginBottom: "0.3rem",
                }}
              >
                {form.heroGreeting}
              </div>
            )}
            {form.heroSubText && (
              <div style={{ whiteSpace: "pre-wrap" }}>{form.heroSubText}</div>
            )}
          </div>
        )}

        {/* CTAボタン ダミー */}
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem", flexWrap: "wrap" }}>
          <span
            style={{
              fontFamily: "var(--sc-font-mono)",
              fontSize: "10px",
              padding: "0.3rem 0.75rem",
              background: "var(--sc-sakura)",
              color: "#fff",
              borderRadius: "2px",
              letterSpacing: "0.06em",
            }}
          >
            ↓ Works を見る
          </span>
          <span
            style={{
              fontFamily: "var(--sc-font-mono)",
              fontSize: "10px",
              padding: "0.3rem 0.75rem",
              border: "1px solid rgba(200,0,90,0.3)",
              color: "var(--sc-muted)",
              borderRadius: "2px",
              letterSpacing: "0.06em",
            }}
          >
            GitHub ↗
          </span>
        </div>
      </div>
    </div>
  );
}

function AdminSitePage() {
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useQuery(orpc.profile.get.queryOptions());

  const [form, setForm] = useState<FormState>({
    logoSubtitle: "",
    heroTagline: "",
    heroGreeting: "",
    h1Line1: "",
    h1Line2: "",
    h1Line3: "",
    heroSubText: "",
    theme: "sakura-cyber",
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
      theme: profile.theme,
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

  const displayName = profile?.displayName ?? "Yamaterous";

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
        style={{ display: "flex", flexDirection: "column", gap: "2.5rem", maxWidth: "960px" }}
      >
        {/* ── テーマ切り替え ── */}
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
            // DESIGN THEME
          </div>
          <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap" }}>
            {THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setForm((v) => ({ ...v, theme: t.id }))}
                style={{
                  cursor: "pointer",
                  border: form.theme === t.id
                    ? "2px solid var(--sc-sakura)"
                    : "2px solid rgba(200,0,90,0.15)",
                  borderRadius: "6px",
                  padding: "1.25rem 1.5rem",
                  background: form.theme === t.id
                    ? "var(--sc-surface)"
                    : "rgba(253,246,239,0.4)",
                  textAlign: "left",
                  transition: "all 0.15s",
                  minWidth: "200px",
                  position: "relative",
                  boxShadow: form.theme === t.id ? "0 2px 12px rgba(200,0,90,0.12)" : "none",
                }}
                className="dark:!bg-neutral-900/40"
              >
                {form.theme === t.id && (
                  <span
                    style={{
                      position: "absolute",
                      top: "0.5rem",
                      right: "0.65rem",
                      fontFamily: "var(--sc-font-mono)",
                      fontSize: "9px",
                      color: "var(--sc-sakura)",
                      letterSpacing: "0.1em",
                    }}
                  >
                    ACTIVE
                  </span>
                )}
                {/* カラーチップ */}
                <div style={{ display: "flex", gap: "0.4rem", marginBottom: "0.75rem" }}>
                  {t.colors.map((c) => (
                    <span
                      key={c}
                      style={{
                        width: "18px",
                        height: "18px",
                        borderRadius: "50%",
                        background: c,
                        border: "1px solid rgba(0,0,0,0.06)",
                        flexShrink: 0,
                      }}
                    />
                  ))}
                </div>
                <div
                  style={{
                    fontFamily: "var(--sc-font-mono)",
                    fontSize: "13px",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    color: "var(--sc-text)",
                    marginBottom: "0.3rem",
                  }}
                  className="dark:!text-neutral-100"
                >
                  {t.label}
                </div>
                <div
                  style={{
                    fontFamily: "var(--sc-font-jp)",
                    fontSize: "12px",
                    color: "var(--sc-muted)",
                  }}
                >
                  {t.desc}
                </div>
              </button>
            ))}
          </div>
        </section>
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
          <div style={{ display: "flex", gap: "2rem", alignItems: "flex-start", flexWrap: "wrap" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", flex: "1 1 300px", minWidth: "260px" }}>
              <Field
                label="ロゴ サブタイトル"
                hint="ロゴ下に小さく表示されるテキスト（例：やまてろす・ハブ）"
              >
                <Input
                  value={form.logoSubtitle}
                  onChange={set("logoSubtitle")}
                  style={inputStyle}
                  placeholder="やまてろす・ハブ"
                />
              </Field>
            </div>
            <HeaderPreview logoSubtitle={form.logoSubtitle} />
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
          <div style={{ display: "flex", gap: "2rem", alignItems: "flex-start", flexWrap: "wrap" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", flex: "1 1 300px", minWidth: "260px" }}>
              <Field
                label="SYS_ONLINE バッジ テキスト"
                hint="ヒーロー左上のバッジ後に続くテキスト（例：Portfolio · やまてろす）"
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
                hint="大見出し1行目。空欄の場合はプロフィールの表示名が使用されます"
              >
                <Input
                  value={form.h1Line1}
                  onChange={set("h1Line1")}
                  style={inputStyle}
                  placeholder={`（空欄の場合は表示名「${displayName}」を使用）`}
                />
              </Field>

              <Field
                label="h1 2行目（通常テキスト）"
                hint="大見出し2行目（例：のポートフォリオ）"
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
                hint="大見出し3行目。輪郭文字で表示されます（例：hub.）"
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
                hint="本文上部に表示されるコードスタイルの挨拶（例：Hello_World();）"
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
                hint="挨拶の下に表示される補足文。空欄の場合はプロフィールの自己紹介が使用されます"
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
            <HeroPreview form={form} displayName={displayName} />
          </div>
        </section>

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
          <div style={{ display: "flex", gap: "2rem", alignItems: "flex-start", flexWrap: "wrap" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", flex: "1 1 300px", minWidth: "260px" }}>
              <Field
                label="ロゴ サブタイトル"
                hint="ロゴ下に小さく表示されるテキスト（例：やまてろす・ハブ）"
              >
                <Input
                  value={form.logoSubtitle}
                  onChange={set("logoSubtitle")}
                  style={inputStyle}
                  placeholder="やまてろす・ハブ"
                />
              </Field>
            </div>
            <HeaderPreview logoSubtitle={form.logoSubtitle} />
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
