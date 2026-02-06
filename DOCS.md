# ElektroPolis Malta - Complete Project Documentation

> **Last updated**: February 2026
> **Repository**: `https://github.com/ghawdexpro/elektropolis`
> **Production URL**: `https://elektropolis-web-production.up.railway.app`
> **Target domain**: `elektropolis.mt`

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Infrastructure](#infrastructure)
3. [Project Structure](#project-structure)
4. [Database Schema](#database-schema)
5. [All Routes & Pages](#all-routes--pages)
6. [API Endpoints](#api-endpoints)
7. [Components](#components)
8. [State Management](#state-management)
9. [Authentication & Authorization](#authentication--authorization)
10. [Search System](#search-system)
11. [Checkout Flow](#checkout-flow)
12. [Admin Panel](#admin-panel)
13. [SEO](#seo)
14. [Styling & Design System](#styling--design-system)
15. [Deployment](#deployment)
16. [Known Limitations & TODO](#known-limitations--todo)

---

## Architecture Overview

```
Browser → Next.js 16 (App Router) → Supabase (PostgreSQL + Auth + Storage)
                                  → Railway (Hosting, Docker)
```

- **Framework**: Next.js 16.1.6 with App Router, React 19, TypeScript
- **Database**: Supabase PostgreSQL with Row Level Security (RLS)
- **Auth**: Supabase Auth (email/password, magic link)
- **Storage**: Supabase Storage (`product-images` bucket)
- **State**: Zustand (client-side cart with localStorage persistence)
- **Styling**: Tailwind CSS v4 with CSS custom properties
- **Icons**: Lucide React
- **Hosting**: Railway (Docker, auto-deploy from GitHub)
- **Payment**: Revolut Link (NOT YET INTEGRATED)

### Key Architecture Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| SSR vs CSR | Server Components by default, Client only where needed | SEO + performance |
| Cart storage | Zustand + localStorage (key: `elektropolis-cart`) | Works for guest users, no DB needed |
| Search | PostgreSQL tsvector full-text search | ~106 products, no need for Algolia/Elastic |
| Images | Supabase Storage + Next.js `<Image>` | Self-hosted, optimized |
| Admin auth | RLS + profile role check in middleware | Simple, secure |
| Checkout | Guest checkout via admin Supabase client | No login required to buy |
| Order numbers | Text format `EP-YYYYMMDD-XXXX` | Human-readable, unique |

---

## Infrastructure

### Supabase
- **Project ref**: `fgikvllfbtetzwkzwxqg`
- **Region**: EU (closest to Malta)
- **Plan**: Pro
- **Storage bucket**: `product-images` (public read)
- **Auth**: Email/password enabled, auto-confirm off

### Railway
- **Service**: `elektropolis-web`
- **Build**: Dockerfile (multi-stage, node:20-alpine)
- **Deploy**: Auto-deploy on `git push` to `main`
- **Output**: Standalone Next.js server

### Environment Variables

| Variable | Where | Description |
|----------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Railway + .env.local | Supabase API URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Railway + .env.local | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Railway + .env.local | Admin operations (checkout, migrations) |
| `NEXT_PUBLIC_SITE_URL` | Railway + .env.local | Site base URL for auth callbacks |

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx                     # Root layout (fonts, metadata, body)
│   ├── globals.css                    # Tailwind v4 theme + animations
│   ├── not-found.tsx                  # Custom 404 page
│   ├── robots.ts                      # Robots.txt generator
│   ├── sitemap.ts                     # Dynamic XML sitemap
│   │
│   ├── (storefront)/                  # Public pages (wrapped in Header/Footer)
│   │   ├── layout.tsx                 # Header + main + Footer wrapper
│   │   ├── page.tsx                   # Homepage (hero, categories, value props)
│   │   ├── collections/
│   │   │   ├── page.tsx               # All collections grid
│   │   │   └── [handle]/page.tsx      # Single collection with product grid
│   │   ├── products/
│   │   │   └── [handle]/
│   │   │       ├── page.tsx           # Product page (metadata + detail wrapper)
│   │   │       └── ProductDetail.tsx   # Client component (gallery, cart, tabs)
│   │   ├── search/page.tsx            # Search results page
│   │   ├── cart/page.tsx              # Full cart page
│   │   ├── checkout/
│   │   │   ├── page.tsx               # Checkout form (address, details)
│   │   │   └── success/page.tsx       # Order confirmation
│   │   ├── contact/page.tsx           # Contact form + store locations
│   │   ├── faqs/page.tsx              # FAQ accordion by category
│   │   ├── pages/
│   │   │   ├── privacy-policy/page.tsx
│   │   │   └── terms-of-service/page.tsx
│   │   ├── account/
│   │   │   ├── page.tsx               # Account dashboard (server, requires auth)
│   │   │   ├── settings/page.tsx      # Profile editing (client)
│   │   │   ├── orders/page.tsx        # Order history list
│   │   │   ├── orders/[id]/page.tsx   # Single order detail
│   │   │   └── SignOutButton.tsx       # Client sign-out button
│   │   └── auth/
│   │       ├── login/page.tsx         # Login form (Suspense-wrapped)
│   │       ├── register/page.tsx      # Registration form
│   │       ├── forgot-password/page.tsx
│   │       └── callback/route.ts      # Supabase auth callback handler
│   │
│   ├── admin/                         # Admin panel (no Header/Footer)
│   │   ├── layout.tsx                 # Admin layout with sidebar
│   │   ├── page.tsx                   # Dashboard (stats, recent orders)
│   │   ├── products/
│   │   │   ├── page.tsx               # Products list with search/filter
│   │   │   ├── new/page.tsx           # Create product form
│   │   │   └── [id]/page.tsx          # Edit product form
│   │   ├── orders/
│   │   │   ├── page.tsx               # Orders list with filters
│   │   │   └── [id]/page.tsx          # Order detail + status management
│   │   └── collections/page.tsx       # Collections grid management
│   │
│   └── api/
│       ├── checkout/route.ts          # POST: Create order
│       ├── search/route.ts            # GET: Full-text product search
│       └── contact/route.ts           # POST: Contact form submission
│
├── components/
│   ├── storefront/
│   │   ├── Header.tsx                 # Nav, search, cart icon, mobile menu
│   │   ├── Footer.tsx                 # Links, locations, legal
│   │   ├── ProductCard.tsx            # Product grid card
│   │   ├── ProductGrid.tsx            # CSS grid wrapper
│   │   ├── CartDrawer.tsx             # Slide-out cart panel
│   │   └── SortDropdown.tsx           # Sort options dropdown
│   └── admin/
│       └── AdminSidebar.tsx           # Collapsible admin nav sidebar
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                  # Browser Supabase client
│   │   ├── server.ts                  # Server Supabase client (cookies)
│   │   ├── admin.ts                   # Admin client (service role key)
│   │   └── middleware.ts              # Auth middleware (protects /admin, /account)
│   ├── constants.ts                   # Site metadata, locations, nav categories
│   └── utils.ts                       # formatPrice, cn, getStockLabel, truncateHtml
│
├── store/
│   └── cart.ts                        # Zustand cart store (persist to localStorage)
│
└── hooks/                             # (empty - no custom hooks yet)

middleware.ts                           # Next.js middleware entry point
supabase/migrations/
├── 001_schema.sql                     # Initial schema (12 tables, RLS, triggers)
└── 002_fix_orders_schema.sql          # Orders schema fixes (JSONB addresses, customer fields)

Dockerfile                             # Multi-stage Docker build
.env.example                           # Environment variable template
```

---

## Database Schema

### Tables Overview

| Table | Rows (approx) | Purpose |
|-------|---------------|---------|
| `brands` | 3 | Akpo, Deante, Nobana |
| `collections` | 17 | Product categories (kitchen sinks, cooker hoods, etc.) |
| `products` | 106 | All products with pricing, inventory, search vectors |
| `product_images` | 180+ | Product photos stored in Supabase Storage |
| `product_variants` | ~50 | Size/color variants (many products are single-variant) |
| `product_collections` | ~130 | Many-to-many product-collection mapping |
| `profiles` | auto | User profiles (auto-created on signup via trigger) |
| `orders` | dynamic | Customer orders |
| `order_items` | dynamic | Order line items (snapshot of product at purchase time) |
| `pages` | 0 | CMS static pages (unused, legal pages are hardcoded) |
| `faqs` | 0 | FAQ entries (FAQ page currently hardcoded) |
| `store_settings` | 5 | Key-value store config |

### Key Table: `products`

```sql
products (
  id                UUID PK
  title             TEXT NOT NULL
  handle            TEXT NOT NULL UNIQUE     -- URL slug
  body_html         TEXT                     -- Product description
  vendor            TEXT                     -- Brand name string
  brand_id          UUID FK → brands
  product_type      TEXT                     -- Category label
  status            TEXT ('active'|'draft'|'archived')
  tags              TEXT[]                   -- PostgreSQL array, GIN indexed
  price             DECIMAL(10,2)
  compare_at_price  DECIMAL(10,2)            -- Original price (for sale display)
  cost_price        DECIMAL(10,2)
  currency          TEXT DEFAULT 'EUR'
  sku               TEXT
  barcode           TEXT
  track_inventory   BOOLEAN
  inventory_count   INT
  low_stock_threshold INT DEFAULT 5
  weight_grams      INT
  requires_shipping BOOLEAN
  seo_title         TEXT
  seo_description   TEXT
  shopify_id        BIGINT                   -- Legacy Shopify reference
  search_vector     TSVECTOR                 -- Auto-populated by trigger
  created_at        TIMESTAMPTZ
  updated_at        TIMESTAMPTZ              -- Auto-updated by trigger
)

Indexes: handle, brand_id, status, tags (GIN), search_vector (GIN)
```

### Key Table: `orders`

After migration 002, the orders table has **dual columns** for backward compatibility. The active columns used by the checkout API are:

```sql
orders (
  id                UUID PK
  order_number      TEXT                     -- Format: "EP-20260206-1234"
  customer_id       UUID FK → auth.users     -- NULL for guest checkout
  customer_email    TEXT
  customer_phone    TEXT
  status            TEXT ('pending'|'confirmed'|'shipped'|'delivered'|'cancelled')
  payment_status    TEXT ('unpaid'|'paid'|'refunded'|'partially_refunded')
  subtotal          DECIMAL(10,2)
  shipping_cost     DECIMAL(10,2)
  total             DECIMAL(10,2)
  shipping_address  JSONB                    -- {name, line1, line2, city, postalCode, country}
  billing_address   JSONB
  notes             TEXT
  created_at        TIMESTAMPTZ
  updated_at        TIMESTAMPTZ
)
```

**IMPORTANT**: The original schema also has legacy columns (`user_id`, `email`, `shipping_name`, `shipping_line1`, etc.) that are NOT used by the current code. Migration 002 added the new columns without removing the old ones.

### Triggers

1. **`update_updated_at`** - Auto-updates `updated_at` on UPDATE for: products, collections, orders, profiles, brands
2. **`handle_new_user`** - Auto-creates a `profiles` row when a user signs up via Supabase Auth
3. **`products_search_update`** - Rebuilds `search_vector` tsvector on product INSERT/UPDATE (weighted: title=A, vendor/type/tags=B, body=C)

### Row Level Security (RLS)

All tables have RLS enabled. Key policies:

| Table | Public Read | User Access | Admin Access |
|-------|------------|-------------|--------------|
| products | Active only | - | Full CRUD |
| collections | Visible only | - | Full CRUD |
| brands | All | - | Full CRUD |
| product_images | All | - | Full CRUD |
| profiles | - | Own profile only | All profiles |
| orders | - | Own orders (by customer_id) | Full CRUD |
| order_items | - | Own order items | Full CRUD |

**Guest checkout note**: Orders are created using the admin Supabase client (service role key) to bypass RLS, since guest users don't have auth.uid().

---

## All Routes & Pages

### Storefront (Public)

| Route | Type | Auth | Description |
|-------|------|------|-------------|
| `/` | Static | No | Homepage with hero, categories, value props |
| `/collections` | Dynamic | No | Grid of all visible collections |
| `/collections/[handle]` | Dynamic | No | Products in collection, sortable |
| `/products/[handle]` | Dynamic | No | Product detail with gallery, add-to-cart |
| `/search?q=term` | Dynamic | No | Search results page |
| `/cart` | Static | No | Full cart page with quantity controls |
| `/checkout` | Static | No | Checkout form (address, phone, email) |
| `/checkout/success?orderId=X` | Dynamic | No | Order confirmation |
| `/contact` | Static | No | Contact form + 3 store locations |
| `/faqs` | Static | No | FAQ accordion (hardcoded categories) |
| `/pages/privacy-policy` | Static | No | GDPR privacy policy |
| `/pages/terms-of-service` | Static | No | Terms of service |

### Auth

| Route | Type | Auth | Description |
|-------|------|------|-------------|
| `/auth/login` | Static | No | Email/password login |
| `/auth/register` | Static | No | Create account |
| `/auth/forgot-password` | Static | No | Password reset request |
| `/auth/callback` | API Route | No | Supabase auth callback (code exchange) |

### Account (Protected - requires login)

| Route | Type | Auth | Description |
|-------|------|------|-------------|
| `/account` | Dynamic | Yes | Dashboard with stats, quick links |
| `/account/orders` | Dynamic | Yes | Order history list |
| `/account/orders/[id]` | Dynamic | Yes | Single order detail |
| `/account/settings` | Static | Yes | Edit name, phone |

### Admin (Protected - requires admin/staff role)

| Route | Type | Auth | Description |
|-------|------|------|-------------|
| `/admin` | Dynamic | Admin | Dashboard with stats (products, orders, revenue, low stock) |
| `/admin/products` | Dynamic | Admin | Product list with search, status filter |
| `/admin/products/new` | Static | Admin | Create product form |
| `/admin/products/[id]` | Dynamic | Admin | Edit product form |
| `/admin/orders` | Dynamic | Admin | Order list with status/payment filters |
| `/admin/orders/[id]` | Dynamic | Admin | Order detail + status update |
| `/admin/collections` | Dynamic | Admin | Collections grid with product counts |

### SEO & System

| Route | Type | Description |
|-------|------|-------------|
| `/sitemap.xml` | Dynamic | XML sitemap (products + collections) |
| `/robots.txt` | Dynamic | Robots.txt |
| `/_not-found` | Static | Custom 404 page |

**Total: 33 routes** (21 storefront + 4 auth + 4 account + 8 admin + 3 API + 3 system)

---

## API Endpoints

### POST `/api/checkout`

Creates a new order from the cart.

**Request body**:
```json
{
  "items": [{
    "productId": "uuid",
    "variantId": "uuid (optional)",
    "title": "Product Name",
    "price": 299.99,
    "image": "https://...",
    "handle": "product-slug",
    "quantity": 1,
    "sku": "SKU123"
  }],
  "email": "customer@example.com",
  "phone": "+356 9XXX XXXX",
  "shippingAddress": {
    "name": "John Doe",
    "line1": "123 Main St",
    "line2": "Apt 4 (optional)",
    "city": "Victoria",
    "postalCode": "VCT9055",
    "country": "Malta"
  },
  "notes": "Optional delivery notes"
}
```

**Response**: `{ orderId: "uuid", orderNumber: "EP-20260206-1234" }`

**Validation**: Requires items, email, phone, and complete shipping address (name, line1, city, postalCode).

**Flow**:
1. Validates required fields
2. Calculates subtotal from items (shipping = 0, free delivery)
3. Generates order number (EP-YYYYMMDD-random4)
4. Looks up existing user by email (for customer_id)
5. Inserts order using admin Supabase client (bypasses RLS)
6. Inserts order items
7. Returns orderId + orderNumber

### GET `/api/search?q=query&limit=20`

Full-text product search.

**Query params**:
- `q` (required): Search query string
- `limit` (optional): Max results (default 20)

**Response**: `{ results: [{ id, title, handle, price, compare_at_price, vendor, image_url }] }`

**Flow**:
1. Uses PostgreSQL `websearch_to_tsquery` against product `search_vector`
2. Falls back to ILIKE on title if tsquery returns no results
3. Only returns active products
4. Includes primary image URL

### POST `/api/contact`

Contact form submission.

**Request body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+356 ...",
  "subject": "Question about...",
  "message": "Hello..."
}
```

**Response**: `{ success: true }`

**Note**: Currently logs to console only. Email sending (e.g., Resend, SendGrid) not yet integrated.

---

## Components

### `Header.tsx`
- Fixed top navigation bar
- ElektroPolis logo (link to /)
- Desktop: mega-menu categories from `NAV_CATEGORIES` constant
- Mobile: hamburger menu with slide-out drawer
- Search bar (navigates to `/search?q=...`)
- Cart icon with item count badge (from Zustand store)
- Account icon (link to /account or /auth/login)

### `Footer.tsx`
- Three columns: Customer Service links, Store Locations, Legal
- Contact info: info@elektropolis.mt, (+356) 9921 3791
- Links to: /contact, /faqs, /pages/privacy-policy, /pages/terms-of-service
- Copyright notice

### `ProductCard.tsx`
- Image with hover scale effect
- Brand name above product title
- Price display (with strikethrough compare_at_price if on sale)
- Stock status badge (In Stock / Low Stock / Sold Out)
- Quick add-to-cart button on hover
- Links to `/products/[handle]`

### `CartDrawer.tsx`
- Slides in from right side
- Shows cart items with image, title, price, quantity +/- controls
- Remove item button
- Subtotal at bottom
- "Checkout" CTA button (brand orange)
- "Continue Shopping" link
- Empty state with illustration

### `SortDropdown.tsx`
- Client-side dropdown for sort options
- Options: Newest, Price Low→High, Price High→Low, Name A→Z
- Updates URL search params

### `AdminSidebar.tsx`
- Collapsible sidebar navigation
- Links: Dashboard, Products, Orders, Collections
- Active state highlighting
- Mobile toggle button

---

## State Management

### Cart Store (`src/store/cart.ts`)

Zustand store with localStorage persistence (key: `elektropolis-cart`).

```typescript
interface CartStore {
  items: CartItem[];
  addItem(item, quantity?): void;      // Add or increment
  removeItem(productId, variantId?): void;  // Remove item
  updateQuantity(productId, qty, variantId?): void;  // Set quantity (0 = remove)
  clearCart(): void;                   // Empty cart
  getTotal(): number;                  // Sum of price * quantity
  getItemCount(): number;              // Sum of quantities
}
```

**CartItem shape**:
```typescript
{
  productId: string;
  variantId?: string;
  title: string;
  price: number;
  compareAtPrice?: number;
  image?: string;
  handle: string;
  quantity: number;
  sku?: string;
}
```

**Usage pattern**: `const { items, addItem, getTotal } = useCartStore()`

---

## Authentication & Authorization

### Auth Flow

1. **Registration** (`/auth/register`): Supabase `signUp` with email + password + metadata (full_name)
2. **Login** (`/auth/login`): Supabase `signInWithPassword`
3. **Forgot Password** (`/auth/forgot-password`): Supabase `resetPasswordForEmail`
4. **Callback** (`/auth/callback`): Exchanges auth code for session via `exchangeCodeForSession`

### Middleware Protection

`middleware.ts` → `src/lib/supabase/middleware.ts`:

- Refreshes Supabase auth session on every request
- **`/account/*`**: Redirects to `/auth/login` if not authenticated
- **`/admin/*`**: Redirects to `/auth/login` if not authenticated, then checks `profiles.role` for `admin` or `staff`

### Making a User Admin

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
```

---

## Search System

### Architecture

1. **Trigger-based indexing**: On every product INSERT/UPDATE, the `products_search_update` trigger rebuilds the `search_vector` tsvector column with weighted components:
   - **A weight** (highest): Product title
   - **B weight**: Vendor, product_type, tags
   - **C weight** (lowest): body_html description

2. **Search API** (`/api/search`): Uses `websearch_to_tsquery` for natural language queries with fallback to ILIKE on title

3. **Predictive Search** (Header): Debounced client-side fetch to `/api/search?q=...&limit=5` showing results in a dropdown

4. **Results Page** (`/search?q=term`): Full page with product grid, fetches from the same API

---

## Checkout Flow

```
Cart Page → Checkout Form → API /api/checkout → Success Page
```

1. **Cart Page** (`/cart`): User reviews items, adjusts quantities
2. **Checkout Page** (`/checkout`):
   - Form fields: Name, Email, Phone, Address (line1, line2, city, postal code, country)
   - Order notes (optional)
   - Reads cart from Zustand store
   - Submits to `/api/checkout`
3. **API Processing**:
   - Validates all fields
   - Calculates totals (shipping = free)
   - Creates order record (admin client, bypasses RLS)
   - Creates order items
   - Returns orderId + orderNumber
4. **Success Page** (`/checkout/success?orderId=X`):
   - Fetches order details from Supabase
   - Shows order number, items, totals
   - Clears cart store
   - "Continue Shopping" link

### Payment Integration (NOT YET DONE)

**Planned**: Revolut Link / Revolut Merchant API
- After order creation, generate Revolut payment link
- Redirect customer to Revolut
- Webhook callback to update payment_status to "paid"
- Currently: All orders created as `payment_status: "unpaid"`

---

## Admin Panel

### Access
- URL: `/admin`
- Requires: User with `profiles.role = 'admin'` or `'staff'`
- Protected by middleware (redirects to login if unauthorized)

### Dashboard (`/admin`)
- Stat cards: Total Products, Total Orders, Total Revenue (paid orders), Low Stock Items
- Recent orders table (last 10) with status/payment badges

### Products (`/admin/products`)
- Search by name
- Filter by status (all/active/draft/archived)
- Table with image, title, price, inventory, status
- Links to edit each product
- "Add Product" button

### Product Editor (`/admin/products/new` and `/admin/products/[id]`)
- Fields: Title, handle (auto-generated from title), description (body_html), vendor, product_type, price, compare_at_price, cost_price, SKU, barcode, inventory count, status, tags
- Image URL management
- Save/Update button

### Orders (`/admin/orders`)
- Table: Order number, date, customer email, status, payment status, total
- Filter by status and payment status
- Links to order detail

### Order Detail (`/admin/orders/[id]`)
- Full order info: customer email/phone, shipping address
- Order items table with images
- Order summary (subtotal, shipping, total)
- Status update dropdown (pending → confirmed → shipped → delivered → cancelled)
- Payment status badge

### Collections (`/admin/collections`)
- Grid of collection cards with image, title, product count
- Links to edit (edit functionality not yet built)

---

## SEO

### Metadata
- Every page has `export const metadata` or `generateMetadata` for dynamic pages
- Title template: `%s | ElektroPolis Malta`
- Open Graph tags on product pages (title, description, images)

### JSON-LD
- Product pages include structured data (`@type: Product` with offers, brand, availability)

### Sitemap (`/sitemap.xml`)
- Dynamically generated from products and collections in Supabase
- Includes: homepage, all product pages, all collection pages, static pages

### Robots (`/robots.txt`)
- Allow all crawlers
- Sitemap URL included

---

## Styling & Design System

### Theme (Tailwind v4 CSS Custom Properties)

```css
--color-brand: #FF580D          /* Orange accent */
--color-brand-hover: #E54D0B    /* Darker orange */
--color-brand-light: #FFF0E8    /* Light orange tint */
--color-charcoal: #2A2B2A       /* Primary text */
--color-surface: #F7F7F5        /* Background tint */
--color-border: #E8E8E4         /* Borders */
--color-muted: #8A8A86          /* Secondary text */
--color-warm-white: #FDFCFA     /* Warm background */
--color-success: #2D8A4E        /* Green */
--color-error: #C4122F          /* Red */
```

### Font
- **DM Sans** (Google Fonts) - loaded in root layout

### Animations (defined in globals.css)
- `slideInRight` / `slideOutRight` - Cart drawer
- `slideInLeft` / `slideOutLeft` - Admin sidebar, mobile menu
- `fadeIn` / `fadeOut` - Overlays
- `scaleIn` - Dropdowns, modals

### Utility Classes
- `bg-brand`, `text-brand`, `hover:bg-brand-hover` - Brand colors
- `text-charcoal`, `text-muted` - Text hierarchy
- `bg-surface`, `border-border` - Background/border
- Custom noise texture background class

---

## Deployment

### Build Command
```bash
npm run build
```

### Deploy to Railway
```bash
git push origin main    # Auto-triggers Railway build
railway redeploy --yes  # Force redeploy if needed
```

### Docker Build (what Railway uses)
```dockerfile
FROM node:20-alpine AS base
# ... multi-stage build
# Output: standalone Next.js server
# Port: 3000 (Railway assigns via $PORT)
```

### Database Migrations
```bash
supabase db push --linked    # Apply pending migrations to linked project
```

### Monitoring
```bash
railway logs             # View deployment logs
railway status           # Check service status
```

---

## Known Limitations & TODO

### Not Yet Implemented
1. **Payment integration** - Revolut Link/Merchant API not connected. All orders are `payment_status: "unpaid"`
2. **Email notifications** - Contact form logs to console only. No order confirmation emails
3. **Image upload in admin** - Product images must be URLs; no file upload UI yet
4. **Collection editing** - Admin can view collections but not create/edit them
5. **Customer management** - No admin page for viewing/managing customers
6. **Inventory decrement** - Checkout doesn't reduce `inventory_count` on purchase
7. **Password reset flow** - Forgot password sends email but reset page isn't fully wired
8. **FAQ management** - FAQ content is hardcoded; not yet reading from `faqs` table

### Legacy Database Columns
The `orders` table has duplicate columns from migration 001 (original) and 002 (fix). The original columns (`user_id`, `email`, `shipping_name`, `shipping_line1`, etc.) are unused by the current code but still exist in the schema. A cleanup migration could remove them.

### Data
- **106 products** migrated from Shopify (all with images in Supabase Storage)
- **17 collections** with correct product mappings
- **3 brands**: Akpo, Deante, Nobana

### Performance Notes
- `location is not defined` warning during build is from Zustand localStorage persist during SSR - harmless
- Product pages use Server Components for SSR (SEO-friendly)
- Images served from Supabase Storage via Next.js Image optimization
- Full-text search uses GIN index - fast even at scale
