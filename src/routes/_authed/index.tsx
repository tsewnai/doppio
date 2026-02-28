import { createFileRoute, Link } from "@tanstack/react-router";
import { Coffee, GlassWater, Wind, Bean } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { PageHeader } from "~/components/layout/PageHeader";
import { listShots } from "~/server/functions/shots";
import { listBrews } from "~/server/functions/brews";
import { formatBrewDate, formatTime } from "~/lib/utils";

export const Route = createFileRoute("/_authed/")({
  loader: async () => {
    const [recentShots, recentPourOvers] = await Promise.all([
      listShots(),
      listBrews({ data: "pour_over" }),
    ]);
    return {
      recentShots: recentShots.slice(0, 3),
      recentPourOvers: recentPourOvers.slice(0, 3),
    };
  },
  component: DashboardPage,
});

function DashboardPage() {
  const { recentShots, recentPourOvers } = Route.useLoaderData();
  const { user } = Route.useRouteContext();

  return (
    <div>
      <PageHeader
        title="doppio"
        description={`Welcome back, ${user.name ?? user.email}`}
      />

      {/* Quick actions */}
      <section className="px-4 pb-4">
        <h2 className="mb-3 text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Log a brew
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <QuickAction to="/espresso/new" icon={Coffee} label="Espresso" color="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" />
          <QuickAction to="/pour-over/new" icon={GlassWater} label="Pour Over" color="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" />
          <QuickAction to="/aeropress/new" icon={Wind} label="AeroPress" color="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" />
          <QuickAction to="/french-press/new" icon={Bean} label="French Press" color="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" />
        </div>
      </section>

      {/* Recent shots */}
      {recentShots.length > 0 && (
        <section className="px-4 pb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Recent Shots
            </h2>
            <Link to="/espresso" className="text-sm text-primary">
              See all
            </Link>
          </div>
          <div className="space-y-2">
            {recentShots.map((shot) => (
              <Link key={shot.id} to="/espresso/$shotId" params={{ shotId: shot.id }}>
                <Card className="hover:bg-muted/50 transition-colors">
                  <CardContent className="flex items-center justify-between py-3 px-4">
                    <div>
                      <p className="font-medium">
                        {shot.actualDoseG}g → {shot.actualYieldG}g
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatBrewDate(shot.createdAt)} · {formatTime(shot.extractionTimeSec)}
                      </p>
                    </div>
                    {shot.rating && (
                      <span className="text-sm font-medium text-muted-foreground">
                        {shot.rating}/10
                      </span>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {recentShots.length === 0 && recentPourOvers.length === 0 && (
        <div className="px-4 py-12 text-center">
          <p className="text-4xl mb-4">☕</p>
          <p className="font-medium">No brews yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Log your first brew using the buttons above
          </p>
        </div>
      )}
    </div>
  );
}

function QuickAction({
  to,
  icon: Icon,
  label,
  color,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  color: string;
}) {
  return (
    <Link to={to}>
      <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
        <CardContent className="flex items-center gap-3 py-3 px-4">
          <div className={`rounded-lg p-2 ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
          <span className="font-medium text-sm">{label}</span>
        </CardContent>
      </Card>
    </Link>
  );
}
