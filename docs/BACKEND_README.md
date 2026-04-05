# ArgoForge — Backend Documentation

## Tech Stack

| Layer | Technology |
|---|---|
| Database | PostgreSQL (via Supabase) |
| Authentication | Supabase Auth (Email/Password + Google OAuth) |
| Authorization | Row-Level Security (RLS) + Custom RBAC |
| API | Supabase Auto-generated REST & Realtime |
| Client SDK | `@supabase/supabase-js` v2 |

---

## Database Schema

### Enums

```sql
CREATE TYPE public.app_role AS ENUM ('admin', 'customer');
CREATE TYPE public.order_status AS ENUM ('processing', 'shipped', 'delivered', 'cancelled');
CREATE TYPE public.promo_type AS ENUM ('percentage', 'flat');
```

---

### Tables

#### 1. `profiles`
Auto-created on user signup via database trigger.

| Column | Type | Nullable | Default |
|---|---|---|---|
| `id` | `uuid` (PK) | No | — (references `auth.users`) |
| `full_name` | `text` | Yes | `NULL` |
| `avatar_url` | `text` | Yes | `NULL` |
| `created_at` | `timestamptz` | No | `now()` |
| `updated_at` | `timestamptz` | No | `now()` |

**RLS:**
- Users can SELECT/UPDATE their own profile
- Admins can SELECT all profiles

---

#### 2. `admin_emails`
Stores email addresses that automatically receive the `admin` role upon signup.

| Column | Type | Nullable | Default |
|---|---|---|---|
| `id` | `uuid` (PK) | No | `gen_random_uuid()` |
| `email` | `text` (unique) | No | — |
| `created_at` | `timestamptz` | No | `now()` |

**RLS:** Admins only (full CRUD).

---

#### 3. `user_roles`
RBAC table — each user gets exactly one role assigned automatically by the `handle_new_user()` trigger.

| Column | Type | Nullable | Default |
|---|---|---|---|
| `id` | `uuid` (PK) | No | `gen_random_uuid()` |
| `user_id` | `uuid` | No | — |
| `role` | `app_role` | No | — |

**Unique constraint:** `(user_id, role)`

**RLS:**
- Users can SELECT their own role
- Admins can SELECT all roles
- No public INSERT/UPDATE/DELETE

---

#### 4. `products`
Full product catalog managed by admins.

| Column | Type | Nullable | Default |
|---|---|---|---|
| `id` | `uuid` (PK) | No | `gen_random_uuid()` |
| `slug` | `text` (unique) | No | — |
| `name` | `text` | No | — |
| `category` | `text` | No | `''` |
| `room` | `text` | No | `''` |
| `material` | `text` | No | `''` |
| `color` | `text` | No | `''` |
| `price` | `numeric` | No | `0` |
| `original_price` | `numeric` | Yes | `NULL` |
| `image_url` | `text` | No | `''` |
| `images` | `text[]` | No | `'{}'` |
| `rating` | `numeric` | No | `0` |
| `review_count` | `integer` | No | `0` |
| `stock` | `integer` | No | `0` |
| `dimensions` | `text` | No | `''` |
| `weight` | `text` | No | `''` |
| `description` | `text` | No | `''` |
| `tags` | `text[]` | No | `'{}'` |
| `created_at` | `timestamptz` | No | `now()` |
| `updated_at` | `timestamptz` | No | `now()` |

**RLS:**
- Public can SELECT (read-only storefront)
- Admins have full CRUD

---

#### 5. `complementary_products`
Many-to-many self-join for product recommendations.

| Column | Type | Nullable | Default |
|---|---|---|---|
| `product_id` | `uuid` (PK, FK → products) | No | — |
| `complementary_product_id` | `uuid` (PK, FK → products) | No | — |

**RLS:**
- Public can SELECT
- Admins have full CRUD

---

#### 6. `cart_items`
Per-user shopping cart, persisted in the database.

| Column | Type | Nullable | Default |
|---|---|---|---|
| `id` | `uuid` (PK) | No | `gen_random_uuid()` |
| `user_id` | `uuid` | No | — |
| `product_id` | `uuid` (FK → products) | No | — |
| `quantity` | `integer` | No | `1` |
| `created_at` | `timestamptz` | No | `now()` |

**RLS:** Authenticated users manage their own cart only.

---

#### 7. `wishlist_items`
Per-user product wishlist.

| Column | Type | Nullable | Default |
|---|---|---|---|
| `id` | `uuid` (PK) | No | `gen_random_uuid()` |
| `user_id` | `uuid` | No | — |
| `product_id` | `uuid` (FK → products) | No | — |
| `created_at` | `timestamptz` | No | `now()` |

**Unique constraint:** `(user_id, product_id)`

**RLS:** Authenticated users manage their own wishlist only.

