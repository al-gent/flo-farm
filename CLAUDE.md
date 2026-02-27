# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

flo-farm is a farm-to-buyer order management SaaS. Farmers list produce; buyers place orders. Multiple farms and buyers share the platform.

## Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run lint         # ESLint

npm run db:generate  # Generate Drizzle migration SQL from schema changes
npm run db:migrate   # Apply pending migrations to the database
npm run db:studio    # Open Drizzle Studio (local DB GUI)
```

No test suite is configured.

## Environment setup

Copy `.env.local.example` → `.env.local` and fill in:

- `DATABASE_URL` — Neon Postgres connection string (from Neon console)
- `AUTH_SECRET` — generate with `npx auth secret`

## Stack

- **Next.js 16** — App Router, TypeScript, deployed on Vercel
- **Tailwind CSS v4 + shadcn/ui** — utility classes + component library
- **Drizzle ORM** — type-safe queries; `drizzle-orm/neon-http` for serverless
- **Neon Postgres** — serverless Postgres
- **Auth.js v5 (NextAuth)** — JWT sessions, email/password credentials

## Architecture

```
src/
  app/
    page.tsx                        # Root: redirects to /dashboard, /orders, or /login by role
    login/page.tsx                  # Login form (useActionState + server action)
    signup/page.tsx                 # Signup with farmer/buyer role toggle (client component)
    [farmcode]/page.tsx             # Public storefront — no auth required
    orders/page.tsx                 # Buyer order history (buyer role required)
    dashboard/
      layout.tsx                    # Auth guard: farmer only
      page.tsx                      # Grid of large nav tiles
      orders/page.tsx               # Pending/confirmed orders
      products/page.tsx             # Product list + add/edit form
      harvest/page.tsx              # Today's harvest (aggregated active orders)
      completed/page.tsx            # Completed/cancelled orders
      notes/page.tsx                # Farm notes
      buyers/page.tsx               # Buyer list + send email notification
    api/auth/[...nextauth]/route.ts # Auth.js catch-all
    actions/auth.ts                 # Server actions: loginAction, signupAction, logoutAction
  components/
    storefront/StorefrontClient.tsx # Cart state, unit select, checkout form (client)
    dashboard/
      OrderList.tsx                 # Expandable order cards with status actions (client)
      ProductManager.tsx            # Product list + unit/price builder form (client)
      NotesManager.tsx              # Post + list farm notes (client)
    ui/                             # shadcn/ui components
  db/
    schema.ts                 # Single source of truth for all DB tables
    index.ts                  # Drizzle client (neon-http, exports `db`)
  lib/
    mock-data.ts              # Mock data matching schema shapes exactly (replace with DB in next pass)
    utils.ts                  # shadcn cn() helper
  types/
    next-auth.d.ts            # Augments Session/JWT with `id` and `role`
  auth.ts                     # NextAuth config — credentials provider, JWT callbacks
  middleware.ts               # Protects /dashboard/* and /orders/* — everything else is public
drizzle/                      # Generated SQL migrations (committed to git)
drizzle.config.ts             # Drizzle Kit config
```

## Mock data

All pages use `src/lib/mock-data.ts`. Numeric DB fields (prices, quantities, ratios) are strings to match Neon's `numeric` return type. When wiring DB queries, replace the mock imports in each page's server component — the mock types match the schema shapes exactly.

## Key UI patterns

- **Server components** for all pages (session check with `await auth()`, data fetching)
- **Client components** for anything with local state: `StorefrontClient`, `OrderList`, `ProductManager`, `NotesManager`
- **Server actions** in `src/app/actions/auth.ts` for login/logout/signup
- Dashboard tiles use `min-h-36 rounded-2xl bg-green-600` for the big-button grid
- Status badge colors: pending=amber, confirmed=blue, edited=purple, completed=green, cancelled=gray
- `parseFloat()` when doing arithmetic on any numeric field from the schema

## Database schema overview

Tables: `users`, `farms`, `products`, `product_units`, `orders`, `order_items`, `buyer_profiles`, `farm_notes`, `chatbot_logs`.

Key relationships:
- `farms.user_id → users.id` (one farmer user owns one farm)
- `products.farm_id → farms.id`
- `product_units.product_id → products.id` (multiple units/prices per product, e.g. "lbs $2.50", "each $0.75")
- `orders` links a `farm_id` and a `buyer_id`; `order_items` captures `price_at_order` and `unit_at_order` as snapshots so historical pricing is preserved even if products change
- `buyer_profiles.user_id → users.id` (1-to-1, separate from auth record)

Postgres enums: `user_role` ("farmer" | "buyer"), `order_status` ("pending" | "confirmed" | "edited" | "completed" | "cancelled").

**Numeric columns** (`price`, `price_at_order`) are returned as strings by Neon — use `parseFloat()` when doing arithmetic.

## Auth

`src/auth.ts` exports `{ handlers, auth, signIn, signOut }` from NextAuth v5.

- Sessions use **JWT strategy** (no session table needed).
- `session.user.id` and `session.user.role` are available after sign-in (typed via `src/types/next-auth.d.ts`).
- The middleware (`src/middleware.ts`) redirects unauthenticated users to `/api/auth/signin`. Add paths to `publicPaths` to make them accessible without login.
- To read the session in a Server Component: `const session = await auth()`.
- To read it in a Client Component: wrap with `<SessionProvider>` and use `useSession()`.

## Migrations workflow

```bash
# 1. Edit src/db/schema.ts
# 2. Generate the migration
npm run db:generate
# 3. Review the SQL in drizzle/
# 4. Apply to database
npm run db:migrate
```

## shadcn/ui

Add components with:
```bash
npx shadcn@latest add <component>
```
Components land in `src/components/ui/`. The `cn()` helper from `src/lib/utils.ts` merges Tailwind classes.
