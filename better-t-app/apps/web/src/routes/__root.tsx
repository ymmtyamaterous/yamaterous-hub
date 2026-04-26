import type { AppRouterClient } from "@better-t-app/api/routers/index";
import { Toaster } from "@better-t-app/ui/components/sonner";
import { createORPCClient } from "@orpc/client";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import type { QueryClient } from "@tanstack/react-query";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { HeadContent, Outlet, createRootRouteWithContext, useLocation } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { useEffect, useRef, useState } from "react";

import Footer from "@/components/footer";
import Header from "@/components/header";
import { ThemeProvider } from "@/components/theme-provider";
import { client, link, orpc } from "@/utils/orpc";

import "../index.css";

export interface RouterAppContext {
  orpc: typeof orpc;
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  component: RootComponent,
  head: () => ({
    meta: [
      {
        title: "Yamaterous Hub",
      },
      {
        name: "description",
        content: "Yamaterous Hub — やまてろすのポートフォリオサイト",
      },
    ],
    links: [
      {
        rel: "icon",
        href: "/favicon.ico",
      },
    ],
  }),
});

function SiteThemeApplier() {
  const { data: profile } = useQuery(orpc.profile.get.queryOptions());
  useEffect(() => {
    const theme = profile?.theme ?? "sakura-cyber";
    document.documentElement.setAttribute("data-site-theme", theme);
  }, [profile?.theme]);
  return null;
}

function PageViewTracker() {
  const location = useLocation();
  const { mutate } = useMutation({
    mutationFn: (path: string) =>
      client.analytics.trackPageView({
        path,
        referrer: document.referrer || null,
        userAgent: navigator.userAgent.slice(0, 512),
      }),
  });
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    const path = location.pathname;
    if (path === lastPath.current) return;
    lastPath.current = path;
    mutate(path);
  }, [location.pathname, mutate]);

  return null;
}

function RootComponent() {
  const [client] = useState<AppRouterClient>(() => createORPCClient(link));
  const [orpcUtils] = useState(() => createTanstackQueryUtils(client));

  return (
    <>
      <HeadContent />
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        disableTransitionOnChange
        storageKey="vite-ui-theme"
      >
        {/* サイトテーマ適用 */}
        <SiteThemeApplier />
        {/* ページビュートラッキング */}
        <PageViewTracker />
        {/* 背景エフェクト */}
        <div className="sc-grid-bg" />
        <div className="sc-glow-blob sc-gb1" />
        <div className="sc-glow-blob sc-gb2" />
        <div className="sc-glow-blob sc-gb3" />

        <div className="flex flex-col min-h-svh" style={{ position: "relative", zIndex: 1 }}>
          <Header />
          {/* ヘッダー分のパディング */}
          <main className="flex-1 pt-[72px]">
            <Outlet />
          </main>
          <Footer />
        </div>
        <Toaster richColors />
      </ThemeProvider>
      <TanStackRouterDevtools position="bottom-left" />
      <ReactQueryDevtools position="bottom" buttonPosition="bottom-right" />
    </>
  );
}
