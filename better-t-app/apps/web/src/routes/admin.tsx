import { Link, Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";

import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/admin")({
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (!session.data) {
      throw redirect({ to: "/admin-login-hub" });
    }
    return { session: session.data };
  },
  component: AdminLayout,
});

const navItems = [
  { to: "/admin" as const, label: "ダッシュボード", exact: true },
  { to: "/admin/works" as const, label: "作品管理", exact: false },
  { to: "/admin/posts" as const, label: "記事管理", exact: false },
  { to: "/admin/podcasts" as const, label: "Podcast管理", exact: false },
  { to: "/admin/categories" as const, label: "カテゴリ管理", exact: false },
  { to: "/admin/site" as const, label: "サイト設定", exact: false },
  { to: "/admin/profile" as const, label: "プロフィール", exact: false },
] as const;

function AdminLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const sidebarContent = (
    <>
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
        {navItems.map(({ to, label, exact }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact }}
            onClick={() => setDrawerOpen(false)}
            style={{
              display: "block",
              fontFamily: "var(--sc-font-mono)",
              fontSize: "13px",
              letterSpacing: "0.08em",
              color: "var(--sc-muted)",
              textDecoration: "none",
              padding: "0.6rem 1.5rem",
              paddingLeft: "calc(1.5rem - 2px)",
              borderLeft: "2px solid transparent",
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
    </>
  );

  return (
    <div style={{ display: "flex", minHeight: "calc(100vh - 72px)" }}>
      {/* デスクトップサイドバー (md以上で表示) */}
      <aside
        className="sc-admin-sidebar-desktop"
        style={{
          width: "220px",
          flexShrink: 0,
          background: "rgba(247,237,227,0.8)",
          borderRight: "1px solid rgba(200,0,90,0.12)",
          padding: "2rem 0",
        }}
      >
        {sidebarContent}
      </aside>

      {/* コンテンツラッパー: モバイルヘッダー + メインを縦積み */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* モバイル: ハンバーガーボタン */}
        <div className="sc-admin-mobile-header">
          <button
            type="button"
            aria-label="管理メニューを開く"
            onClick={() => setDrawerOpen(true)}
            style={{
              background: "rgba(247,237,227,0.9)",
              border: "1px solid rgba(200,0,90,0.2)",
              borderRadius: "3px",
              cursor: "pointer",
              padding: "0.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontFamily: "var(--sc-font-mono)",
              fontSize: "12px",
              color: "var(--sc-muted)",
              letterSpacing: "0.08em",
            }}
            className="dark:!bg-neutral-800/80 dark:!border-pink-900/30 dark:!text-neutral-400"
          >
            <Menu size={18} />
            MENU
          </button>
        </div>

        {/* メインコンテンツ */}
        <main style={{ flex: 1, padding: "clamp(1.25rem, 4vw, 2.5rem)", overflow: "auto", minWidth: 0 }}>
          <Outlet />
        </main>
      </div>

      {/* モバイルドロワーオーバーレイ */}
      {drawerOpen && (
        // biome-ignore lint/a11y/useKeyWithClickEvents: オーバーレイクリックで閉じる
        <div
          onClick={() => setDrawerOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            zIndex: 600,
          }}
        />
      )}

      {/* モバイルドロワー本体 */}
      <aside
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: "240px",
          background: "rgba(247,237,227,0.97)",
          backdropFilter: "blur(20px)",
          borderRight: "1px solid rgba(200,0,90,0.15)",
          zIndex: 700,
          padding: "1.5rem 0",
          transform: drawerOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1)",
        }}
        className="sc-admin-drawer dark:!bg-neutral-900/97 dark:!border-pink-900/30"
      >
        {/* 閉じるボタン */}
        <div style={{ display: "flex", justifyContent: "flex-end", padding: "0 1rem", marginBottom: "1.5rem" }}>
          <button
            type="button"
            aria-label="メニューを閉じる"
            onClick={() => setDrawerOpen(false)}
            style={{
              background: "transparent",
              border: "1px solid rgba(200,0,90,0.2)",
              borderRadius: "3px",
              cursor: "pointer",
              padding: "0.3rem",
              display: "flex",
              alignItems: "center",
            }}
          >
            <X size={18} style={{ color: "var(--sc-muted)" }} />
          </button>
        </div>
        {sidebarContent}
      </aside>
    </div>
  );
}
