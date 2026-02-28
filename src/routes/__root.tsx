import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import React from "react";
import { BottomNav } from "~/components/layout/BottomNav";
import { auth } from "~/lib/auth";
import globalsCss from "~/styles/globals.css?url";

// ─── Server function: fetch current session ───────────────────────────────────
// getRequest() returns the live Request object so Better Auth can read
// the session cookie from its headers.
const fetchSession = createServerFn({ method: "GET" }).handler(async () => {
  const request = getRequest();
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  return session;
});

// ─── Root route context ───────────────────────────────────────────────────────
interface RouterContext {
  session: Awaited<ReturnType<typeof fetchSession>>;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: async () => {
    const session = await fetchSession();
    return { session };
  },

  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#4f46e5" },
      { name: "description", content: "Your coffee brewing companion" },
    ],
    links: [
      { rel: "stylesheet", href: globalsCss },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "icon", href: "/icons/icon-192.png", type: "image/png" },
      {
        rel: "apple-touch-icon",
        href: "/icons/icon-192.png",
      },
    ],
  }),

  component: RootComponent,
});

function RootComponent() {
  const { session } = Route.useRouteContext();

  React.useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-dvh">
        {/* Main content — padded on bottom to avoid the fixed nav */}
        <main className="mx-auto max-w-lg pb-20">
          <Outlet />
        </main>

        {/* Show nav only when authenticated */}
        {session && <BottomNav />}

        <Scripts />
      </body>
    </html>
  );
}
