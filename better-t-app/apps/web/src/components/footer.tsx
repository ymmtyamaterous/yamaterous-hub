import { env } from "@better-t-app/env/web";

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid rgba(200,0,90,0.12)",
        background: "rgba(253,246,239,0.7)",
        backdropFilter: "blur(10px)",
        padding: "1.5rem 2rem",
        textAlign: "center",
        position: "relative",
        zIndex: 10,
      }}
      className="dark:!bg-neutral-900/70 dark:!border-pink-900/20"
    >
      <p
        style={{
          fontFamily: "var(--sc-font-mono)",
          fontSize: "12px",
          letterSpacing: "0.1em",
          color: "var(--sc-muted)",
        }}
        className="dark:!text-neutral-500"
      >
        © {new Date().getFullYear()}{" "}
        <span style={{ color: "var(--sc-sakura)" }}>Yamaterous</span>. All rights reserved.
        {env.VITE_CONTACT_FORM_URL && (
          <>
            {" "}|{" "}
            <a
              href={env.VITE_CONTACT_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--sc-cyber)", textDecoration: "none" }}
            >
              お問い合わせ
            </a>
          </>
        )}
      </p>
    </footer>
  );
}
