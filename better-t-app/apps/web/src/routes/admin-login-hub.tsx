import { createFileRoute, redirect } from "@tanstack/react-router";

import SignInForm from "@/components/sign-in-form";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/admin-login-hub")({
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (session.data) {
      throw redirect({ to: "/admin" });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div
      style={{
        minHeight: "calc(100vh - 72px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "rgba(253,246,239,0.95)",
          border: "1px solid rgba(200,0,90,0.15)",
          borderRadius: "4px",
          padding: "2.5rem",
          boxShadow: "0 4px 24px rgba(200,0,90,0.08)",
        }}
        className="dark:!bg-neutral-900/95 dark:!border-pink-900/25"
      >
        <div style={{ marginBottom: "2rem", textAlign: "center" }}>
          <div
            style={{
              fontFamily: "var(--sc-font-mono)",
              fontSize: "11px",
              letterSpacing: "0.2em",
              color: "var(--sc-cyber)",
              marginBottom: "0.5rem",
            }}
          >
            // ACCESS CONTROL
          </div>
          <h1
            style={{
              fontFamily: "var(--sc-font-mono)",
              fontWeight: 700,
              fontSize: "1.8rem",
              letterSpacing: "0.12em",
              color: "var(--sc-text)",
            }}
            className="dark:!text-neutral-100"
          >
            <span style={{ color: "var(--sc-sakura)" }}>S</span>IGN IN
          </h1>
        </div>
        <SignInForm />
      </div>
    </div>
  );
}
