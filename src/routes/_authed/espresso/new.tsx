import { createFileRoute, useRouter } from "@tanstack/react-router";
import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent } from "~/components/ui/card";
import { PageHeader } from "~/components/layout/PageHeader";
import { BrewTimer } from "~/components/brew/BrewTimer";
import { RatioDisplay } from "~/components/brew/RatioDisplay";
import { RatingInput } from "~/components/brew/RatingInput";
import { createShot } from "~/server/functions/shots";
import { listRecipes } from "~/server/functions/recipes";
import { toC, toF } from "~/lib/utils";
import { useTempUnit } from "~/hooks/useTempUnit";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

export const Route = createFileRoute("/_authed/espresso/new")({
  loader: () => listRecipes({ data: "espresso" }),
  component: NewShotPage,
});

function NewShotPage() {
  const recipes = Route.useLoaderData();
  const router = useRouter();
  const { unit } = useTempUnit();

  const [selectedRecipeId, setSelectedRecipeId] = useState<string>("");
  const [dose, setDose] = useState("");
  const [yield_, setYield] = useState("");
  const [extractionSec, setExtractionSec] = useState(0);
  const [waterTemp, setWaterTemp] = useState("");
  const [grind, setGrind] = useState("");
  const [pressure, setPressure] = useState("");
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // When a recipe is selected, pre-fill fields
  function loadRecipe(recipeId: string) {
    setSelectedRecipeId(recipeId);
    const recipe = recipes.find((r) => r.id === recipeId);
    if (recipe) {
      if (recipe.targetDoseG) setDose(String(recipe.targetDoseG));
      if (recipe.targetYieldG) setYield(String(recipe.targetYieldG));
      if (recipe.waterTempC)
        setWaterTemp(String(unit === "F" ? toF(recipe.waterTempC) : recipe.waterTempC));
      if (recipe.grindSetting) setGrind(recipe.grindSetting);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const doseNum = parseFloat(dose);
    const yieldNum = parseFloat(yield_);

    if (!dose || !yield_ || extractionSec === 0) {
      setError("Dose, yield, and extraction time are required.");
      setSaving(false);
      return;
    }

    try {
      await createShot({
        data: {
          recipeId: selectedRecipeId || undefined,
          actualDoseG: doseNum,
          actualYieldG: yieldNum,
          extractionTimeSec: extractionSec,
          waterTempC: waterTemp
            ? unit === "F" ? toC(parseFloat(waterTemp)) : parseFloat(waterTemp)
            : undefined,
          grindSetting: grind || undefined,
          pressureBar: pressure ? parseFloat(pressure) : undefined,
          rating: rating || undefined,
          tastingNotes: notes || undefined,
        },
      });
      router.navigate({ to: "/espresso" });
    } catch {
      setError("Failed to save shot. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const doseNum = parseFloat(dose) || 0;
  const yieldNum = parseFloat(yield_) || 0;

  return (
    <div>
      <PageHeader title="New Shot" backTo="/espresso" />

      <form onSubmit={handleSubmit} className="px-4 space-y-5 pb-8">
        {/* Recipe selector */}
        {recipes.length > 0 && (
          <div className="space-y-1.5">
            <Label>Load Recipe (optional)</Label>
            <Select value={selectedRecipeId} onValueChange={loadRecipe}>
              <SelectTrigger>
                <SelectValue placeholder="Start from scratch or pick a recipe…" />
              </SelectTrigger>
              <SelectContent>
                {recipes.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Dose & Yield */}
        <Card>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="dose">Dose (g)</Label>
                <Input
                  id="dose"
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="18"
                  value={dose}
                  onChange={(e) => setDose(e.target.value)}
                  required
                  inputMode="decimal"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="yield">Yield (g)</Label>
                <Input
                  id="yield"
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="36"
                  value={yield_}
                  onChange={(e) => setYield(e.target.value)}
                  required
                  inputMode="decimal"
                />
              </div>
            </div>

            {(doseNum > 0 || yieldNum > 0) && (
              <RatioDisplay doseG={doseNum} yieldG={yieldNum} />
            )}
          </CardContent>
        </Card>

        {/* Extraction Timer */}
        <Card>
          <CardContent className="pt-4">
            <BrewTimer
              label="Extraction time"
              onTick={setExtractionSec}
            />
            {extractionSec > 0 && (
              <p className="mt-2 text-center text-sm text-muted-foreground">
                Recorded: {extractionSec}s — tap Reset to start over
              </p>
            )}
          </CardContent>
        </Card>

        {/* Additional params */}
        <Card>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="temp">Water Temp (°{unit})</Label>
                <Input
                  id="temp"
                  type="number"
                  step="0.5"
                  min="0"
                  max={unit === "F" ? "221" : "105"}
                  placeholder={unit === "F" ? "199" : "93"}
                  value={waterTemp}
                  onChange={(e) => setWaterTemp(e.target.value)}
                  inputMode="decimal"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="grind">Grind Setting</Label>
                <Input
                  id="grind"
                  placeholder="e.g. 14, Fine+"
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
                min="0"
                max="20"
                placeholder="9"
                value={pressure}
                onChange={(e) => setPressure(e.target.value)}
                inputMode="decimal"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tasting notes & rating */}
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
                placeholder="Fruity, chocolatey, balanced…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" className="w-full" size="lg" disabled={saving}>
          {saving ? "Saving…" : "Save Shot"}
        </Button>
      </form>
    </div>
  );
}
