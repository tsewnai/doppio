import { createFileRoute, useRouter } from "@tanstack/react-router";
import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent } from "~/components/ui/card";
import { PageHeader } from "~/components/layout/PageHeader";
import { BrewTimer } from "~/components/brew/BrewTimer";
import { RatingInput } from "~/components/brew/RatingInput";
import { createBrew } from "~/server/functions/brews";

export const Route = createFileRoute("/_authed/pour-over/new")({
  component: NewPourOverPage,
});

function NewPourOverPage() {
  const router = useRouter();
  const [dose, setDose] = useState("");
  const [water, setWater] = useState("");
  const [bloomSec, setBloomSec] = useState(0);
  const [totalSec, setTotalSec] = useState(0);
  const [timerMode, setTimerMode] = useState<"bloom" | "total">("total");
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!dose || !water) {
      setError("Dose and water amount are required.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await createBrew({
        data: {
          brewMethod: "pour_over",
          actualDoseG: parseFloat(dose),
          waterAmountMl: parseFloat(water),
          bloomTimeSec: bloomSec || undefined,
          totalTimeSec: totalSec || undefined,
          rating: rating || undefined,
          notes: notes || undefined,
        },
      });
      router.navigate({ to: "/pour-over" });
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader title="New Pour Over" backTo="/pour-over" />

      <form onSubmit={handleSubmit} className="px-4 space-y-5 pb-8">
        {/* Dose & Water */}
        <Card>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="dose">Coffee (g)</Label>
                <Input
                  id="dose"
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="15"
                  value={dose}
                  onChange={(e) => setDose(e.target.value)}
                  required
                  inputMode="decimal"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="water">Water (ml)</Label>
                <Input
                  id="water"
                  type="number"
                  step="1"
                  min="0"
                  placeholder="250"
                  value={water}
                  onChange={(e) => setWater(e.target.value)}
                  required
                  inputMode="numeric"
                />
              </div>
            </div>

            {dose && water && (
              <p className="text-sm text-muted-foreground text-center">
                Ratio:{" "}
                <span className="font-medium">
                  1:{(parseFloat(water) / parseFloat(dose)).toFixed(1)}
                </span>
              </p>
            )}
          </CardContent>
        </Card>

        {/* Timers */}
        <Card>
          <CardContent className="pt-4 space-y-4">
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={timerMode === "bloom" ? "default" : "outline"}
                onClick={() => setTimerMode("bloom")}
              >
                Bloom timer
              </Button>
              <Button
                type="button"
                size="sm"
                variant={timerMode === "total" ? "default" : "outline"}
                onClick={() => setTimerMode("total")}
              >
                Total timer
              </Button>
            </div>

            {timerMode === "bloom" ? (
              <BrewTimer
                label="Bloom time (first 30-45s pour)"
                onTick={setBloomSec}
                showLaps={false}
              />
            ) : (
              <BrewTimer
                label="Total brew time"
                onTick={setTotalSec}
                showLaps={true}
              />
            )}
          </CardContent>
        </Card>

        {/* Rating & Notes */}
        <Card>
          <CardContent className="pt-4 space-y-4">
            <div className="space-y-1.5">
              <Label>Rating</Label>
              <RatingInput value={rating} onChange={setRating} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Bloom time, pour stages, tasting notes…"
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" className="w-full" size="lg" disabled={saving}>
          {saving ? "Saving…" : "Save Pour Over"}
        </Button>
      </form>
    </div>
  );
}
