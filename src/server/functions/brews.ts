import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "~/db/client";
import { brews, type NewBrew } from "~/db/schema";
import { auth } from "~/lib/auth";

async function requireUserId(): Promise<string> {
  const request = getRequest();
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) throw new Error("Unauthorized");
  return session.user.id;
}

const BrewMethodSchema = z.enum(["pour_over", "aeropress", "french_press"]);

export const listBrews = createServerFn({ method: "GET" })
  .inputValidator((method: z.infer<typeof BrewMethodSchema>) =>
    BrewMethodSchema.parse(method)
  )
  .handler(async ({ data: brewMethod }) => {
    const userId = await requireUserId();
    return db
      .select()
      .from(brews)
      .where(and(eq(brews.userId, userId), eq(brews.brewMethod, brewMethod)))
      .orderBy(desc(brews.createdAt))
      .limit(100);
  });

export const getBrew = createServerFn({ method: "GET" })
  .inputValidator((brewId: string) => brewId)
  .handler(async ({ data: brewId }) => {
    const userId = await requireUserId();
    const [brew] = await db
      .select()
      .from(brews)
      .where(and(eq(brews.id, brewId), eq(brews.userId, userId)));
    return brew ?? null;
  });

const NewBrewSchema = z.object({
  brewMethod: BrewMethodSchema,
  recipeId: z.string().optional(),
  actualDoseG: z.number().positive(),
  waterAmountMl: z.number().positive(),
  bloomTimeSec: z.number().int().optional(),
  totalTimeSec: z.number().int().optional(),
  rating: z.number().int().min(1).max(10).optional(),
  notes: z.string().optional(),
});

export const createBrew = createServerFn({ method: "POST" })
  .inputValidator((data: z.infer<typeof NewBrewSchema>) => NewBrewSchema.parse(data))
  .handler(async ({ data }) => {
    const userId = await requireUserId();
    const [brew] = await db
      .insert(brews)
      .values({ ...data, userId } satisfies NewBrew)
      .returning();
    return brew;
  });

export const deleteBrew = createServerFn({ method: "POST" })
  .inputValidator((id: string) => id)
  .handler(async ({ data: id }) => {
    const userId = await requireUserId();
    await db
      .delete(brews)
      .where(and(eq(brews.id, id), eq(brews.userId, userId)));
    return { success: true };
  });
