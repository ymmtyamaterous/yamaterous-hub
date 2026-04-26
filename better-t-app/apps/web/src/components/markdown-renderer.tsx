import "highlight.js/styles/github-dark.css";

import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({
  content,
  className,
}: MarkdownRendererProps) {
  return (
    <div
      className={className}
      style={{
        fontFamily: "var(--sc-font-jp)",
        color: "var(--sc-text)",
        lineHeight: 1.8,
        fontSize: "1rem",
      }}
    >
      <style>{`
        .md-body h1,
        .md-body h2,
        .md-body h3,
        .md-body h4,
        .md-body h5,
        .md-body h6 {
          font-family: var(--sc-font-jp);
          font-weight: 900;
          color: var(--sc-text);
          margin: 2rem 0 1rem;
          line-height: 1.3;
        }
        .md-body h1 { font-size: 1.8rem; border-bottom: 2px solid var(--sc-sakura); padding-bottom: 0.4rem; }
        .md-body h2 { font-size: 1.4rem; border-bottom: 1px solid rgba(200,0,90,0.2); padding-bottom: 0.3rem; }
        .md-body h3 { font-size: 1.15rem; }
        .md-body p { margin: 1rem 0; }
        .md-body a {
          color: var(--sc-cyber);
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .md-body a:hover { color: var(--sc-sakura); }
        .md-body strong { font-weight: 700; color: var(--sc-sakura); }
        .md-body em { font-style: italic; color: var(--sc-muted); }
        .md-body code {
          font-family: var(--sc-font-mono);
          font-size: 0.875em;
          background: rgba(0,95,168,0.08);
          border: 1px solid rgba(0,95,168,0.15);
          border-radius: 3px;
          padding: 0.1em 0.4em;
          color: var(--sc-cyber);
        }
        .md-body pre {
          background: #0d1117;
          border: 1px solid rgba(200,0,90,0.15);
          border-radius: 6px;
          padding: 1.2rem;
          overflow-x: auto;
          margin: 1.5rem 0;
        }
        .md-body pre code {
          background: none;
          border: none;
          padding: 0;
          color: inherit;
          font-size: 0.875rem;
        }
        .md-body blockquote {
          border-left: 3px solid var(--sc-sakura);
          margin: 1.5rem 0;
          padding: 0.5rem 1rem;
          background: rgba(200,0,90,0.04);
          color: var(--sc-muted);
          font-style: italic;
        }
        .md-body ul, .md-body ol {
          margin: 1rem 0;
          padding-left: 1.8rem;
        }
        .md-body li { margin: 0.3rem 0; }
        .md-body table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5rem 0;
          font-size: 0.9rem;
        }
        .md-body th {
          background: rgba(200,0,90,0.06);
          font-weight: 700;
          padding: 0.6rem 0.8rem;
          border: 1px solid rgba(200,0,90,0.15);
          text-align: left;
        }
        .md-body td {
          padding: 0.5rem 0.8rem;
          border: 1px solid rgba(200,0,90,0.1);
        }
        .md-body tr:nth-child(even) { background: rgba(200,0,90,0.02); }
        .md-body img {
          max-width: 100%;
          border-radius: 4px;
          margin: 1rem 0;
        }
        .md-body hr {
          border: none;
          border-top: 1px solid rgba(200,0,90,0.2);
          margin: 2rem 0;
        }
        /* Dark mode */
        .dark .md-body h1,
        .dark .md-body h2,
        .dark .md-body h3,
        .dark .md-body h4,
        .dark .md-body h5,
        .dark .md-body h6 { color: #f0e8ff; }
        .dark .md-body code {
          background: rgba(82,0,184,0.2);
          border-color: rgba(82,0,184,0.3);
          color: #a78bfa;
        }
        .dark .md-body strong { color: #f472b6; }
        .dark .md-body p,
        .dark .md-body li,
        .dark .md-body td { color: #d1d5db; }
      `}</style>
      <div className="md-body">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeSlug, rehypeHighlight]}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
