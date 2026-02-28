import { createFileRoute } from "@tanstack/react-router";
import { auth } from "~/lib/auth";

// Mount Better Auth's handler at /api/auth/* (catch-all via $ segment)
export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: ({ request }) => auth.handler(request),
      POST: ({ request }) => auth.handler(request),
    },
  },
});
