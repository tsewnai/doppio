import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "~/db/client";
import { shots, type NewShot } from "~/db/schema";
import { auth } from "~/lib/auth";

async function requireUserId(): Promise<string> {
  const request = getRequest();
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) throw new Error("Unauthorized");
  return session.user.id;
}

// ─── Queries ─────────────────────────────────────────────────────────────────

export const listShots = createServerFn({ method: "GET" }).handler(async () => {
  const userId = await requireUserId();
  return db
    .select()
    .from(shots)
    .where(eq(shots.userId, userId))
    .orderBy(desc(shots.createdAt))
    .limit(100);
});

export const getShot = createServerFn({ method: "GET" })
  .inputValidator((shotId: string) => shotId)
  .handler(async ({ data: shotId }) => {
    const userId = await requireUserId();
    const [shot] = await db
      .select()
      .from(shots)
      .where(and(eq(shots.id, shotId), eq(shots.userId, userId)));
    return shot ?? null;
  });

// ─── Mutations ────────────────────────────────────────────────────────────────

const NewShotSchema = z.object({
  recipeId: z.string().optional(),
  actualDoseG: z.number().positive(),
  actualYieldG: z.number().positive(),
  extractionTimeSec: z.number().int().positive(),
  waterTempC: z.number().optional(),
  grindSetting: z.string().optional(),
  pressureBar: z.number().optional(),
  rating: z.number().int().min(1).max(10).optional(),
  tastingNotes: z.string().optional(),
});

export const createShot = createServerFn({ method: "POST" })
  .inputValidator((data: z.infer<typeof NewShotSchema>) => NewShotSchema.parse(data))
  .handler(async ({ data }) => {
    const userId = await requireUserId();
    const [shot] = await db
      .insert(shots)
      .values({ ...data, userId } satisfies NewShot)
      .returning();
    return shot;
  });

const UpdateShotSchema = NewShotSchema.partial().extend({ id: z.string() });

export const updateShot = createServerFn({ method: "POST" })
  .inputValidator((data: z.infer<typeof UpdateShotSchema>) =>
    UpdateShotSchema.parse(data)
  )
  .handler(async ({ data: { id, ...rest } }) => {
    const userId = await requireUserId();
    const [shot] = await db
      .update(shots)
      .set(rest)
      .where(and(eq(shots.id, id), eq(shots.userId, userId)))
      .returning();
    return shot;
  });

export const deleteShot = createServerFn({ method: "POST" })
  .inputValidator((id: string) => id)
  .handler(async ({ data: id }) => {
    const userId = await requireUserId();
    await db
      .delete(shots)
      .where(and(eq(shots.id, id), eq(shots.userId, userId)));
    return { success: true };
  });
