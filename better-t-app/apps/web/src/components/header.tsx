import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";

import { orpc } from "@/utils/orpc";
import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";

const NAV_ITEMS = [
  { to: "/", label: "HOME" },
  { to: "/works", label: "WORKS" },
  { to: "/blog", label: "BLOG" },
  { to: "/podcast", label: "PODCAST" },
  { to: "/profile", label: "PROFILE" },
] as const;

export default function Header() {
  const { data: profile } = useQuery(orpc.profile.get.queryOptions());
  const logoSubtitle = profile?.logoSubtitle ?? "やまてろす・ハブ";
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 500,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1.1rem 2rem",
          background: "rgba(253,246,239,0.88)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(200,0,90,0.15)",
        }}
        className="dark:!bg-neutral-900/90 dark:!border-pink-900/30"
      >
        {/* ロゴ */}
        <Link to="/" className="no-underline" style={{ textDecoration: "none" }} onClick={() => setMobileOpen(false)}>
          <div
            style={{
              fontFamily: "var(--sc-font-jp)",
              fontWeight: 900,
              fontSize: "1.2rem",
              letterSpacing: "0.04em",
              color: "var(--sc-text)",
              lineHeight: 1.1,
            }}
            className="dark:!text-neutral-100"
          >
            <span style={{ color: "var(--sc-sakura)", textShadow: "var(--sc-glow-pink)" }}>
              Yamaterous
            </span>
            <span style={{ color: "var(--sc-text)" }} className="dark:!text-neutral-100">
              {" Hub"}
            </span>
            <span
              style={{
                display: "block",
                fontSize: "9px",
                letterSpacing: "0.18em",
                color: "var(--sc-muted)",
                marginTop: "-2px",
                fontFamily: "var(--sc-font-mono)",
              }}
              className="dark:!text-neutral-400"
            >
              {logoSubtitle}
            </span>
          </div>
        </Link>

        {/* デスクトップナビゲーション */}
        <nav className="sc-nav-desktop items-center gap-1">
          {NAV_ITEMS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              style={{
                fontFamily: "var(--sc-font-mono)",
                fontSize: "12px",
                letterSpacing: "0.12em",
                color: "var(--sc-muted)",
                textDecoration: "none",
                padding: "0.4rem 0.9rem",
                border: "1px solid transparent",
                borderRadius: "2px",
                transition: "all 0.2s",
                fontWeight: 600,
              }}
              className="sc-nav-link hover:!text-[var(--sc-sakura)] hover:!border-[var(--sc-sakura)] hover:!bg-[var(--sc-surface)] dark:!text-neutral-400"
              activeProps={{
                style: {
                  color: "var(--sc-sakura)",
                  border: "1px solid rgba(200,0,90,0.3)",
                  background: "var(--sc-surface)",
                },
              }}
            >
              {label}
            </Link>
          ))}
          <div className="flex items-center gap-2 ml-2">
            <ModeToggle />
            <UserMenu />
          </div>
        </nav>

        {/* モバイル: アイコン群 + ハンバーガー */}
        <div className="sc-nav-mobile-btn items-center gap-2">
          <ModeToggle />
          <UserMenu />
          <button
            type="button"
            aria-label="メニューを開く"
            onClick={() => setMobileOpen(true)}
            style={{
              background: "transparent",
              border: "1px solid rgba(200,0,90,0.2)",
              borderRadius: "3px",
              cursor: "pointer",
              padding: "0.3rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Menu size={20} style={{ color: "var(--sc-muted)" }} />
          </button>
        </div>

        {/* ナビバー下線アニメーション */}
        <style>{`
          header::after {
            content: '';
            position: absolute;
            bottom: 0; left: 0; right: 0;
            height: 1px;
            background: linear-gradient(90deg, transparent, var(--sc-sakura), var(--sc-cyber), transparent);
            animation: nav-line 4s linear infinite;
            background-size: 200% 100%;
          }
          @keyframes nav-line { from { background-position: 200% 0 } to { background-position: -200% 0 } }
        `}</style>
      </header>

      {/* モバイルドロワーオーバーレイ */}
      {mobileOpen && (
        // biome-ignore lint/a11y/useKeyWithClickEvents: オーバーレイクリックで閉じる
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            zIndex: 600,
          }}
        />
      )}

      {/* モバイルドロワー本体 */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "260px",
          background: "rgba(253,246,239,0.97)",
          backdropFilter: "blur(20px)",
          borderLeft: "1px solid rgba(200,0,90,0.15)",
          zIndex: 700,
          display: "flex",
          flexDirection: "column",
          padding: "1.25rem",
          transform: mobileOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1)",
        }}
        className="dark:!bg-neutral-900/97 dark:!border-pink-900/30"
      >
        {/* 閉じるボタン */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1.5rem" }}>
          <button
            type="button"
            aria-label="メニューを閉じる"
            onClick={() => setMobileOpen(false)}
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
            <X size={20} style={{ color: "var(--sc-muted)" }} />
          </button>
        </div>

        {/* ナビリンク */}
        <nav style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          {NAV_ITEMS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              style={{
                fontFamily: "var(--sc-font-mono)",
                fontSize: "13px",
                letterSpacing: "0.14em",
                color: "var(--sc-muted)",
                textDecoration: "none",
                padding: "0.75rem 1rem",
                borderRadius: "3px",
                border: "1px solid transparent",
                transition: "all 0.2s",
                fontWeight: 600,
              }}
              className="hover:!text-[var(--sc-sakura)] hover:!border-[var(--sc-sakura)] hover:!bg-[var(--sc-surface)] dark:!text-neutral-400"
              activeProps={{
                style: {
                  color: "var(--sc-sakura)",
                  border: "1px solid rgba(200,0,90,0.3)",
                  background: "var(--sc-surface)",
                },
              }}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
