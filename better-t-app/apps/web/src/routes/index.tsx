import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

import { SeaCyberHome } from "@/components/sea-cyber-home";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  const profileQuery = useQuery(orpc.profile.get.queryOptions());
  const profile = profileQuery.data;

  if (profile?.theme === "sea-cyber") {
    return <SeaCyberHome />;
  }

  return <SakuraCyberHome />;
}

function SakuraCyberHome() {
  const profileQuery = useQuery(orpc.profile.get.queryOptions());
  const worksQuery = useQuery(orpc.works.list.queryOptions());
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const curRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);

  const profile = profileQuery.data;
  const featuredWorks = worksQuery.data?.slice(0, 3) ?? [];

  // ── Sakura petal canvas ──────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let W = 0, H = 0;
    let rafId: number;

    function resize() {
      W = canvas!.width = window.innerWidth;
      H = canvas!.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    const PETAL_COUNT = 38;
    const petals = Array.from({ length: PETAL_COUNT }, () => ({
      x: Math.random() * 1400,
      y: Math.random() * -600 - 20,
      r: 5 + Math.random() * 7,
      speed: 0.6 + Math.random() * 1.2,
      drift: (Math.random() - 0.5) * 0.6,
      spin: (Math.random() - 0.5) * 0.04,
      angle: Math.random() * Math.PI * 2,
      alpha: 0.55 + Math.random() * 0.35,
      hue: 330 + Math.random() * 25,
    }));

    function drawPetal(p: (typeof petals)[0]) {
      ctx!.save();
      ctx!.translate(p.x, p.y);
      ctx!.rotate(p.angle);
      ctx!.globalAlpha = p.alpha;
      ctx!.beginPath();
      ctx!.moveTo(0, -p.r);
      ctx!.bezierCurveTo(p.r * 0.8, -p.r * 0.5, p.r * 0.8, p.r * 0.5, 0, p.r);
      ctx!.bezierCurveTo(-p.r * 0.8, p.r * 0.5, -p.r * 0.8, -p.r * 0.5, 0, -p.r);
      const grad = ctx!.createRadialGradient(0, 0, 0, 0, 0, p.r);
      grad.addColorStop(0, `hsla(${p.hue},100%,72%,1)`);
      grad.addColorStop(1, `hsla(${p.hue},90%,55%,0.7)`);
      ctx!.fillStyle = grad;
      ctx!.shadowColor = `hsla(${p.hue},100%,75%,0.8)`;
      ctx!.shadowBlur = 8;
      ctx!.fill();
      ctx!.restore();
    }

    function animate() {
      ctx!.clearRect(0, 0, W, H);
      for (const p of petals) {
        p.y += p.speed;
        p.x += p.drift + Math.sin(p.y * 0.015) * 0.5;
        p.angle += p.spin;
        if (p.y > H + 20) {
          p.y = -20;
          p.x = Math.random() * W;
        }
        drawPetal(p);
      }
      rafId = requestAnimationFrame(animate);
    }
    animate();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  // ── Custom cursor ────────────────────────────────────────────────────────
  useEffect(() => {
    const cur = curRef.current;
    const trail = trailRef.current;
    if (!cur || !trail) return;

    let mx = 0, my = 0;
    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      cur.style.left = `${mx}px`;
      cur.style.top = `${my}px`;
    };
    document.addEventListener("mousemove", onMove);
    const iv = setInterval(() => {
      trail.style.left = `${mx}px`;
      trail.style.top = `${my}px`;
    }, 60);

    const els = document.querySelectorAll("a, button");
    const enter = () => cur.classList.add("big");
    const leave = () => cur.classList.remove("big");
    for (const el of els) {
      el.addEventListener("mouseenter", enter);
      el.addEventListener("mouseleave", leave);
    }

    return () => {
      document.removeEventListener("mousemove", onMove);
      clearInterval(iv);
      for (const el of els) {
        el.removeEventListener("mouseenter", enter);
        el.removeEventListener("mouseleave", leave);
      }
    };
  }, []);

  // ── Scroll reveal ────────────────────────────────────────────────────────
  useEffect(() => {
    const els = document.querySelectorAll(".sc-reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e, i) => {
          if (e.isIntersecting) {
            setTimeout(
              () => (e.target as HTMLElement).classList.add("sc-visible"),
              i * 90,
            );
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1 },
    );
    for (const el of els) io.observe(el);
    return () => io.disconnect();
  }, [featuredWorks]);

  const displayName = profile?.h1Line1 || profile?.displayName || "";
  const h1Line2 = profile?.h1Line2 ?? "のポートフォリオ";
  const h1Line3 = profile?.h1Line3 ?? "hub.";
  const heroTagline = profile?.heroTagline ?? "Portfolio · やまてろす";
  const heroGreeting = profile?.heroGreeting ?? "Hello_World();";
  const heroSubText = profile?.heroSubText || profile?.bio || "";

  return (
    <div style={{ position: "relative", overflow: "hidden" }}>
      {/* Custom cursor */}
      <div ref={curRef} className="sc-cur" />
      <div ref={trailRef} className="sc-cur-trail" />

      {/* Hero Section */}
      <section className="sc-hero">
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            pointerEvents: "none",
          }}
        />
        {/* 縦ライン */}
        {[20, 50, 80].map((left, i) => (
          <div
            key={left}
            className="sc-vline"
            style={{
              left: `${left}%`,
              animationDelay: `${i * 2}s`,
              opacity: i === 1 ? 0.06 : undefined,
            }}
          />
        ))}

        {/* Hero Left */}
        <div className="sc-hero-left">
          {/* SYSTEM ONLINE */}
          <div className="sc-hero-sys">
            <span className="sc-sys-dot" />
            <span style={{ color: "var(--sc-muted)" }}>[</span>
            SYS_ONLINE
            <span style={{ color: "var(--sc-muted)" }}>]</span>
            &nbsp; {heroTagline}
          </div>

          {/* h1 with glitch */}
          <h1 className="sc-h1">
            {profile ? (
              <>
                {displayName && (
                  <span className="sc-h1-cyber" data-text={displayName}>
                    {displayName}
                  </span>
                )}
                {h1Line2 && <span className="sc-h1-white">{h1Line2}</span>}
                {h1Line3 && <span className="sc-h1-outline">{h1Line3}</span>}
              </>
            ) : (
              <span style={{ color: "var(--sc-muted)", fontWeight: 300 }}>
                Loading...
              </span>
            )}
          </h1>

          {/* hero sub */}
          {heroSubText && (
            <p className="sc-hero-sub">
              {heroGreeting && <><span className="sc-hi">{heroGreeting}</span><br /></>}
              {heroSubText}
            </p>
          )}

          {/* CTA buttons */}
          <div className="sc-hero-cta">
            <Link
              to="/works"
              className="sc-btn sc-btn-sakura"
            >
              <span>↓ Works を見る</span>
            </Link>
            {profile?.githubUrl && (
              <a
                href={profile.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="sc-btn sc-btn-ghost"
              >
                GitHub ↗
              </a>
            )}
            {profile?.twitterUrl && (
              <a
                href={profile.twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="sc-btn sc-btn-ghost"
              >
                X / Twitter ↗
              </a>
            )}
            {profile?.siteUrl && (
              <a
                href={profile.siteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="sc-btn sc-btn-ghost"
              >
                Website ↗
              </a>
            )}
          </div>
        </div>

        {/* Terminal card */}
        <div className="sc-hero-terminal">
          <div className="sc-terminal">
            <div className="sc-term-bar">
              <span className="sc-term-dot sc-td1" />
              <span className="sc-term-dot sc-td2" />
              <span className="sc-term-dot sc-td3" />
              <span className="sc-term-title">~/portfolio</span>
            </div>
            <div className="sc-term-body">
              <span className="sc-tl">
                <span className="sc-tl-prompt">❯ </span>
                <span className="sc-tl-cmd">whoami</span>
              </span>
              <span className="sc-tl sc-tl-pink">{profile?.displayName || "Yamaterous"}</span>
              <span className="sc-tl">&nbsp;</span>
              <span className="sc-tl">
                <span className="sc-tl-prompt">❯ </span>
                <span className="sc-tl-cmd">cat profile.json</span>
              </span>
              <span className="sc-tl sc-tl-out">
                role: <span className="sc-tl-cyan">Full-Stack Dev</span>
              </span>
              <span className="sc-tl sc-tl-out">
                stack: <span className="sc-tl-cyan">TypeScript</span>
              </span>
              <span className="sc-tl sc-tl-out">
                runtime: <span className="sc-tl-cyan">Bun / React</span>
              </span>
              <span className="sc-tl">&nbsp;</span>
              <span className="sc-tl">
                <span className="sc-tl-prompt">❯ </span>
                <span className="sc-tl-cmd">git log --oneline</span>
              </span>
              <span className="sc-tl sc-tl-out">
                <span className="sc-tl-green">a3f2c1b</span> feat: new project 🌸
              </span>
              <span className="sc-tl sc-tl-out">
                <span className="sc-tl-green">9d8e7f6</span> fix: optimized perf
              </span>
              <span className="sc-tl sc-tl-out">
                <span className="sc-tl-green">2b1a0e9</span> init: hello world
              </span>
              <span className="sc-tl">&nbsp;</span>
              <span className="sc-tl">
                <span className="sc-tl-prompt">❯ </span>
                <span className="sc-cursor-blink" />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 桜ディバイダー */}
      <div className="sc-sakura-divider">🌸 🌸 🌸 🌸 🌸</div>

      {/* 注目作品セクション */}
      {featuredWorks.length > 0 && (
        <section
          style={{
            padding: "clamp(3rem, 8vw, 6rem) clamp(1.25rem, 5vw, 3rem)",
            background: "var(--sc-bg2)",
            borderTop: "1px solid rgba(200,0,90,0.1)",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
            <div className="sc-s-tag sc-reveal">Selected Projects</div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                flexWrap: "wrap",
                gap: "0.75rem",
                marginBottom: "3rem",
              }}
            >
              <h2
                className="sc-reveal"
                style={{
                  fontFamily: "var(--sc-font-jp)",
                  fontWeight: 900,
                  fontSize: "clamp(2.2rem, 4vw, 3.4rem)",
                  letterSpacing: "-0.02em",
                  lineHeight: 1.1,
                  color: "var(--sc-text)",
                  margin: 0,
                }}
              >
                Recent{" "}
                <span style={{ color: "var(--sc-cyber)" }}>Works</span>
              </h2>
              <Link
                to="/works"
                style={{
                  fontFamily: "var(--sc-font-mono)",
                  fontSize: "12px",
                  letterSpacing: "0.1em",
                  color: "var(--sc-cyber)",
                  textDecoration: "none",
                }}
                className="hover:underline"
              >
                作品を全て見る →
              </Link>
            </div>

            <div className="sc-works-grid">
              {featuredWorks.map((w) => (
                <Link
                  key={w.id}
                  to="/works/$workId"
                  params={{ workId: w.id }}
                  style={{ textDecoration: "none" }}
                  className="sc-reveal"
                >
                  <div className="sc-wk-card">
                    {w.thumbnailUrl ? (
                      <div className="sc-wk-thumb">
                        <img
                          src={w.thumbnailUrl}
                          alt={w.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                        <div className="sc-wk-thumb-glow" />
                      </div>
                    ) : (
                      <div className="sc-wk-thumb sc-wk-thumb-placeholder">
                        <span style={{ fontSize: "3rem" }}>◈</span>
                        <div className="sc-wk-thumb-glow" />
                      </div>
                    )}
                    <div className="sc-wk-body">
                      {w.tags.length > 0 && (
                        <div className="sc-wk-tags">
                          {w.tags.map((t) => (
                            <span key={t.id} className="sc-wk-tag">
                              {t.name}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="sc-wk-title">{w.title}</div>
                      <div className="sc-wk-desc">{w.description}</div>
                      <span className="sc-wk-link">View Project →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
