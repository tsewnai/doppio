import { sql } from "drizzle-orm";
import {
  integer,
  real,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

// ─── Better Auth managed tables ──────────────────────────────────────────────
// Better Auth creates these automatically via its own migration:
//   users, sessions, accounts, verifications

// ─── Brew method enum ────────────────────────────────────────────────────────
export const BREW_METHODS = [
  "espresso",
  "pour_over",
  "aeropress",
  "french_press",
] as const;

export type BrewMethod = (typeof BREW_METHODS)[number];

// ─── Recipes ─────────────────────────────────────────────────────────────────
// Shared across all brew methods; acts as a saved starting point
export const recipes = sqliteTable("recipes", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  brewMethod: text("brew_method", { enum: BREW_METHODS }).notNull(),
  targetDoseG: real("target_dose_g"),
  targetYieldG: real("target_yield_g"),
  // ratio is stored as a convenience — derived from dose/yield but editable
  ratio: real("ratio"),
  waterTempC: real("water_temp_c"),
  grindSetting: text("grind_setting"),
  notes: text("notes"),
  isDefault: integer("is_default", { mode: "boolean" }).default(false).notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export type Recipe = typeof recipes.$inferSelect;
export type NewRecipe = typeof recipes.$inferInsert;

// ─── Shots (espresso) ────────────────────────────────────────────────────────
export const shots = sqliteTable("shots", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull(),
  // nullable — can log a shot without a recipe
  recipeId: text("recipe_id").references(() => recipes.id, {
    onDelete: "set null",
  }),
  actualDoseG: real("actual_dose_g").notNull(),
  actualYieldG: real("actual_yield_g").notNull(),
  extractionTimeSec: integer("extraction_time_sec").notNull(),
  waterTempC: real("water_temp_c"),
  grindSetting: text("grind_setting"),
  pressureBar: real("pressure_bar"),
  // 1-10 rating
  rating: integer("rating"),
  tastingNotes: text("tasting_notes"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export type Shot = typeof shots.$inferSelect;
export type NewShot = typeof shots.$inferInsert;

// ─── Brews (pour_over | aeropress | french_press) ────────────────────────────
export const brews = sqliteTable("brews", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull(),
  recipeId: text("recipe_id").references(() => recipes.id, {
    onDelete: "set null",
  }),
  brewMethod: text("brew_method", {
    enum: ["pour_over", "aeropress", "french_press"],
  }).notNull(),
  actualDoseG: real("actual_dose_g").notNull(),
  waterAmountMl: real("water_amount_ml").notNull(),
  bloomTimeSec: integer("bloom_time_sec"),
  totalTimeSec: integer("total_time_sec"),
  // 1-10 rating
  rating: integer("rating"),
  notes: text("notes"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export type Brew = typeof brews.$inferSelect;
export type NewBrew = typeof brews.$inferInsert;
