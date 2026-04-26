## Goal

Make the Business Owner dashboard fully accessible, add a sales Analytics tab with daily/weekly/monthly charts, add a Dashboard nav button for logged-in admins, and ensure every product detail page has a Download Catalogue button. Confirm admin can fully insert/update/delete across products, orders, and customers.

## Changes

### 1. Header — Dashboard button for business owners
File: `src/components/storefront/StorefrontHeader.tsx`
- Read `role` from `useAuth()`.
- When `user && role === "admin"`, render a "Dashboard" button (with `LayoutDashboard` icon) linking to `/admin` next to the wishlist icon, on both desktop and mobile.

### 2. New Analytics page
File: `src/pages/admin/AdminAnalytics.tsx` (new)
- Use `useAllOrders()` + `useProducts()`.
- Compute three datasets from `orders.created_at` + `orders.total`:
  - Daily sales (last 30 days)
  - Weekly sales (last 12 weeks, ISO week buckets)
  - Monthly sales (last 12 months)
- Render a tabbed view (`Tabs` from shadcn) with `recharts` `LineChart`/`BarChart`:
  - Total revenue, total orders, average order value KPI cards
  - Sales-over-time chart (switchable Day / Week / Month)
  - Top-selling products bar chart (aggregated from `order_items`)
  - Order status breakdown (pie or stacked bar)
- Empty-state and `Loader2` while loading.

### 3. Wire Analytics into admin shell
Files: `src/App.tsx`, `src/components/admin/AdminLayout.tsx`
- Add route `/admin/analytics` (admin-protected) → `AdminAnalytics`.
- Add `{ label: "Analytics", href: "/admin/analytics", icon: BarChart3 }` to the sidebar `navItems` (between Financials and Products).
- Add an "Analytics" quick-link card in `BusinessDashboard.tsx`.

### 4. Product Detail — guaranteed Download Catalogue
File: `src/pages/ProductDetail.tsx`
- Show the Download Catalogue button on every product page. If `product.catalogue_url` is empty, render the button as disabled with tooltip "Catalogue coming soon" (instead of hiding it).
- Keep the working download anchor when URL is present.

### 5. Admin product form — full edit + bulk fields
File: `src/pages/admin/AdminProducts.tsx`
- Add an Edit dialog (pencil icon) that pre-fills the existing product and calls `supabase.from("products").update(...).eq("id", id)`.
- Add `original_price`, `tags` (comma-separated), and `images` (comma-separated URLs) to both Create and Edit forms so admin truly controls A→Z.
- Keep delete confirmation via `AlertDialog` to avoid accidental removal.

### 6. Admin Orders — status update
File: `src/pages/admin/AdminOrders.tsx`
- Ensure the status `Select` writes back via `supabase.from("orders").update({ status }).eq("id", id)` and invalidates `["all-orders"]`. (Verify and patch if missing.)
- Add tracking_link inline edit input.

### 7. Dependency
- Add `recharts` if not already present (it's in shadcn defaults but verify before importing).

## Technical Notes

- Date bucketing done client-side with vanilla `Date` math; no migration needed.
- All new admin reads/writes are gated by existing `has_role(auth.uid(), 'admin')` RLS — no schema or policy changes.
- Header role check uses the already-loaded `role` from `AuthContext` (no extra query).
- Charts use shadcn's existing `chart.tsx` wrapper around recharts for consistent theming.

## Out of Scope

- No DB schema changes.
- No new edge functions.
- No changes to customer-facing checkout / payment flow.
