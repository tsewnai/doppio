import { createFileRoute, Link } from "@tanstack/react-router";
import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { PageHeader } from "~/components/layout/PageHeader";
import { listRecipes, createRecipe, deleteRecipe } from "~/server/functions/recipes";
import { BREW_METHOD_LABELS } from "~/lib/utils";
import { BREW_METHODS } from "~/db/schema";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useRouter } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/recipes/")({
  loader: () => listRecipes({ data: undefined }),
  component: RecipesPage,
});

function RecipesPage() {
  const recipes = Route.useLoaderData();
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [method, setMethod] = useState<typeof BREW_METHODS[number]>("espresso");
  const [dose, setDose] = useState("");
  const [yield_, setYield] = useState("");
  const [temp, setTemp] = useState("");
  const [grind, setGrind] = useState("");
  const [notes, setNotes] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await createRecipe({
        data: {
          name,
          brewMethod: method,
          targetDoseG: dose ? parseFloat(dose) : undefined,
          targetYieldG: yield_ ? parseFloat(yield_) : undefined,
          waterTempC: temp ? parseFloat(temp) : undefined,
          grindSetting: grind || undefined,
          notes: notes || undefined,
        },
      });
      setShowForm(false);
      setName(""); setDose(""); setYield(""); setTemp(""); setGrind(""); setNotes("");
      router.invalidate();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this recipe?")) return;
    await deleteRecipe({ data: id });
    router.invalidate();
  }

  // Group by brew method
  const grouped = recipes.reduce<Record<string, typeof recipes>>((acc, r) => {
    (acc[r.brewMethod] ??= []).push(r);
    return acc;
  }, {});

  return (
    <div>
      <PageHeader
        title="Recipes"
        action={
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setShowForm((v) => !v)}
          >
            <Plus className="h-5 w-5" />
          </Button>
        }
      />

      {/* New recipe inline form */}
      {showForm && (
        <form onSubmit={handleCreate} className="mx-4 mb-4 space-y-3 rounded-lg border p-4 bg-card">
          <p className="font-medium">New Recipe</p>
          <div className="space-y-1.5">
            <Label htmlFor="rname">Name</Label>
            <Input
              id="rname"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My GO-TO Espresso"
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
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="rdose">Target Dose (g)</Label>
              <Input
                id="rdose"
                type="number"
                step="0.1"
                value={dose}
                onChange={(e) => setDose(e.target.value)}
                inputMode="decimal"
                placeholder="18"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ryield">Target Yield (g)</Label>
              <Input
                id="ryield"
                type="number"
                step="0.1"
                value={yield_}
                onChange={(e) => setYield(e.target.value)}
                inputMode="decimal"
                placeholder="36"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rtemp">Water Temp (°C)</Label>
              <Input
                id="rtemp"
                type="number"
                step="0.5"
                value={temp}
                onChange={(e) => setTemp(e.target.value)}
                inputMode="decimal"
                placeholder="93"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rgrind">Grind Setting</Label>
              <Input
                id="rgrind"
                value={grind}
                onChange={(e) => setGrind(e.target.value)}
                placeholder="14"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rnotes">Notes</Label>
            <textarea
              id="rnotes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              placeholder="Any notes about this recipe…"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save Recipe"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {recipes.length === 0 ? (
        <div className="px-4 py-16 text-center">
          <p className="text-4xl mb-4">📋</p>
          <p className="font-medium">No recipes yet</p>
          <p className="text-sm text-muted-foreground mt-1 mb-6">
            Save your favourite brew settings as a recipe
          </p>
          <Button onClick={() => setShowForm(true)}>Create your first recipe</Button>
        </div>
      ) : (
        <div className="px-4 space-y-6">
          {Object.entries(grouped).map(([method, group]) => (
            <section key={method}>
              <h2 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                {BREW_METHOD_LABELS[method] ?? method}
              </h2>
              <div className="space-y-2">
                {group.map((recipe) => (
                  <Link
                    key={recipe.id}
                    to="/recipes/$recipeId"
                    params={{ recipeId: recipe.id }}
                  >
                    <Card className="hover:bg-muted/50 transition-colors">
                      <CardContent className="py-3 px-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{recipe.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {recipe.targetDoseG && `${recipe.targetDoseG}g dose`}
                              {recipe.targetDoseG && recipe.targetYieldG && " · "}
                              {recipe.targetYieldG && `${recipe.targetYieldG}g yield`}
                              {recipe.grindSetting && ` · grind ${recipe.grindSetting}`}
                            </p>
                          </div>
                          {recipe.isDefault && (
                            <Badge variant="secondary">Default</Badge>
                          )}
                        </div>
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
