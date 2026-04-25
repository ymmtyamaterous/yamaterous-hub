import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@better-t-app/ui/components/button";
import { Input } from "@better-t-app/ui/components/input";
import { Label } from "@better-t-app/ui/components/label";

import { authClient } from "@/lib/auth-client";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/admin/profile")({
  component: AdminProfilePage,
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

function AdminProfilePage() {
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useQuery(orpc.profile.get.queryOptions());

  const [form, setForm] = useState({
    displayName: "",
    bio: "",
    avatarUrl: "",
    githubUrl: "",
    twitterUrl: "",
    siteUrl: "",
  });
  const [initialized, setInitialized] = useState(false);

  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isChangingPw, setIsChangingPw] = useState(false);

  if (profile && !initialized) {
    setForm({
      displayName: profile.displayName,
      bio: profile.bio,
      avatarUrl: profile.avatarUrl ?? "",
      githubUrl: profile.githubUrl ?? "",
      twitterUrl: profile.twitterUrl ?? "",
      siteUrl: profile.siteUrl ?? "",
    });
    setInitialized(true);
  }

  const updateMutation = useMutation(
    orpc.profile.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(orpc.profile.get.queryOptions());
        toast.success("プロフィールを更新しました");
      },
      onError: () => toast.error("更新に失敗しました"),
    }),
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateMutation.mutateAsync({
      displayName: form.displayName || undefined,
      bio: form.bio,
      avatarUrl: form.avatarUrl || null,
      githubUrl: form.githubUrl || null,
      twitterUrl: form.twitterUrl || null,
      siteUrl: form.siteUrl || null,
    });
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error("新しいパスワードが一致しません");
      return;
    }
    if (pwForm.newPassword.length < 8) {
      toast.error("パスワードは8文字以上で設定してください");
      return;
    }
    setIsChangingPw(true);
    try {
      const res = await authClient.changePassword({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
        revokeOtherSessions: false,
      });
      if (res.error) {
        toast.error(res.error.message ?? "パスワードの変更に失敗しました");
      } else {
        toast.success("パスワードを変更しました");
        setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      }
    } catch {
      toast.error("パスワードの変更に失敗しました");
    } finally {
      setIsChangingPw(false);
    }
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
        // PROFILE SETTINGS
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
        プロフィール
      </h1>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
          maxWidth: "560px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <Label style={labelStyle}>表示名</Label>
          <Input
            value={form.displayName}
            onChange={(e) =>
              setForm((v) => ({ ...v, displayName: e.target.value }))
            }
            style={inputStyle}
            required
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <Label style={labelStyle}>自己紹介</Label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm((v) => ({ ...v, bio: e.target.value }))}
            rows={5}
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

        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <Label style={labelStyle}>アバター URL</Label>
          <Input
            value={form.avatarUrl}
            onChange={(e) =>
              setForm((v) => ({ ...v, avatarUrl: e.target.value }))
            }
            style={inputStyle}
            type="url"
            placeholder="https://..."
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <Label style={labelStyle}>GitHub URL</Label>
          <Input
            value={form.githubUrl}
            onChange={(e) =>
              setForm((v) => ({ ...v, githubUrl: e.target.value }))
            }
            style={inputStyle}
            type="url"
            placeholder="https://github.com/..."
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <Label style={labelStyle}>Twitter / X URL</Label>
          <Input
            value={form.twitterUrl}
            onChange={(e) =>
              setForm((v) => ({ ...v, twitterUrl: e.target.value }))
            }
            style={inputStyle}
            type="url"
            placeholder="https://x.com/..."
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <Label style={labelStyle}>サイト URL</Label>
          <Input
            value={form.siteUrl}
            onChange={(e) =>
              setForm((v) => ({ ...v, siteUrl: e.target.value }))
            }
            style={inputStyle}
            type="url"
            placeholder="https://..."
          />
        </div>

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

      {/* ── パスワード変更 ── */}
      <div
        style={{
          marginTop: "3rem",
          paddingTop: "2rem",
          borderTop: "1px solid rgba(200,0,90,0.12)",
          maxWidth: "560px",
        }}
      >
        <div
          style={{
            fontFamily: "var(--sc-font-mono)",
            fontSize: "10px",
            letterSpacing: "0.2em",
            color: "var(--sc-cyber)",
            marginBottom: "0.5rem",
          }}
        >
          // SECURITY
        </div>
        <h2
          style={{
            fontFamily: "var(--sc-font-jp)",
            fontWeight: 900,
            fontSize: "1.3rem",
            color: "var(--sc-text)",
            marginBottom: "1.5rem",
          }}
          className="dark:!text-neutral-100"
        >
          パスワード変更
        </h2>

        <form
          onSubmit={handlePasswordChange}
          style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
        >
          {/* 現在のパスワード */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <Label style={labelStyle}>現在のパスワード</Label>
            <div style={{ position: "relative" }}>
              <Input
                type={showCurrent ? "text" : "password"}
                value={pwForm.currentPassword}
                onChange={(e) => setPwForm((v) => ({ ...v, currentPassword: e.target.value }))}
                style={{ ...inputStyle, paddingRight: "2.5rem" }}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowCurrent((v) => !v)}
                style={{
                  position: "absolute", right: "0.6rem", top: "50%",
                  transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer",
                  color: "var(--sc-muted)", padding: "0.2rem",
                }}
              >
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* 新しいパスワード */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <Label style={labelStyle}>新しいパスワード（8文字以上）</Label>
            <div style={{ position: "relative" }}>
              <Input
                type={showNew ? "text" : "password"}
                value={pwForm.newPassword}
                onChange={(e) => setPwForm((v) => ({ ...v, newPassword: e.target.value }))}
                style={{ ...inputStyle, paddingRight: "2.5rem" }}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                style={{
                  position: "absolute", right: "0.6rem", top: "50%",
                  transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer",
                  color: "var(--sc-muted)", padding: "0.2rem",
                }}
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* パスワード確認 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <Label style={labelStyle}>新しいパスワード（確認）</Label>
            <div style={{ position: "relative" }}>
              <Input
                type={showConfirm ? "text" : "password"}
                value={pwForm.confirmPassword}
                onChange={(e) => setPwForm((v) => ({ ...v, confirmPassword: e.target.value }))}
                style={{ ...inputStyle, paddingRight: "2.5rem" }}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                style={{
                  position: "absolute", right: "0.6rem", top: "50%",
                  transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer",
                  color: "var(--sc-muted)", padding: "0.2rem",
                }}
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <Button
              type="submit"
              disabled={isChangingPw}
              style={{
                fontFamily: "var(--sc-font-mono)",
                fontSize: "12px",
                letterSpacing: "0.1em",
                color: "#fff",
                background: "linear-gradient(90deg, var(--sc-cyber), var(--sc-cyber2))",
                border: "none",
                borderRadius: "2px",
                padding: "0.6rem 1.5rem",
                fontWeight: 700,
                cursor: isChangingPw ? "not-allowed" : "pointer",
              }}
            >
              {isChangingPw ? "変更中..." : "パスワードを変更する"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
