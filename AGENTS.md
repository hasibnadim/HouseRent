<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## liveAir project rules

Stack: Next.js 16.4.1 + React 19 (`cacheComponents`, PPR, Turbopack) · Prisma 8
contract-first Postgres (`@prisma/orm-postgres`) · NextAuth v4 credentials (JWT) ·
hand-written CSS in `src/app/globals.css` (`erp-*`, `browse-*`, `property-*`).
Spec: `req.md` is the source of truth for scope and build order.

- Next.js APIs first: check `node_modules/next/dist/docs/` before writing framework
  code; do not rely on training-data habits (params/searchParams are async, `instant`
  controls blocking routes, `refresh()` replaces revalidate flows).
- Prisma 8: load the `prisma-8` skill and its query references for the installed
  version. Edit ONLY `src/prisma/contract.ts`, then `npm run contract:emit` +
  migrate; never hand-edit `contract.json` / `contract.d.ts`. Query via
  `db.orm.mytour.<Model>`.
- Branded IDs (`Char<36>`): look users up by `email`/`phone`; cast route/form IDs
  (`id as Char<36>`) at the boundary. `CurrentUser.id` is already branded.
- Session-gated pages: `export const instant = false` with DB/session reads inside
  `<Suspense>` (see `ProfileRequestBoundary`). Never block the static shell.
- Writes are server actions (`useActionState` + `FormState`) with role guards and
  ownership checks (`listing.ownerId === me.id`) on every path.
- Verify with `npx tsc --noEmit`, `npm run lint`, `npm run build`. Do not start
  `next dev` for verification.
