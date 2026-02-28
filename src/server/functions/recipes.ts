import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "~/db/client";
import { recipes, BREW_METHODS, type NewRecipe } from "~/db/schema";
import { auth } from "~/lib/auth";

async function requireUserId(): Promise<string> {
  const request = getRequest();
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) throw new Error("Unauthorized");
  return session.user.id;
}

const BrewMethodSchema = z.enum(BREW_METHODS);

// ─── Queries ─────────────────────────────────────────────────────────────────

export const listRecipes = createServerFn({ method: "GET" })
  .inputValidator(
    (method: z.infer<typeof BrewMethodSchema> | undefined) =>
      method ? BrewMethodSchema.parse(method) : undefined
  )
  .handler(async ({ data: brewMethod }) => {
    const userId = await requireUserId();
    const conditions = [eq(recipes.userId, userId)];
    if (brewMethod) conditions.push(eq(recipes.brewMethod, brewMethod));
    return db
      .select()
      .from(recipes)
      .where(and(...conditions))
      .orderBy(desc(recipes.updatedAt));
  });

export const getRecipe = createServerFn({ method: "GET" })
  .inputValidator((id: string) => id)
  .handler(async ({ data: id }) => {
    const userId = await requireUserId();
    const [recipe] = await db
      .select()
      .from(recipes)
      .where(and(eq(recipes.id, id), eq(recipes.userId, userId)));
    return recipe ?? null;
  });

// ─── Mutations ────────────────────────────────────────────────────────────────

const RecipeSchema = z.object({
  name: z.string().min(1),
  brewMethod: BrewMethodSchema,
  targetDoseG: z.number().positive().optional(),
  targetYieldG: z.number().positive().optional(),
  ratio: z.number().positive().optional(),
  waterTempC: z.number().optional(),
  grindSetting: z.string().optional(),
  notes: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export const createRecipe = createServerFn({ method: "POST" })
  .inputValidator((data: z.infer<typeof RecipeSchema>) => RecipeSchema.parse(data))
  .handler(async ({ data }) => {
    const userId = await requireUserId();
    const [recipe] = await db
      .insert(recipes)
      .values({ ...data, userId } satisfies NewRecipe)
      .returning();
    return recipe;
  });

const UpdateRecipeSchema = RecipeSchema.partial().extend({ id: z.string() });

export const updateRecipe = createServerFn({ method: "POST" })
  .inputValidator((data: z.infer<typeof UpdateRecipeSchema>) =>
    UpdateRecipeSchema.parse(data)
  )
  .handler(async ({ data: { id, ...rest } }) => {
    const userId = await requireUserId();
    const [recipe] = await db
      .update(recipes)
      .set({ ...rest, updatedAt: new Date().toISOString() })
      .where(and(eq(recipes.id, id), eq(recipes.userId, userId)))
      .returning();
    return recipe;
  });

export const deleteRecipe = createServerFn({ method: "POST" })
  .inputValidator((id: string) => id)
  .handler(async ({ data: id }) => {
    const userId = await requireUserId();
    await db
      .delete(recipes)
      .where(and(eq(recipes.id, id), eq(recipes.userId, userId)));
    return { success: true };
  });
