import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
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
            padding: "6rem 3rem",
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

      <style>{`
        /* ── Custom cursor ── */
        .sc-cur {
          position: fixed; pointer-events: none; z-index: 9999;
          width: 12px; height: 12px;
          background: var(--sc-sakura);
          border-radius: 50%;
          transform: translate(-50%,-50%);
          box-shadow: var(--sc-glow-pink);
          transition: width .2s, height .2s, background .2s;
          mix-blend-mode: multiply;
        }
        .sc-cur.big {
          width: 48px; height: 48px;
          background: rgba(200,0,90,0.1);
          border: 1px solid var(--sc-sakura);
        }
        .sc-cur-trail {
          position: fixed; pointer-events: none; z-index: 9998;
          width: 36px; height: 36px;
          border: 1px solid rgba(200,0,90,0.35);
          border-radius: 50%;
          transform: translate(-50%,-50%);
          transition: left .12s ease, top .12s ease;
          mix-blend-mode: multiply;
        }

        /* ── Hero ── */
        .sc-hero {
          min-height: 100vh;
          display: flex; align-items: center;
          padding: 100px 3rem 4rem;
          position: relative; overflow: hidden;
        }
        .sc-vline {
          position: absolute; top: 0; bottom: 0; width: 1px;
          background: linear-gradient(180deg, transparent 0%, var(--sc-sakura) 40%, var(--sc-cyber) 70%, transparent 100%);
          opacity: 0.10;
          animation: sc-vscan 6s ease-in-out infinite;
        }
        @keyframes sc-vscan { 0%,100%{opacity:0.06} 50%{opacity:0.14} }

        .sc-hero-left {
          position: relative; z-index: 10;
          max-width: 680px;
        }

        /* SYSTEM ONLINE */
        .sc-hero-sys {
          font-family: var(--sc-font-mono);
          font-size: 12px; letter-spacing: 0.18em; text-transform: uppercase;
          color: var(--sc-cyber); margin-bottom: 1.2rem;
          display: flex; align-items: center; gap: 0.75rem;
          font-weight: 600;
        }
        .sc-sys-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: var(--sc-cyber);
          box-shadow: 0 0 6px var(--sc-cyber);
          animation: sc-blink 2s ease-in-out infinite;
          flex-shrink: 0;
        }
        @keyframes sc-blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

        /* H1 */
        .sc-h1 {
          font-family: var(--sc-font-jp);
          font-weight: 900;
          font-size: clamp(3rem, 7vw, 6.5rem);
          line-height: 1.0;
          letter-spacing: -0.02em;
          margin-bottom: 0.5rem;
          position: relative;
        }
        .sc-h1-cyber {
          display: block;
          color: var(--sc-sakura);
          position: relative;
        }
        .sc-h1-cyber::before, .sc-h1-cyber::after {
          content: attr(data-text);
          position: absolute; top: 0; left: 0;
          width: 100%;
        }
        .sc-h1-cyber::before {
          color: var(--sc-cyber);
          animation: sc-glitch1 4s infinite;
          clip-path: polygon(0 30%, 100% 30%, 100% 50%, 0 50%);
        }
        .sc-h1-cyber::after {
          color: var(--sc-cyber3);
          animation: sc-glitch2 4s infinite;
          clip-path: polygon(0 60%, 100% 60%, 100% 80%, 0 80%);
        }
        @keyframes sc-glitch1 {
          0%,92%,100% { transform: none; opacity: 0; }
          93% { transform: translateX(-3px); opacity: 0.7; }
          95% { transform: translateX(3px); opacity: 0.4; }
          97% { transform: translateX(0); opacity: 0; }
        }
        @keyframes sc-glitch2 {
          0%,94%,100% { transform: none; opacity: 0; }
          95% { transform: translateX(4px); opacity: 0.6; }
          97% { transform: translateX(-2px); opacity: 0.3; }
          99% { transform: translateX(0); opacity: 0; }
        }
        .sc-h1-white {
          display: block;
          color: var(--sc-text);
        }
        .sc-h1-outline {
          display: block;
          color: transparent;
          -webkit-text-stroke: 2px var(--sc-cyber);
        }

        /* Hero sub */
        .sc-hero-sub {
          font-family: var(--sc-font-mono);
          font-size: 15px; color: var(--sc-muted);
          max-width: 50ch; margin: 1.75rem 0 2.5rem;
          line-height: 2;
          border-left: 3px solid rgba(200,0,90,0.3);
          padding-left: 1rem;
        }
        .sc-hi { color: var(--sc-sakura); font-weight: 700; }

        /* CTA buttons */
        .sc-hero-cta { display: flex; gap: 1rem; flex-wrap: wrap; align-items: center; }
        .sc-btn {
          font-family: var(--sc-font-mono); font-size: 11px;
          letter-spacing: 0.1em; text-transform: uppercase;
          text-decoration: none; padding: 0.75rem 1.75rem;
          border-radius: 2px; transition: all 0.2s; cursor: pointer;
          display: inline-flex; align-items: center; gap: 0.5rem;
        }
        .sc-btn-sakura {
          background: linear-gradient(90deg, var(--sc-sakura), var(--sc-cyber3));
          color: #fff;
          box-shadow: 0 4px 16px rgba(200,0,90,0.3);
          border: none;
          position: relative; overflow: hidden;
        }
        .sc-btn-sakura::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(90deg, var(--sc-cyber3), var(--sc-sakura));
          opacity: 0; transition: opacity 0.3s;
        }
        .sc-btn-sakura:hover::before { opacity: 1; }
        .sc-btn-sakura:hover { box-shadow: 0 6px 24px rgba(200,0,90,0.4); transform: translateY(-2px); }
        .sc-btn-sakura span { position: relative; z-index: 1; }
        .sc-btn-ghost {
          border: 1.5px solid rgba(0,95,168,0.5);
          color: var(--sc-cyber);
          background: rgba(0,95,168,0.05);
          font-weight: 700;
        }
        .sc-btn-ghost:hover {
          border-color: var(--sc-cyber);
          background: rgba(0,95,168,0.1);
          box-shadow: 0 4px 16px rgba(0,95,168,0.15);
          transform: translateY(-2px);
        }

        /* ── Terminal card ── */
        .sc-hero-terminal {
          position: absolute; right: 4%; top: 50%;
          transform: translateY(-50%);
          z-index: 10; width: 300px;
        }
        .sc-terminal {
          background: #1e0f18;
          border: 1px solid rgba(200,0,90,0.35);
          border-radius: 8px;
          overflow: hidden;
          box-shadow:
            0 0 0 1px rgba(200,0,90,0.1),
            0 8px 32px rgba(0,0,0,0.2),
            0 0 40px rgba(200,0,90,0.08),
            inset 0 1px 0 rgba(255,200,220,0.1);
          animation: sc-term-float 5s ease-in-out infinite;
        }
        @keyframes sc-term-float {
          0%,100%{ transform: translateY(0) rotateX(1deg); }
          50%    { transform: translateY(-10px) rotateX(-1deg); }
        }
        .sc-term-bar {
          background: rgba(255,180,210,0.1);
          border-bottom: 1px solid rgba(200,0,90,0.2);
          padding: 0.6rem 1rem;
          display: flex; align-items: center; gap: 0.5rem;
        }
        .sc-term-dot { width: 8px; height: 8px; border-radius: 50%; }
        .sc-td1 { background: var(--sc-cyber3); box-shadow: 0 0 6px var(--sc-cyber3); }
        .sc-td2 { background: var(--sc-neon-y); box-shadow: 0 0 6px var(--sc-neon-y); }
        .sc-td3 { background: var(--sc-cyber); box-shadow: 0 0 6px var(--sc-cyber); }
        .sc-term-title { font-size: 10px; letter-spacing: 0.1em; color: var(--sc-muted); margin-left: auto; font-family: var(--sc-font-mono); }
        .sc-term-body { padding: 1.25rem; font-size: 13px; line-height: 2; font-family: var(--sc-font-mono); }
        .sc-tl { display: block; }
        .sc-tl-prompt { color: #ff80b0; }
        .sc-tl-cmd    { color: #f0e0ea; }
        .sc-tl-out    { color: #9a7888; padding-left: 1.2em; }
        .sc-tl-cyan   { color: #60b8ff; }
        .sc-tl-pink   { color: #ffaad0; }
        .sc-tl-green  { color: #80e880; }
        .sc-cursor-blink {
          display: inline-block; width: 8px; height: 13px;
          background: var(--sc-sakura);
          animation: sc-cblink 1.1s step-end infinite;
          vertical-align: middle;
          box-shadow: 0 0 6px var(--sc-sakura);
        }
        @keyframes sc-cblink { 0%,100%{opacity:1} 50%{opacity:0} }

        /* ── Sakura divider ── */
        .sc-sakura-divider {
          text-align: center; padding: 1.5rem 0;
          font-size: 1.2rem; letter-spacing: 1rem;
          color: rgba(200,0,90,0.4);
          border-top: 1px solid rgba(200,0,90,0.12);
          border-bottom: 1px solid rgba(200,0,90,0.12);
          overflow: hidden; position: relative;
          background: var(--sc-bg2);
          z-index: 1;
        }
        .sc-sakura-divider::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent, rgba(200,0,90,0.05), transparent);
          animation: sc-shimmer 3s linear infinite;
        }
        @keyframes sc-shimmer { from{transform:translateX(-100%)} to{transform:translateX(100%)} }

        /* ── Section tag ── */
        .sc-s-tag {
          font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase;
          color: var(--sc-cyber); margin-bottom: 0.5rem;
          display: flex; align-items: center; gap: 0.6rem;
          font-weight: 700; font-family: var(--sc-font-mono);
        }
        .sc-s-tag::before { content: '//'; color: rgba(0,95,168,0.4); }

        /* ── Works grid ── */
        .sc-works-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }
        .sc-wk-card {
          border: 1px solid rgba(200,0,90,0.18);
          border-radius: 6px;
          overflow: hidden;
          background: var(--sc-bg);
          transition: transform 0.3s, border-color 0.3s, box-shadow 0.3s;
          position: relative;
        }
        .sc-wk-card::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(200,0,90,0.03), transparent);
          pointer-events: none;
        }
        .sc-wk-card:hover {
          transform: translateY(-6px);
          border-color: var(--sc-sakura);
          box-shadow: 0 8px 32px rgba(200,0,90,0.12), 0 2px 8px rgba(200,0,90,0.08);
        }
        .sc-wk-thumb {
          aspect-ratio: 16/9;
          background: linear-gradient(135deg, var(--sc-sakura3), rgba(180,160,255,0.2));
          display: flex; align-items: center; justify-content: center;
          position: relative; overflow: hidden;
          border-bottom: 1px solid rgba(200,0,90,0.12);
        }
        .sc-wk-thumb-placeholder { color: var(--sc-sakura); opacity: 0.4; }
        .sc-wk-thumb-glow {
          position: absolute; inset: 0;
          background: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.6), transparent 65%);
        }
        .sc-wk-body { padding: 1.5rem; }
        .sc-wk-tags { display: flex; gap: 0.4rem; flex-wrap: wrap; margin-bottom: 0.9rem; }
        .sc-wk-tag {
          font-family: var(--sc-font-mono);
          font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase;
          padding: 3px 10px;
          border: 1px solid rgba(200,0,90,0.25);
          color: var(--sc-sakura); border-radius: 2px;
          font-weight: 700;
        }
        .sc-wk-title {
          font-family: var(--sc-font-jp); font-weight: 700; font-size: 1.15rem;
          color: var(--sc-text); margin-bottom: 0.5rem;
        }
        .sc-wk-desc {
          font-family: var(--sc-font-mono);
          font-size: 14px; color: var(--sc-muted); margin-bottom: 1rem; line-height: 1.7;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .sc-wk-link {
          font-family: var(--sc-font-mono);
          font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase;
          color: var(--sc-cyber); font-weight: 700;
        }

        /* ── Scroll reveal ── */
        .sc-reveal {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1);
        }
        .sc-reveal.sc-visible {
          opacity: 1;
          transform: none;
        }

        /* ── Responsive ── */
        @media(max-width: 900px) {
          .sc-hero-terminal { display: none; }
          .sc-hero { padding: 100px 1.5rem 3rem; }
        }
      `}</style>
    </div>
  );
}
