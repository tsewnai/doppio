import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

// Layout route — all child routes inside _authed/ require authentication.
// The underscore prefix means this route doesn't add to the URL path.
export const Route = createFileRoute("/_authed")({
  beforeLoad: ({ context }) => {
    if (!context.session) {
      throw redirect({ to: "/login" });
    }
    return { user: context.session.user };
  },
  component: () => <Outlet />,
});
