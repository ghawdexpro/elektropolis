# ElektroPolis - Claude Code Instructions

## Project Identity

- **Name**: ElektroPolis Malta
- **Type**: E-commerce store for home appliances (kitchen sinks, cooker hoods, washing machines, refrigeration, air treatment)
- **Stack**: Next.js 16 + Supabase + Railway
- **Repo**: `https://github.com/ghawdexpro/elektropolis`
- **Production**: `https://elektropolis-web-production.up.railway.app`
- **Domain**: `elektropolis.mt` (DNS not yet pointed)

## Quick Reference

- **Full documentation**: See [DOCS.md](./DOCS.md) for complete project documentation
- **Supabase project**: `fgikvllfbtetzwkzwxqg` (EU region, Pro plan)
- **Railway service**: `elektropolis-web`
- **33 routes**: 21 storefront + 4 auth + 4 account + 8 admin + 3 API + 3 system

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.1.6 |
| UI | React | 19.2.3 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS v4 | 4.x |
| Database | Supabase (PostgreSQL) | - |
| Auth | Supabase Auth | - |
| Storage | Supabase Storage | - |
| State | Zustand | 5.x |
| Icons | Lucide React | 0.563 |
| Hosting | Railway (Docker) | - |
| Payment | Revolut Link | NOT YET INTEGRATED |

## Critical Patterns

### Supabase Clients
- **Server Components**: `import { createClient } from "@/lib/supabase/server"` — async, uses cookies
- **Client Components**: `import { createClient } from "@/lib/supabase/client"` — browser client
- **Admin/API routes**: `import { createAdminClient } from "@/lib/supabase/admin"` — service role, bypasses RLS

### Next.js 16 Specifics
- **Async params**: Route params are Promises: `params: Promise<{ handle: string }>` → must `await params`
- **Suspense for useSearchParams**: Any component using `useSearchParams()` must be wrapped in `<Suspense>`
- **Server Components** are the default; add `"use client"` only when needed

### Cart Store
- Zustand with localStorage persist (key: `elektropolis-cart`)
- Import: `import { useCartStore } from "@/store/cart"`
- Client-side only — will show `location is not defined` warning during SSR build (harmless)

### Tailwind v4
- Uses CSS custom properties defined in `src/app/globals.css` with `@theme inline`
- Brand classes: `bg-brand`, `text-brand`, `hover:bg-brand-hover`, `bg-brand-light`
- Text: `text-charcoal` (primary), `text-muted` (secondary)
- Background: `bg-surface`, `bg-warm-white`
- Borders: `border-border`

## Database

### Key Tables
- `products` (106 rows) — main product catalog with tsvector search
- `collections` (17 rows) — categories
- `product_collections` — many-to-many junction (NOT `collection_products`)
- `product_images` (180+ rows) — stored in Supabase Storage
- `orders` — uses JSONB for shipping_address/billing_address
- `profiles` — extends auth.users, has `role` field (customer/admin/staff)

### Orders Schema
The `orders` table has **two sets of columns** due to migration history:
- **ACTIVE** (used by code): `customer_id`, `customer_email`, `customer_phone`, `shipping_address` (JSONB), `billing_address` (JSONB), `notes`, `order_number` (TEXT)
- **LEGACY** (unused): `user_id`, `email`, `shipping_name`, `shipping_line1`, etc.

### Making a User Admin
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'user@example.com';
```

## Deployment

```bash
# Standard deploy (auto-triggered by push)
git push origin main

# Force redeploy
railway redeploy --yes

# Apply database migrations
supabase db push --linked

# View logs
railway logs
```

**NEVER use `railway up`** for deployment — use `git push` and Railway auto-builds from GitHub.

## File Organization

```
src/app/(storefront)/     # Public pages (Header + Footer layout)
src/app/admin/            # Admin panel (Sidebar layout)
src/app/api/              # API routes (checkout, search, contact)
src/components/storefront/ # Header, Footer, ProductCard, CartDrawer, etc.
src/components/admin/      # AdminSidebar
src/lib/supabase/         # 4 Supabase client variants
src/lib/constants.ts      # Site config, nav categories, locations
src/lib/utils.ts          # formatPrice, cn, getStockLabel
src/store/cart.ts         # Zustand cart store
```

## Not Yet Done

1. **Revolut payment integration** — orders are created as "unpaid"
2. **Email notifications** — contact form and order confirmations
3. **Image upload UI** in admin product editor
4. **Collection CRUD** in admin
5. **Inventory decrement** on checkout
6. **Legacy orders columns cleanup** migration