---

#### 8. `addresses`
Saved shipping addresses per user.

| Column | Type | Nullable | Default |
|---|---|---|---|
| `id` | `uuid` (PK) | No | `gen_random_uuid()` |
| `user_id` | `uuid` | No | — |
| `label` | `text` | No | `''` |
| `address_line` | `text` | No | `''` |
| `city` | `text` | No | `''` |
| `postal_code` | `text` | No | `''` |
| `country` | `text` | No | `''` |
| `is_default` | `boolean` | No | `false` |
| `created_at` | `timestamptz` | No | `now()` |

**RLS:** Authenticated users manage their own addresses only.

---

#### 9. `orders`
Customer orders with status tracking.

| Column | Type | Nullable | Default |
|---|---|---|---|
| `id` | `uuid` (PK) | No | `gen_random_uuid()` |
| `user_id` | `uuid` | No | — |
| `status` | `order_status` | No | `'processing'` |
| `subtotal` | `numeric` | No | `0` |
| `discount` | `numeric` | No | `0` |
| `tax` | `numeric` | No | `0` |
| `total` | `numeric` | No | `0` |
| `shipping_address` | `jsonb` | Yes | `NULL` |
| `promo_code_id` | `uuid` (FK → promo_codes) | Yes | `NULL` |
| `tracking_link` | `text` | Yes | `NULL` |
| `created_at` | `timestamptz` | No | `now()` |
| `updated_at` | `timestamptz` | No | `now()` |

**RLS:**
- Users can SELECT/INSERT their own orders
- Admins have full CRUD

---

#### 10. `order_items`
Line items belonging to an order.

| Column | Type | Nullable | Default |
|---|---|---|---|
| `id` | `uuid` (PK) | No | `gen_random_uuid()` |
| `order_id` | `uuid` (FK → orders) | No | — |
| `product_id` | `uuid` (FK → products) | Yes | `NULL` |
| `product_name` | `text` | No | `''` |
| `quantity` | `integer` | No | `1` |
| `unit_price` | `numeric` | No | `0` |

**RLS:**
- Users can SELECT/INSERT items for their own orders
- Admins have full CRUD

---

#### 11. `promo_codes`
Discount codes managed by admins.

| Column | Type | Nullable | Default |
|---|---|---|---|
| `id` | `uuid` (PK) | No | `gen_random_uuid()` |
| `code` | `text` (unique) | No | — |
| `type` | `promo_type` | No | `'percentage'` |
| `value` | `numeric` | No | `0` |
| `active` | `boolean` | No | `true` |
| `usage_count` | `integer` | No | `0` |
| `expires_at` | `timestamptz` | Yes | `NULL` |
| `created_at` | `timestamptz` | No | `now()` |

**RLS:**
- Public can SELECT active promo codes
- Admins have full CRUD

---

#### 12. `reviews`
Product reviews submitted by authenticated users.

| Column | Type | Nullable | Default |
|---|---|---|---|
| `id` | `uuid` (PK) | No | `gen_random_uuid()` |
| `product_id` | `uuid` (FK → products) | No | — |
| `user_id` | `uuid` | No | — |
| `author_name` | `text` | No | `''` |
| `rating` | `integer` | No | `5` |
| `text` | `text` | No | `''` |
| `created_at` | `timestamptz` | No | `now()` |

**RLS:**
- Public can SELECT all reviews
- Authenticated users can INSERT their own reviews
- Admins can DELETE any review

---

#### 13. `contact_messages`
Public contact form submissions.

| Column | Type | Nullable | Default |
|---|---|---|---|
| `id` | `uuid` (PK) | No | `gen_random_uuid()` |
| `name` | `text` | No | `''` |
| `email` | `text` | No | `''` |
| `subject` | `text` | No | `''` |
| `message` | `text` | No | `''` |
| `created_at` | `timestamptz` | No | `now()` |

**RLS:**
- Public can INSERT (no auth required)
- Admins can SELECT

---

#### 14. `b2b_inquiries`
Bulk/wholesale order inquiries.

| Column | Type | Nullable | Default |
|---|---|---|---|
| `id` | `uuid` (PK) | No | `gen_random_uuid()` |
| `company_name` | `text` | No | `''` |
| `contact_name` | `text` | No | `''` |
| `email` | `text` | No | `''` |
| `phone` | `text` | No | `''` |
| `message` | `text` | No | `''` |
| `status` | `text` | No | `'new'` |
| `created_at` | `timestamptz` | No | `now()` |

**RLS:**
- Public can INSERT
- Admins have full CRUD

---

## Database Functions

### `has_role(_user_id uuid, _role app_role) → boolean`
Security-definer function used in RLS policies to check user roles without recursive policy evaluation.

```sql
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;
```

