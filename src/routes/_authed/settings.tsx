import { createFileRoute, useRouter } from "@tanstack/react-router";
import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { PageHeader } from "~/components/layout/PageHeader";
import { signOut } from "~/lib/auth-client";
import { useTempUnit } from "~/hooks/useTempUnit";

export const Route = createFileRoute("/_authed/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = Route.useRouteContext();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const { unit, toggle } = useTempUnit();

  async function handleSignOut() {
    setSigningOut(true);
    await signOut();
    await router.invalidate();
    router.navigate({ to: "/login" });
  }

  return (
    <div>
      <PageHeader title="Settings" />

      <div className="px-4 space-y-4 pb-8">
        {/* Account */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <div>
              <p className="text-xs text-muted-foreground">Name</p>
              <p className="font-medium">{user.name ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Preferences</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Water temperature</p>
                <p className="text-xs text-muted-foreground">
                  Currently showing °{unit}
                </p>
              </div>
              <div className="flex rounded-lg border overflow-hidden text-sm font-medium">
                <button
                  type="button"
                  onClick={() => unit === "F" && toggle()}
                  className={`px-3 py-1.5 transition-colors ${
                    unit === "C"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  °C
                </button>
                <button
                  type="button"
                  onClick={() => unit === "C" && toggle()}
                  className={`px-3 py-1.5 transition-colors ${
                    unit === "F"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  °F
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* About */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">About doppio</CardTitle>
            <CardDescription>Your coffee brewing companion</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 pt-0 text-sm text-muted-foreground">
            <p>
              doppio helps you dial in your espresso and track every brew. Log
              shots, save recipes, and refine your technique over time.
            </p>
            <Separator className="my-2" />
            <p>Version 0.1.0 — FOSS side project</p>
          </CardContent>
        </Card>

        {/* Sign out */}
        <Button
          variant="outline"
          className="w-full"
          onClick={handleSignOut}
          disabled={signingOut}
        >
          {signingOut ? "Signing out…" : "Sign Out"}
        </Button>
      </div>
    </div>
  );
}
