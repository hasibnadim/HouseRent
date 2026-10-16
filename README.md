# liveAir — House Rent Platform (Bangladesh)

liveAir is an Airbnb-style house-rent platform for Bangladesh: owners list homes for
rent, renters browse by area/city and budget, and both sides manage everything from
their account. Built with Next.js 16, React 19, Prisma 8 (contract-first, PostgreSQL),
and NextAuth credentials auth.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16.4.1 (App Router, Turbopack) |
| UI | React 19 + Shadcn |
| Data | Prisma 8 ORM with PostgreSQL |
| Auth | NextAuth v4   |

## Features

- **Auth** — register (name, email, phone, password, Renter/Owner role), login/logout,
  protected routes, role-based access (`RENTER` inherits nothing; `OWNER` hosts; `isAdmin` flag).
- **Public browse** — `/search` with left filter sidebar (keyword, city/area, rent range,
  beds/baths, type, furnished), sort, pagination, URL-synced filters; `/property/[id]`
  detail pages (gallery, facts, amenities, rules, price card, host card, similar homes).
- **Account area (`/profile`)** — ERP-style shell (sidebar + topbar + canvas) with
  overview, personal information, password change, and bookings/activity placeholders.
- **Owner listings CRUD** — `/profile/hosting` list with status badges, `/new` create
  form, `/[id]/edit` with publish/unpublish/archive, photo URLs, availability dates,
  and delete protection while pending/approved bookings exist.
- **Validation everywhere** — server actions validate all inputs; inline field errors +
  success states via `useActionState`.

## Getting started

```bash
npm install

# 1. Environment
cp .env.example .env        # set DATABASE_URL (PostgreSQL >= 15) + NEXTAUTH_SECRET

# 2. Data contract artefacts (regenerate after editing src/prisma/contract.ts)
npm run contract:emit

# 3. Database
npx prisma db migrate       # apply migrations in migrations/

# 4. Run
npm run dev                 # http://localhost:3000
```

| Script | Purpose |
|---|---|
| `npm run dev` / `build` / `start` | Next.js dev / production build / serve |
| `npm run lint` | ESLint (Next config) |
| `npx tsc --noEmit` | Typecheck |
| `npm run contract:emit` | Regenerate `contract.json` + `contract.d.ts` from `contract.ts` |

## Project structure

```
src/
  app/
    page.tsx                 # landing (hero, search teaser, featured)
    search/                  # public browse: filters + results grid
    property/[id]/           # public listing detail
    login/ register/         # auth pages
    profile/                 # account area (layout shell + sections)
      hosting/               # owner listings CRUD (list, new, [id]/edit)
      personal/ security/ activity/ admin/
    api/auth/[...nextauth]/  # NextAuth handler
    api/auth/register/       # registration endpoint
  components/
    site-header.tsx          # public header/footer (session-aware)
    header-auth.tsx          # landing header auth slot
    listing-card.tsx         # shared listing card
    profile/                 # ERP shell, page headers, empty states
  lib/
    auth.ts session.ts user.ts   # NextAuth options, getCurrentUser(), user types
    listings.ts              # public listing queries (search + detail)
  prisma/
    contract.ts              # DATA CONTRACT — edit this, never the artefacts
    contract.json / contract.d.ts  # generated (contract:emit)
    db.ts                    # db facade (db.orm.mytour.*)
migrations/                  # Prisma migration packages
req.md                       # product specification
```

## Conventions (read before contributing)

- **Prisma 8 is contract-first.** Edit `src/prisma/contract.ts`, then run
  `npm run contract:emit` and plan/apply a migration. Never hand-edit
  `contract.json` / `contract.d.ts`. Query via `db.orm.mytour.<Model>` (see the
  `prisma-8` skill references for the exact API of the installed version).
- **IDs are branded (`Char<36>`).** Plain strings don't typecheck in `where({ id })`;
  look users up by unique plain-text fields (`email`, `phone`), and cast route/form
  IDs (`id as Char<36>`) at the boundary.
- **Session-gated pages stream.** `export const instant = false` + data access inside
  `<Suspense>` (see `ProfileRequestBoundary`); static shells prerender, dynamic
  content streams. Check `node_modules/next/dist/docs/` before using unfamiliar
  Next.js APIs — this major version breaks old habits.
- **Mutations are server actions** (`"use server"`, `useActionState` + `FormState`),
  with ownership checks (`listing.ownerId === me.id`) and role guards on every write.
- **Styling** lives in `src/app/globals.css` under namespaces: `erp-*` (account area),
  `browse-*` (search), `property-*` (detail). Match the teal `#153b3c` / orange
  `#f07845` palette.


