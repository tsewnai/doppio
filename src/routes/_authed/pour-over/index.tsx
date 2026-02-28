import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { PageHeader } from "~/components/layout/PageHeader";
import { listBrews } from "~/server/functions/brews";
import { formatBrewDate, formatTime } from "~/lib/utils";

export const Route = createFileRoute("/_authed/pour-over/")({
  loader: () => listBrews({ data: "pour_over" }),
  component: PourOverPage,
});

function PourOverPage() {
  const brews = Route.useLoaderData();

  const grouped = brews.reduce<Record<string, typeof brews>>((acc, brew) => {
    const label = formatBrewDate(brew.createdAt);
    (acc[label] ??= []).push(brew);
    return acc;
  }, {});

  return (
    <div>
      <PageHeader
        title="Pour Over"
        action={
          <Link to="/pour-over/new">
            <Button size="icon" variant="ghost">
              <Plus className="h-5 w-5" />
            </Button>
          </Link>
        }
      />

      {brews.length === 0 ? (
        <div className="px-4 py-16 text-center">
          <p className="text-4xl mb-4">💧</p>
          <p className="font-medium">No pour overs yet</p>
          <p className="text-sm text-muted-foreground mt-1 mb-6">
            Track each pour over to refine your technique
          </p>
          <Link to="/pour-over/new">
            <Button>Log your first pour over</Button>
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
                {group.map((brew) => (
                  <Card key={brew.id}>
                    <CardContent className="py-3 px-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">
                            {brew.actualDoseG}g · {brew.waterAmountMl}ml
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {brew.totalTimeSec ? formatTime(brew.totalTimeSec) : "—"}
                            {brew.bloomTimeSec && ` · bloom ${brew.bloomTimeSec}s`}
                          </p>
                        </div>
                        {brew.rating && (
                          <Badge variant="secondary">{brew.rating}/10</Badge>
                        )}
                      </div>
                      {brew.notes && (
                        <p className="mt-1.5 text-xs text-muted-foreground line-clamp-1">
                          {brew.notes}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
