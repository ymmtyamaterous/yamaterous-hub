import type { RouterClient } from "@orpc/server";

import { protectedProcedure, publicProcedure } from "../index";
import { analyticsRouter } from "./analytics";
import { categoriesRouter } from "./categories";
import { podcastsRouter } from "./podcasts";
import { postsRouter } from "./posts";
import { profileRouter } from "./profile";
import { tagsRouter } from "./tags";
import { worksRouter } from "./works";

export const appRouter = {
  healthCheck: publicProcedure.handler(() => {
    return "OK";
  }),
  privateData: protectedProcedure.handler(({ context }) => {
    return {
      message: "This is private",
      user: context.session?.user,
    };
  }),
  profile: profileRouter,
  works: worksRouter,
  tags: tagsRouter,
  posts: postsRouter,
  categories: categoriesRouter,
  podcasts: podcastsRouter,
  analytics: analyticsRouter,
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
