import { createFileRoute, notFound, useRouter } from "@tanstack/react-router";
import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { PageHeader } from "~/components/layout/PageHeader";
import { getRecipe, updateRecipe, deleteRecipe } from "~/server/functions/recipes";
import { BREW_METHOD_LABELS, formatTemp, toC, toF } from "~/lib/utils";
import { useTempUnit } from "~/hooks/useTempUnit";
import { BREW_METHODS } from "~/db/schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

export const Route = createFileRoute("/_authed/recipes/$recipeId")({
  loader: async ({ params }) => {
    const recipe = await getRecipe({ data: params.recipeId });
    if (!recipe) throw notFound();
    return recipe;
  },
  component: RecipeDetailPage,
});

function RecipeDetailPage() {
  const recipe = Route.useLoaderData();
  const router = useRouter();
  const { unit } = useTempUnit();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [name, setName] = useState(recipe.name);
  const [method, setMethod] = useState<typeof BREW_METHODS[number]>(recipe.brewMethod);
  const [dose, setDose] = useState(String(recipe.targetDoseG ?? ""));
  const [yield_, setYield] = useState(String(recipe.targetYieldG ?? ""));
  const [temp, setTemp] = useState(
    recipe.waterTempC != null
      ? String(unit === "F" ? toF(recipe.waterTempC) : recipe.waterTempC)
      : ""
  );
  const [grind, setGrind] = useState(recipe.grindSetting ?? "");
  const [notes, setNotes] = useState(recipe.notes ?? "");

  async function handleSave() {
    setSaving(true);
    try {
      await updateRecipe({
        data: {
          id: recipe.id,
          name,
          brewMethod: method,
          targetDoseG: dose ? parseFloat(dose) : undefined,
          targetYieldG: yield_ ? parseFloat(yield_) : undefined,
          waterTempC: temp
            ? unit === "F" ? toC(parseFloat(temp)) : parseFloat(temp)
            : undefined,
          grindSetting: grind || undefined,
          notes: notes || undefined,
        },
      });
      setEditing(false);
      router.invalidate();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this recipe? Existing shots linked to it will not be deleted.")) return;
    setDeleting(true);
    try {
      await deleteRecipe({ data: recipe.id });
      router.navigate({ to: "/recipes" });
    } finally {
      setDeleting(false);
    }
  }

  if (!editing) {
    return (
      <div>
        <PageHeader
          title={recipe.name}
          backTo="/recipes"
          action={
            <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
              Edit
            </Button>
          }
        />

        <div className="px-4 space-y-4 pb-8">
          <Badge variant="outline">{BREW_METHOD_LABELS[recipe.brewMethod]}</Badge>

          <Card>
            <CardContent className="pt-4 grid grid-cols-2 gap-3">
              <Stat label="Target Dose" value={recipe.targetDoseG ? `${recipe.targetDoseG}g` : "—"} />
              <Stat label="Target Yield" value={recipe.targetYieldG ? `${recipe.targetYieldG}g` : "—"} />
              <Stat label="Ratio" value={recipe.ratio ? `1:${recipe.ratio.toFixed(1)}` : "—"} />
              <Stat label="Water Temp" value={recipe.waterTempC ? formatTemp(recipe.waterTempC, unit) : "—"} />
              <Stat label="Grind Setting" value={recipe.grindSetting ?? "—"} />
            </CardContent>
          </Card>

          {recipe.notes && (
            <Card>
              <CardContent className="pt-4">
                <p className="text-sm font-medium mb-1">Notes</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {recipe.notes}
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
            {deleting ? "Deleting…" : "Delete Recipe"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Edit Recipe"
        backTo="/recipes"
        action={
          <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
            Cancel
          </Button>
        }
      />

      <div className="px-4 space-y-4 pb-8">
        <Card>
          <CardContent className="pt-4 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Recipe Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Brew Method</Label>
              <Select
                value={method}
                onValueChange={(v) => setMethod(v as typeof BREW_METHODS[number])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BREW_METHODS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {BREW_METHOD_LABELS[m]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="dose">Target Dose (g)</Label>
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
                <Label htmlFor="yield">Target Yield (g)</Label>
                <Input
                  id="yield"
                  type="number"
                  step="0.1"
                  value={yield_}
                  onChange={(e) => setYield(e.target.value)}
                  inputMode="decimal"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="temp">Water Temp (°{unit})</Label>
                <Input
                  id="temp"
                  type="number"
                  step="0.5"
                  value={temp}
                  onChange={(e) => setTemp(e.target.value)}
                  inputMode="decimal"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="grind">Grind Setting</Label>
                <Input
                  id="grind"
                  value={grind}
                  onChange={(e) => setGrind(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
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
