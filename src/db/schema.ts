import { sql } from "drizzle-orm";
import {
  index,
  integer,
  real,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

// ─── Better Auth tables ───────────────────────────────────────────────────────
// These must be defined here so the Drizzle adapter can find them.
// Column names match Better Auth's defaults exactly.

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .default(false)
    .notNull(),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => new Date())
    .notNull(),
});

export const session = sqliteTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (t) => [index("session_userId_idx").on(t.userId)]
);

export const account = sqliteTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: integer("access_token_expires_at", {
      mode: "timestamp_ms",
    }),
    refreshTokenExpiresAt: integer("refresh_token_expires_at", {
      mode: "timestamp_ms",
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [index("account_userId_idx").on(t.userId)]
);

export const verification = sqliteTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .$onUpdate(() => new Date()),
  },
  (t) => [index("verification_identifier_idx").on(t.identifier)]
);

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
