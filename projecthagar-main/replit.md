# Home Decor Journal

A photo-led home decor journal with public inspiration pages and a protected admin publishing dashboard.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/home-decor-journal/src/` — React/Vite frontend, routes, editorial UI, and theme system
- `artifacts/api-server/src/routes/` — Express API routes for posts, categories, auth, and dashboard summaries
- `lib/api-spec/openapi.yaml` — source of truth for the API contract
- `lib/db/src/schema/posts.ts` — Drizzle schema for posts, admin users, and sessions
- `artifacts/home-decor-journal/README.md` — local run notes and demo login

## Architecture decisions

- The frontend uses generated Orval hooks from `@workspace/api-client-react`; API changes must start in OpenAPI and be followed by codegen.
- Sessions use signed, httpOnly cookies backed by the PostgreSQL `sessions` table.
- The first API boot creates the demo admin and seeds 15 editorial posts when the database is empty.
- Cover and product imagery is stored as remote image URLs; the database stores only post metadata and product JSON.

## Product

Readers can browse a magazine-like home page, filter by room/category, search the journal, open structured post guides, shop featured products, switch light/dark mode, and share or save stories. Editors can log in, review summaries, create posts, edit product lists, and delete posts.

## User preferences

The user requested plain-language, learner-friendly source structure and a premium photography-driven home decor editorial experience with polished light and dark themes.

## Gotchas

- Run `pnpm --filter @workspace/api-spec run codegen` after changing `lib/api-spec/openapi.yaml`.
- The API workflow must have `SESSION_SECRET`; `ADMIN_USERNAME` and `ADMIN_PASSWORD` may override the demo admin credentials.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
