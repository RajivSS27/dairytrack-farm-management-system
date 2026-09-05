# DairyTrack

DairyTrack is a mobile-friendly dairy supply chain platform that gives operations teams a clear view of milk moving from village farms through collection centers and processing plants to supermarkets.

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

- `artifacts/dairytrack` — React/Vite web application and responsive operations dashboard.
- `artifacts/api-server` — Express API routes under `/api`.
- `lib/api-spec/openapi.yaml` — source of truth for API contracts and generated hooks.
- `lib/db/src/schema/dairy.ts` — Drizzle schema for the dairy network.
- `lib/db/src/seed.ts` — idempotent demo data seed for the first milestone.

## Architecture decisions

- The initial milestone is intentionally read-only: it establishes the network data model and reviewable overview/directories before auth and role-specific mutations.
- `batches.status` and `batches.sent_at` are included now so the collection-center-to-plant handoff can be tracked without a later schema break.
- User records keep `linked_entity_id` nullable because the next milestone will use managed authentication and role-aware entity linking.

## Product

The current build shows a live, seeded overview of villages, farms, cows, health alerts, milk collection trends, collection centers, processing plants, and supermarkets. Each directory supports responsive browsing, search, loading states, and retryable error states.

## User preferences

- Build the platform in stages, starting with database schema and demo data; pause for review before adding auth and role-specific workflows.

## Gotchas

- After editing `lib/api-spec/openapi.yaml`, run `pnpm --filter @workspace/api-spec run codegen`.
- After schema edits, run `pnpm --filter @workspace/db run push`; seed demo data with `pnpm --filter @workspace/db run seed`.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
