import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { PageHeader } from "~/components/layout/PageHeader";
import { listShots } from "~/server/functions/shots";
import { formatBrewDate, formatRatio, formatTime } from "~/lib/utils";

export const Route = createFileRoute("/_authed/espresso/")({
  loader: () => listShots(),
  component: EspressoPage,
});

function EspressoPage() {
  const shots = Route.useLoaderData();

  // Group shots by date label
  const grouped = shots.reduce<Record<string, typeof shots>>((acc, shot) => {
    const label = formatBrewDate(shot.createdAt);
    (acc[label] ??= []).push(shot);
    return acc;
  }, {});

  // Stats
  const avgTime = shots.length
    ? Math.round(shots.reduce((s, sh) => s + sh.extractionTimeSec, 0) / shots.length)
    : null;
  const avgYield = shots.length
    ? (shots.reduce((s, sh) => s + sh.actualYieldG, 0) / shots.length).toFixed(1)
    : null;

  return (
    <div>
      <PageHeader
        title="Espresso"
        action={
          <Link to="/espresso/new">
            <Button size="icon" variant="ghost">
              <Plus className="h-5 w-5" />
            </Button>
          </Link>
        }
      />

      {/* Stats bar */}
      {shots.length > 0 && (
        <div className="mx-4 mb-4 grid grid-cols-3 divide-x rounded-lg border bg-card text-center">
          <div className="py-3">
            <p className="text-xl font-bold">{shots.length}</p>
            <p className="text-xs text-muted-foreground">shots</p>
          </div>
          <div className="py-3">
            <p className="text-xl font-bold">{avgTime ? formatTime(avgTime) : "—"}</p>
            <p className="text-xs text-muted-foreground">avg time</p>
          </div>
          <div className="py-3">
            <p className="text-xl font-bold">{avgYield ?? "—"}g</p>
            <p className="text-xs text-muted-foreground">avg yield</p>
          </div>
        </div>
      )}

      {shots.length === 0 ? (
        <div className="px-4 py-16 text-center">
          <p className="text-4xl mb-4">☕</p>
          <p className="font-medium">No shots logged yet</p>
          <p className="text-sm text-muted-foreground mt-1 mb-6">
            Dial in your espresso by logging each shot
          </p>
          <Link to="/espresso/new">
            <Button>Log your first shot</Button>
          </Link>
        </div>
      ) : (
        <div className="px-4 space-y-6">
          {Object.entries(grouped).map(([dateLabel, group]) => (
            <section key={dateLabel}>
              <h2 className="text-sm font-medium text-muted-foreground mb-2">
                {dateLabel}
              </h2>
              <div className="space-y-2">
                {group.map((shot) => (
                  <Link
                    key={shot.id}
                    to="/espresso/$shotId"
                    params={{ shotId: shot.id }}
                  >
                    <Card className="hover:bg-muted/50 transition-colors">
                      <CardContent className="py-3 px-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">
                              {shot.actualDoseG}g → {shot.actualYieldG}g
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatTime(shot.extractionTimeSec)} ·{" "}
                              {formatRatio(shot.actualDoseG, shot.actualYieldG)}
                              {shot.grindSetting && ` · grind ${shot.grindSetting}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {shot.rating && (
                              <Badge variant="secondary">{shot.rating}/10</Badge>
                            )}
                          </div>
                        </div>
                        {shot.tastingNotes && (
                          <p className="mt-1.5 text-xs text-muted-foreground line-clamp-1">
                            {shot.tastingNotes}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