### `handle_new_user() → trigger`
Fired on `auth.users` INSERT. Creates a profile and assigns a role based on the `admin_emails` table.

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );

  -- Assign role
  IF EXISTS (SELECT 1 FROM public.admin_emails WHERE email = NEW.email) THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'customer');
  END IF;

  RETURN NEW;
END;
$$;
```

### `update_updated_at() → trigger`
Auto-updates the `updated_at` column on row modification for `profiles`, `products`, and `orders`.

```sql
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
```

---

## Authentication

### Supported Methods
| Method | Description |
|---|---|
| **Email/Password** | Standard signup + login with email confirmation |
| **Google OAuth** | One-click Google sign-in (requires config in Supabase dashboard) |
| **Password Reset** | Email-based password reset flow via `/reset-password` route |

### Role Assignment Flow
1. User signs up via Supabase Auth
2. `handle_new_user()` trigger fires automatically
3. Trigger checks if the user's email exists in `admin_emails`
4. If yes → assigns `admin` role; otherwise → assigns `customer` role
5. Frontend reads role from `user_roles` table via `AuthContext`

### Adding an Admin
Insert the admin's email into `admin_emails` **before** they sign up:

```sql
INSERT INTO admin_emails (email) VALUES ('admin@example.com');
```

If the user already exists, manually add their role:

```sql
INSERT INTO user_roles (user_id, role)
VALUES ('<user-uuid>', 'admin');
```

---

## Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│  auth.users  │──1:1──│   profiles   │       │ admin_emails │
│              │──1:1──│  user_roles  │       └──────────────┘
└──────┬───────┘       └──────────────┘
       │
       ├──1:N──┌──────────────┐──1:N──┌──────────────┐
       │       │    orders    │       │ order_items  │
       │       └──────┬───────┘       └──────┬───────┘
       │              │                      │
       │              │ FK                   │ FK
       │              ▼                      ▼
       │       ┌──────────────┐       ┌──────────────┐
       │       │ promo_codes  │       │   products   │
       │       └──────────────┘       └──────┬───────┘
       │                                     │
       ├──1:N──┌──────────────┐              │
       │       │  cart_items  │──FK──────────┘
       │       └──────────────┘              │
       │                                     │
       ├──1:N──┌──────────────┐              │
       │       │wishlist_items│──FK──────────┘
       │       └──────────────┘              │
       │                                     │
       ├──1:N──┌──────────────┐              │
       │       │  addresses   │       ┌──────┴───────┐
       │       └──────────────┘       │complementary │
       │                              │  _products   │
       ├──1:N──┌──────────────┐       └──────────────┘
       │       │   reviews    │──FK── products
       │       └──────────────┘
       │
       │       ┌──────────────┐
       │       │contact_msgs  │  (public, no auth)
       │       └──────────────┘
       │       ┌──────────────┐
       │       │b2b_inquiries │  (public insert)
       │       └──────────────┘
```

---

## Security Summary

| Table | Public Read | Auth Read Own | Auth Write Own | Admin Full |
|---|---|---|---|---|
| profiles | ✗ | ✓ | ✓ (update) | ✓ (read) |
| user_roles | ✗ | ✓ | ✗ | ✓ (read) |
| admin_emails | ✗ | ✗ | ✗ | ✓ |
| products | ✓ | ✓ | ✗ | ✓ |
| complementary_products | ✓ | ✓ | ✗ | ✓ |
| cart_items | ✗ | ✓ | ✓ | ✗ |
| wishlist_items | ✗ | ✓ | ✓ | ✗ |
| addresses | ✗ | ✓ | ✓ | ✗ |
| orders | ✗ | ✓ | ✓ (insert) | ✓ |
| order_items | ✗ | ✓ | ✓ (insert) | ✓ |
| promo_codes | ✓ (active) | ✓ | ✗ | ✓ |
| reviews | ✓ | ✓ | ✓ (insert) | ✓ (delete) |
| contact_messages | ✗ | ✗ | ✗ | ✓ (read) |
| b2b_inquiries | ✗ | ✗ | ✗ | ✓ |

> **Note:** `contact_messages` and `b2b_inquiries` allow public INSERT (no authentication required).

---

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL (auto-set) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key (auto-set) |

---

## Setup Instructions

1. **Connect Supabase** — Link your Supabase project in the Lovable dashboard
2. **Run Migrations** — All tables, enums, functions, triggers, and RLS policies are applied via migration files in `supabase/migrations/`
3. **Seed Admin** — Insert admin emails into `admin_emails` table before those users sign up
4. **Configure Google OAuth** (optional) — Go to Supabase Dashboard → Authentication → Providers → Google and add your Google Cloud OAuth credentials
5. **Add Products** — Use the admin dashboard or insert directly into the `products` table
