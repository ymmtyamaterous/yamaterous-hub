import { Button } from "@better-t-app/ui/components/button";
import { Input } from "@better-t-app/ui/components/input";
import { Label } from "@better-t-app/ui/components/label";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";

import { authClient } from "@/lib/auth-client";

export default function SignInForm() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      await authClient.signIn.email(
        {
          email: value.email,
          password: value.password,
        },
        {
          onSuccess: () => {
            navigate({ to: "/admin" });
            toast.success("ログインしました");
          },
          onError: (error) => {
            toast.error(error.error.message || "ログインに失敗しました");
          },
        },
      );
    },
    validators: {
      onSubmit: z.object({
        email: z.email("メールアドレスの形式が正しくありません"),
        password: z.string().min(1, "パスワードを入力してください"),
      }),
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
    >
      {/* メールアドレス */}
      <form.Field name="email">
        {(field) => (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <Label
              htmlFor={field.name}
              style={{
                fontFamily: "var(--sc-font-mono)",
                fontSize: "11px",
                letterSpacing: "0.12em",
                color: "var(--sc-muted)",
              }}
              className="dark:!text-neutral-400"
            >
              EMAIL
            </Label>
            <Input
              id={field.name}
              name={field.name}
              type="email"
              autoComplete="email"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              style={{
                fontFamily: "var(--sc-font-mono)",
                borderColor: "rgba(200,0,90,0.2)",
                borderRadius: "2px",
              }}
            />
            {field.state.meta.errors.map((error) => (
              <p
                key={error?.message}
                style={{
                  fontFamily: "var(--sc-font-mono)",
                  fontSize: "11px",
                  color: "var(--sc-cyber3)",
                }}
              >
                {error?.message}
              </p>
            ))}
          </div>
        )}
      </form.Field>

      {/* パスワード */}
      <form.Field name="password">
        {(field) => (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <Label
              htmlFor={field.name}
              style={{
                fontFamily: "var(--sc-font-mono)",
                fontSize: "11px",
                letterSpacing: "0.12em",
                color: "var(--sc-muted)",
              }}
              className="dark:!text-neutral-400"
            >
              PASSWORD
            </Label>
            <div style={{ position: "relative" }}>
              <Input
                id={field.name}
                name={field.name}
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                style={{
                  fontFamily: "var(--sc-font-mono)",
                  borderColor: "rgba(200,0,90,0.2)",
                  borderRadius: "2px",
                  paddingRight: "2.5rem",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                style={{
                  position: "absolute",
                  right: "0.6rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--sc-muted)",
                  display: "flex",
                  alignItems: "center",
                }}
                aria-label={showPassword ? "パスワードを隠す" : "パスワードを表示"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {field.state.meta.errors.map((error) => (
              <p
                key={error?.message}
                style={{
                  fontFamily: "var(--sc-font-mono)",
                  fontSize: "11px",
                  color: "var(--sc-cyber3)",
                }}
              >
                {error?.message}
              </p>
            ))}
          </div>
        )}
      </form.Field>

      {/* 送信ボタン */}
      <form.Subscribe
        selector={(state) => ({ canSubmit: state.canSubmit, isSubmitting: state.isSubmitting })}
      >
        {({ canSubmit, isSubmitting }) => (
          <Button
            type="submit"
            disabled={!canSubmit || isSubmitting}
            style={{
              fontFamily: "var(--sc-font-mono)",
              fontSize: "13px",
              letterSpacing: "0.12em",
              color: "#fff",
              background: "var(--sc-sakura)",
              border: "none",
              borderRadius: "2px",
              padding: "0.6rem 1rem",
              fontWeight: 700,
              boxShadow: "0 2px 12px rgba(200,0,90,0.3)",
              cursor: canSubmit ? "pointer" : "not-allowed",
              width: "100%",
            }}
          >
            {isSubmitting ? "SIGNING IN..." : "SIGN IN"}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
