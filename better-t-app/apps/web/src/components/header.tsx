import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { orpc } from "@/utils/orpc";
import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";

export default function Header() {
  const { data: profile } = useQuery(orpc.profile.get.queryOptions());
  const logoSubtitle = profile?.logoSubtitle ?? "やまてろす・ハブ";
  return (
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
      <Link to="/" className="no-underline" style={{ textDecoration: "none" }}>
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

      {/* ナビゲーション */}
      <nav className="flex items-center gap-1">
        {(
          [
            { to: "/", label: "HOME" },
            { to: "/works", label: "WORKS" },
            { to: "/blog", label: "BLOG" },
          ] as const
        ).map(({ to, label }) => (
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
            className="hover:!text-[var(--sc-sakura)] hover:!border-pink-300 hover:!bg-[var(--sc-surface)] dark:!text-neutral-400"
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

      {/* ナビバー下線アニメーション */}
      <style>{`
        header::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, #c8005a, #005fa8, transparent);
          animation: nav-line 4s linear infinite;
          background-size: 200% 100%;
        }
        @keyframes nav-line { from { background-position: 200% 0 } to { background-position: -200% 0 } }
      `}</style>
    </header>
  );
}
