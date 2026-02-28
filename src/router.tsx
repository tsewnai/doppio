import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  const router = createRouter({
    routeTree,
    scrollRestoration: true,
    // context is populated by __root.tsx's beforeLoad on each navigation
    context: {
      session: null,
    },
  });

  return router;
}

