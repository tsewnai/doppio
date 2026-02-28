import type { Config } from "drizzle-kit";

const config: Config = {
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "turso",
  dbCredentials: {
    url: process.env["DATABASE_URL"] ?? "file:./local.db",
    // authToken is only needed for remote Turso — omit for local SQLite
    ...(process.env["DATABASE_AUTH_TOKEN"]
      ? { authToken: process.env["DATABASE_AUTH_TOKEN"] }
      : {}),
  },
};

export default config;
