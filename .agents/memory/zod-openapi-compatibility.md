---
name: OpenAPI integer compatibility
description: The current generated Zod client is on Zod 3 while Orval emits z.int() for OpenAPI integer schemas.
---

Keep generated API contracts compatible with the workspace's installed Zod version: numeric identifiers and counts in the OpenAPI spec currently use `type: number` rather than `type: integer`.

**Why:** Orval successfully generates `z.int()` for integer schemas, but the installed Zod 3.25 runtime does not expose that API, causing the required library typecheck to fail after codegen.

**How to apply:** If the workspace upgrades its Zod version or Orval config, re-evaluate this convention before adding integer schemas back to `lib/api-spec/openapi.yaml`.