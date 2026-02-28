import { createFileRoute, notFound, useRouter } from "@tanstack/react-router";
import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { PageHeader } from "~/components/layout/PageHeader";
import { RatioDisplay } from "~/components/brew/RatioDisplay";
import { RatingInput } from "~/components/brew/RatingInput";
import { getShot, updateShot, deleteShot } from "~/server/functions/shots";
import { formatBrewDate, formatTime } from "~/lib/utils";

export const Route = createFileRoute("/_authed/espresso/$shotId")({
  loader: async ({ params }) => {
    const shot = await getShot({ data: params.shotId });
    if (!shot) throw notFound();
    return shot;
  },
  component: ShotDetailPage,
});

function ShotDetailPage() {
  const shot = Route.useLoaderData();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Edit state mirrors the shot fields
  const [dose, setDose] = useState(String(shot.actualDoseG));
  const [yield_, setYield] = useState(String(shot.actualYieldG));
  const [extractionSec, setExtractionSec] = useState(String(shot.extractionTimeSec));
  const [waterTemp, setWaterTemp] = useState(String(shot.waterTempC ?? ""));
  const [grind, setGrind] = useState(shot.grindSetting ?? "");
  const [pressure, setPressure] = useState(String(shot.pressureBar ?? ""));
  const [rating, setRating] = useState(shot.rating ?? 0);
  const [notes, setNotes] = useState(shot.tastingNotes ?? "");

  async function handleSave() {
    setSaving(true);
    try {
      await updateShot({
        data: {
          id: shot.id,
          actualDoseG: parseFloat(dose),
          actualYieldG: parseFloat(yield_),
          extractionTimeSec: parseInt(extractionSec, 10),
          waterTempC: waterTemp ? parseFloat(waterTemp) : undefined,
          grindSetting: grind || undefined,
          pressureBar: pressure ? parseFloat(pressure) : undefined,
          rating: rating || undefined,
          tastingNotes: notes || undefined,
        },
      });
      setEditing(false);
      router.invalidate();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this shot?")) return;
    setDeleting(true);
    try {
      await deleteShot({ data: shot.id });
      router.navigate({ to: "/espresso" });
    } finally {
      setDeleting(false);
    }
  }

  if (!editing) {
    return (
      <div>
        <PageHeader
          title="Shot Detail"
          backTo="/espresso"
          action={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditing(true)}
            >
              Edit
            </Button>
          }
        />

        <div className="px-4 space-y-4 pb-8">
          <p className="text-sm text-muted-foreground">
            {formatBrewDate(shot.createdAt)} ·{" "}
            {new Date(shot.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>

          <RatioDisplay doseG={shot.actualDoseG} yieldG={shot.actualYieldG} />

          <Card>
            <CardContent className="pt-4 grid grid-cols-2 gap-3">
              <Stat label="Extraction" value={formatTime(shot.extractionTimeSec)} />
              <Stat label="Water Temp" value={shot.waterTempC ? `${shot.waterTempC}°C` : "—"} />
              <Stat label="Grind" value={shot.grindSetting ?? "—"} />
              <Stat label="Pressure" value={shot.pressureBar ? `${shot.pressureBar} bar` : "—"} />
            </CardContent>
          </Card>

          {shot.rating && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Rating:</span>
              <Badge>{shot.rating}/10</Badge>
            </div>
          )}

          {shot.tastingNotes && (
            <Card>
              <CardContent className="pt-4">
                <p className="text-sm font-medium mb-1">Tasting Notes</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {shot.tastingNotes}
                </p>
              </CardContent>
            </Card>
          )}

          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={deleting}
            className="w-full"
          >
            {deleting ? "Deleting…" : "Delete Shot"}
          </Button>
        </div>
      </div>
    );
  }

  // Edit mode
  return (
    <div>
      <PageHeader
        title="Edit Shot"
        backTo="/espresso"
        action={
          <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
            Cancel
          </Button>
        }
      />

      <div className="px-4 space-y-4 pb-8">
        <Card>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="dose">Dose (g)</Label>
                <Input
                  id="dose"
                  type="number"
                  step="0.1"
                  value={dose}
                  onChange={(e) => setDose(e.target.value)}
                  inputMode="decimal"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="yield">Yield (g)</Label>
                <Input
                  id="yield"
                  type="number"
                  step="0.1"
                  value={yield_}
                  onChange={(e) => setYield(e.target.value)}
                  inputMode="decimal"
                />
              </div>
            </div>
            <RatioDisplay
              doseG={parseFloat(dose) || 0}
              yieldG={parseFloat(yield_) || 0}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="time">Extraction Time (s)</Label>
              <Input
                id="time"
                type="number"
                value={extractionSec}
                onChange={(e) => setExtractionSec(e.target.value)}
                inputMode="numeric"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="temp">Water Temp (°C)</Label>
                <Input
                  id="temp"
                  type="number"
                  step="0.5"
                  value={waterTemp}
                  onChange={(e) => setWaterTemp(e.target.value)}
                  inputMode="decimal"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="grind">Grind</Label>
                <Input
                  id="grind"
                  value={grind}
                  onChange={(e) => setGrind(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pressure">Pressure (bar)</Label>
              <Input
                id="pressure"
                type="number"
                step="0.5"
                value={pressure}
                onChange={(e) => setPressure(e.target.value)}
                inputMode="decimal"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 space-y-4">
            <div className="space-y-1.5">
              <Label>Rating</Label>
              <RatingInput value={rating} onChange={setRating} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="notes">Tasting Notes</Label>
              <textarea
                id="notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
              />
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full"
          size="lg"
        >
          {saving ? "Saving…" : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
