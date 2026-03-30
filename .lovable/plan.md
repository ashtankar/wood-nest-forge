

# Plan: Supabase Database, Authentication & Full Backend Integration

## Overview

Replace all localStorage-based auth and hardcoded data with real Supabase Auth + database tables. This covers authentication (email/password + Google OAuth), role-based access via an `admin_emails` table, and full CRUD for products, orders, cart, wishlist, addresses, reviews, promo codes, B2B inquiries, and contact messages.

---

## Database Schema (13 tables + enums + triggers)

### Enums
- `order_status`: processing, shipped, delivered, cancelled
- `promo_type`: percentage, flat
- `app_role`: admin, customer

### Tables

1. **profiles** — auto-created on signup via trigger
   - `id` (uuid, FK → auth.users), `full_name`, `avatar_url`, `created_at`, `updated_at`

2. **admin_emails** — stores email addresses that get admin role on signup/login
   - `id` (uuid), `email` (text, unique), `created_at`
   - Seeded with initial admin emails you provide

3. **user_roles** — RBAC table (admin/customer)
   - `id` (uuid), `user_id` (FK → auth.users), `role` (app_role), unique(user_id, role)
   - Auto-assigned via trigger: if email exists in `admin_emails` → admin role, otherwise → customer

4. **products** — all product data currently hardcoded
   - `id` (uuid), `slug` (unique), `name`, `category`, `room`, `material`, `color`, `price`, `original_price`, `image_url`, `images` (text[]), `rating`, `review_count`, `stock`, `dimensions`, `weight`, `description`, `tags` (text[]), `created_at`, `updated_at`

5. **complementary_products** — many-to-many self-join
   - `product_id`, `complementary_product_id`

6. **cart_items** — per-user cart
   - `id`, `user_id` (FK → auth.users), `product_id` (FK → products), `quantity`, `created_at`

7. **wishlist_items** — per-user wishlist
   - `id`, `user_id`, `product_id`, unique(user_id, product_id), `created_at`

8. **addresses** — saved shipping addresses
   - `id`, `user_id`, `label`, `address_line`, `city`, `postal_code`, `country`, `is_default`, `created_at`

9. **orders** — customer orders
   - `id`, `user_id`, `status` (order_status), `subtotal`, `discount`, `tax`, `total`, `shipping_address`, `promo_code_id`, `tracking_link`, `created_at`, `updated_at`

10. **order_items** — line items per order
    - `id`, `order_id` (FK → orders), `product_id` (FK → products), `product_name`, `quantity`, `unit_price`

11. **promo_codes** — discount codes managed by admins
    - `id`, `code` (unique), `type` (promo_type), `value`, `active`, `usage_count`, `expires_at`, `created_at`

12. **reviews** — product reviews by customers
    - `id`, `product_id` (FK → products), `user_id` (FK → auth.users), `author_name`, `rating`, `text`, `created_at`

13. **contact_messages** — from the Contact Us form (public, no auth needed)
    - `id`, `name`, `email`, `subject`, `message`, `created_at`

14. **b2b_inquiries** — bulk order inquiries
    - `id`, `company_name`, `contact_name`, `email`, `phone`, `message`, `status`, `created_at`

### Security Functions & Triggers

- `has_role(user_id, role)` — security definer function for RLS
- `handle_new_user()` trigger — on auth.users insert: creates profile, checks `admin_emails`, assigns role
- `update_updated_at()` trigger — on profiles, products, orders

### RLS Policies

- **profiles**: users read/update own; admins read all
- **admin_emails**: admins only (full CRUD)
- **user_roles**: users read own; admins read all
- **products**: public read; admins insert/update/delete
- **cart_items / wishlist_items / addresses**: users CRUD own only
- **orders / order_items**: users read own; admins read all, update status
- **promo_codes**: public read active; admins full CRUD
- **reviews**: public read; authenticated insert own; admins delete
- **contact_messages**: public insert; admins read
- **b2b_inquiries**: public insert; admins read/update

### Seed Data
- Insert the 7 existing products from `src/data/products.ts`
- Insert the 3 existing promo codes
- Insert the 5 existing sample orders (linked to test users)

---

