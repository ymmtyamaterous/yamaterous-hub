import { Link, Outlet, createFileRoute, redirect } from "@tanstack/react-router";

import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/admin")({
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (!session.data) {
      throw redirect({ to: "/login" });
    }
    return { session: session.data };
  },
  component: AdminLayout,
});

const navItems = [
  { to: "/admin" as const, label: "ダッシュボード", exact: true },
  { to: "/admin/works" as const, label: "作品管理" },
  { to: "/admin/profile" as const, label: "プロフィール" },
] as const;

function AdminLayout() {
  return (
    <div style={{ display: "flex", minHeight: "calc(100vh - 72px)" }}>
      {/* サイドバー */}
      <aside
        style={{
          width: "220px",
          flexShrink: 0,
          background: "rgba(247,237,227,0.8)",
          borderRight: "1px solid rgba(200,0,90,0.12)",
          padding: "2rem 0",
        }}
        className="dark:!bg-neutral-900/80 dark:!border-pink-900/20"
      >
        <div
          style={{
            fontFamily: "var(--sc-font-mono)",
            fontSize: "10px",
            letterSpacing: "0.2em",
            color: "var(--sc-sakura)",
            padding: "0 1.5rem",
            marginBottom: "1rem",
          }}
        >
          // ADMIN
        </div>
        <nav>
          {navItems.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              style={{
                display: "block",
                fontFamily: "var(--sc-font-mono)",
                fontSize: "13px",
                letterSpacing: "0.08em",
                color: "var(--sc-muted)",
                textDecoration: "none",
                padding: "0.6rem 1.5rem",
                transition: "all 0.15s",
              }}
              className="hover:!text-[var(--sc-sakura)] hover:!bg-[var(--sc-surface)] dark:!text-neutral-400"
              activeProps={{
                style: {
                  color: "var(--sc-sakura)",
                  background: "var(--sc-surface)",
                  borderLeft: "2px solid var(--sc-sakura)",
                  paddingLeft: "calc(1.5rem - 2px)",
                },
              }}
            >
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* メインコンテンツ */}
      <main style={{ flex: 1, padding: "2.5rem", overflow: "auto" }}>
        <Outlet />
      </main>
    </div>
  );
}
