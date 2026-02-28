# doppio

A personal coffee brewing companion. Log shots and brews, save recipes, and track what's working.

## Features

- **Espresso** — dose, yield, extraction time, pressure, grind setting, rating
- **Pour Over, AeroPress, French Press** — dose, water amount, bloom time, total time, rating
- **Recipes** — save starting points for any brew method and pull them up when logging
- **PWA** — installable on your phone, works like a native app

## Stack

- [TanStack Start](https://tanstack.com/start) — SSR React framework
- [Better Auth](https://www.better-auth.com) — email/password auth
- [Drizzle ORM](https://orm.drizzle.team) + [Turso](https://turso.tech) — SQLite database
- [Cloudflare Workers](https://workers.cloudflare.com) — hosting
- [Tailwind CSS](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) — styling

## Dev

```bash
npm install
npm run dev
```

Runs locally against a SQLite file (`local.db`). No env vars needed for local dev.

## Database

```bash
npm run db:push     # apply schema changes
npm run db:studio   # open Drizzle Studio
```

For remote Turso, set `DATABASE_URL` and `DATABASE_AUTH_TOKEN` in your environment.

## Deploy

```bash
npm run deploy
```

Requires `DATABASE_URL`, `DATABASE_AUTH_TOKEN`, and `BETTER_AUTH_SECRET` set as Cloudflare environment variables.