## Authentication Changes

### Step 1: Supabase Auth (email/password + Google)
- Replace localStorage auth in `Auth.tsx` with `supabase.auth.signUp()` / `signInWithPassword()`
- Add Google OAuth button using `supabase.auth.signInWithOAuth({ provider: 'google' })`
- Add password reset flow (forgot password page + `/reset-password` route)
- Remove the Customer/Manager role toggle from the auth page — role is determined automatically by `admin_emails` table

### Step 2: Auth Context
- Create `src/contexts/AuthContext.tsx` with `onAuthStateChange` listener
- Expose `user`, `session`, `role`, `loading`, `signOut` globally
- Replace all `localStorage` auth checks across the app

### Step 3: Protected Routes
- Update `ProtectedRoute.tsx` to use AuthContext + query `user_roles` table
- Admin routes check for `admin` role from database (not localStorage)

---

## Frontend Integration (page by page)

### Storefront Header
- Use AuthContext for login state, cart count from `cart_items` query
- Search queries products from Supabase instead of local array

### Product Detail
- Fetch product from Supabase by slug
- Add to cart / wishlist writes to `cart_items` / `wishlist_items`
- Reviews fetched from `reviews` table; submit review form inserts

### Cart Drawer
- Fetch `cart_items` joined with `products` for logged-in user
- Quantity update / remove mutates `cart_items`

### Checkout
- Creates `orders` + `order_items` rows
- Validates promo code against `promo_codes` table
- Saves shipping address to `addresses` if requested

### Account Page
- Orders tab: query `orders` + `order_items` for current user
- Wishlist tab: query `wishlist_items` joined with `products`
- Addresses tab: CRUD on `addresses` table

### Contact Us
- Form submission inserts into `contact_messages`

### Admin Dashboard (all pages)
- **Overview**: aggregate queries on orders, products, customers
- **Products**: CRUD on `products` table (add/edit/delete)
- **Orders**: read all orders, update status, view details
- **Promos**: CRUD on `promo_codes`
- **Customers**: read `profiles` + order aggregates
- **B2B**: read/manage `b2b_inquiries`

---

## Files to Create / Modify

**New files:**
- `src/contexts/AuthContext.tsx` — auth provider + hook
- `src/pages/ResetPassword.tsx` — password reset page
- `src/hooks/useProducts.ts` — product queries
- `src/hooks/useCart.ts` — cart CRUD
- `src/hooks/useWishlist.ts` — wishlist CRUD
- `src/hooks/useOrders.ts` — order queries
- SQL migration (via migration tool) — all tables, enums, RLS, triggers, seed data

**Modified files:**
- `src/App.tsx` — add AuthProvider wrapper, /reset-password route
- `src/pages/Auth.tsx` — real Supabase auth + Google button
- `src/components/ProtectedRoute.tsx` — use AuthContext
- `src/components/storefront/StorefrontHeader.tsx` — AuthContext + live cart
- `src/components/storefront/CartDrawer.tsx` — real cart data
- `src/pages/ProductDetail.tsx` — Supabase product fetch + cart/wishlist
- `src/pages/Shop.tsx` — Supabase product queries
- `src/pages/Checkout.tsx` — real order creation
- `src/pages/Account.tsx` — real data from Supabase
- `src/pages/ContactUs.tsx` — insert to contact_messages
- `src/pages/admin/*` — all admin pages use Supabase queries
- `src/components/admin/AdminLayout.tsx` — AuthContext logout
- `src/lib/auth.ts` — remove or redirect to AuthContext

---

## Implementation Order

1. Run database migration (all tables, enums, functions, triggers, RLS, seed data)
2. Create AuthContext + update Auth page with Supabase Auth + Google OAuth
3. Update ProtectedRoute + App.tsx
4. Create data hooks (useProducts, useCart, useWishlist, useOrders)
5. Update storefront pages (Header, Shop, ProductDetail, CartDrawer, Checkout, Account)
6. Update admin pages to use Supabase queries
7. Update ContactUs to write to database

**Note:** You will need to configure Google OAuth in your Supabase dashboard (Authentication → Providers → Google) with your Google Cloud credentials for the Google sign-in button to work.

