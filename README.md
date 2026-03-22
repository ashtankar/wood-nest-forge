# AlgoForge — Premium Furniture Storefront

A modern, responsive e-commerce frontend for premium furniture, built with React, TypeScript, Vite, and Tailwind CSS.

## Features

- **Product Catalog** — Browse by room (Living Room, Dining, Office, Bedroom) with search and filtering
- **Product Detail Pages** — High-quality imagery, specs, and add-to-cart / wishlist actions
- **Shopping Cart** — Slide-out cart drawer with quantity management
- **Authentication** — Customer and Business Manager login flows with role-based access
- **Account Dashboard** — Order history, wishlist, and profile management
- **Admin Panel** — Protected manager dashboard with overview, financials, products, orders, B2B, promos, and customer management
- **Informational Pages** — About Us, Contact, Warranty, Sustainability, Press, Care Guide, Shipping & Returns

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 |
| Language | TypeScript |
| Build Tool | Vite 8 |
| Styling | Tailwind CSS 3 + shadcn/ui |
| Routing | React Router v6 |
| State/Data | TanStack React Query |
| Animation | Framer Motion |
| Charts | Recharts |

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

The app runs at `http://localhost:8080`.

## Project Structure

```
src/
├── components/
│   ├── admin/          # Admin dashboard layout
│   ├── storefront/     # Header, footer, cart, product cards
│   └── ui/             # shadcn/ui component library
├── data/               # Static product data
├── hooks/              # Custom React hooks
├── lib/                # Utilities and auth helpers
└── pages/
    ├── admin/          # Admin panel pages
    └── ...             # Storefront pages
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run test` | Run unit tests (Vitest) |

## Supabase Database Schema

Copy and paste the following SQL into your Supabase SQL Editor to set up the complete database schema.

### 1. Enable Extensions

```sql
-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### 2. Custom Types

```sql
-- Order status enum
CREATE TYPE public.order_status AS ENUM ('processing', 'shipped', 'delivered', 'cancelled');

-- Promo code type enum
CREATE TYPE public.promo_type AS ENUM ('percentage', 'flat');

-- User role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'customer');
```

### 3. Tables

#### Profiles

```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Anyone can read their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

#### User Roles

```sql
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Only admins can manage roles
CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Users can read their own roles
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
```

#### Addresses

```sql
CREATE TABLE public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  label TEXT DEFAULT 'Home',
  line1 TEXT NOT NULL,
  line2 TEXT,
  city TEXT NOT NULL,
  state TEXT,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'DE',
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own addresses"
  ON public.addresses FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);
```

#### Products

```sql
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  room TEXT NOT NULL,
  material TEXT,
  color TEXT,
  price NUMERIC(10, 2) NOT NULL,
  original_price NUMERIC(10, 2),
  image_url TEXT,
  images TEXT[] DEFAULT '{}',
  rating NUMERIC(2, 1) DEFAULT 0,
  review_count INT DEFAULT 0,
  stock INT DEFAULT 0,
  dimensions TEXT,
  weight TEXT,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Products are publicly readable"
  ON public.products FOR SELECT
  TO anon, authenticated
  USING (is_active = TRUE);

-- Only admins can manage products
CREATE POLICY "Admins can manage products"
  ON public.products FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
```

#### Complementary Products (many-to-many)

```sql
CREATE TABLE public.complementary_products (
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  complementary_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (product_id, complementary_id)
);

ALTER TABLE public.complementary_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Complementary products are publicly readable"
  ON public.complementary_products FOR SELECT
  TO anon, authenticated
  USING (TRUE);
```

#### Reviews

```sql
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  rating INT CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Reviews are publicly readable"
  ON public.reviews FOR SELECT
  TO anon, authenticated
  USING (TRUE);

-- Authenticated users can create reviews
CREATE POLICY "Users can create reviews"
  ON public.reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
```

#### Orders

```sql
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  shipping_address_id UUID REFERENCES public.addresses(id),
  subtotal NUMERIC(10, 2) NOT NULL,
  tax NUMERIC(10, 2) DEFAULT 0,
  discount NUMERIC(10, 2) DEFAULT 0,
  total NUMERIC(10, 2) NOT NULL,
  status order_status DEFAULT 'processing' NOT NULL,
  tracking_link TEXT,
  promo_code_id UUID REFERENCES public.promo_codes(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Users can view their own orders
CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can manage all orders
CREATE POLICY "Admins can manage orders"
  ON public.orders FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
```

#### Order Items

```sql
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10, 2) NOT NULL,
  total_price NUMERIC(10, 2) NOT NULL
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own order items"
  ON public.order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage order items"
  ON public.order_items FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
```

#### Promo Codes

```sql
CREATE TABLE public.promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  type promo_type NOT NULL,
  value NUMERIC(10, 2) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  usage_count INT DEFAULT 0,
  max_uses INT,
  min_order_value NUMERIC(10, 2),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

-- Public can validate promo codes
CREATE POLICY "Anyone can read active promos"
  ON public.promo_codes FOR SELECT
  TO anon, authenticated
  USING (is_active = TRUE AND (expires_at IS NULL OR expires_at > NOW()));

-- Admins can manage promos
CREATE POLICY "Admins can manage promos"
  ON public.promo_codes FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
```

#### Cart

```sql
CREATE TABLE public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (user_id, product_id)
);

ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own cart"
  ON public.cart_items FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);
```

#### Wishlist

```sql
CREATE TABLE public.wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (user_id, product_id)
);

ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own wishlist"
  ON public.wishlist_items FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);
```

#### B2B Inquiries

```sql
CREATE TABLE public.b2b_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.b2b_inquiries ENABLE ROW LEVEL SECURITY;

-- Anyone can submit an inquiry
CREATE POLICY "Anyone can create inquiries"
  ON public.b2b_inquiries FOR INSERT
  TO anon, authenticated
  WITH CHECK (TRUE);

-- Only admins can view inquiries
CREATE POLICY "Admins can manage inquiries"
  ON public.b2b_inquiries FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
```

#### Contact Messages

```sql
CREATE TABLE public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit contact messages"
  ON public.contact_messages FOR INSERT
  TO anon, authenticated
  WITH CHECK (TRUE);

CREATE POLICY "Admins can manage contact messages"
  ON public.contact_messages FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
```

### 4. Utility Functions

```sql
-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
```

### 5. Seed Data

```sql
-- Insert products
INSERT INTO public.products (slug, name, category, room, material, color, price, original_price, rating, review_count, stock, dimensions, weight, description, tags) VALUES
  ('walnut-credenza', 'Walnut Credenza', 'Storage', 'Living Room', 'Walnut', 'Brown', 2890, NULL, 4.8, 47, 12, '180 × 45 × 75 cm', '42 kg', 'Hand-finished solid walnut credenza with soft-close drawers and brass hardware.', '{"bestseller"}'),
  ('boucle-accent-chair', 'Bouclé Accent Chair', 'Seating', 'Living Room', 'Bouclé', 'Cream', 1240, NULL, 4.9, 83, 3, '72 × 68 × 80 cm', '14 kg', 'Generously proportioned accent chair upholstered in premium Italian bouclé.', '{"low-stock"}'),
  ('oak-dining-table', 'Oak Dining Table', 'Tables', 'Dining Room', 'Oak', 'Natural', 3450, 3800, 4.7, 32, 8, '220 × 100 × 76 cm', '68 kg', 'Solid European oak dining table with a live-edge detail.', '{}'),
  ('modular-bookshelf', 'Modular Bookshelf', 'Storage', 'Office', 'Walnut', 'Dark Brown', 1890, NULL, 4.6, 21, 15, '120 × 35 × 200 cm', '55 kg', 'A modular shelving system in dark walnut.', '{}'),
  ('arc-desk-lamp', 'Arc Desk Lamp', 'Lighting', 'Office', 'Brass & Leather', 'Gold', 380, NULL, 4.9, 112, 28, '20 × 20 × 52 cm', '2.8 kg', 'Adjustable brass arc lamp with a hand-stitched leather grip.', '{"bestseller"}'),
  ('linen-sofa', 'Linen Sofa', 'Seating', 'Living Room', 'Linen', 'Gray', 4200, NULL, 4.8, 56, 5, '240 × 95 × 82 cm', '72 kg', 'Three-seat sofa in stonewashed Belgian linen.', '{}'),
  ('walnut-nightstand', 'Walnut Nightstand', 'Tables', 'Bedroom', 'Walnut', 'Brown', 680, NULL, 4.7, 39, 0, '50 × 40 × 55 cm', '12 kg', 'Compact nightstand in solid walnut with a single soft-close drawer.', '{"out-of-stock"}');

-- Insert promo codes
INSERT INTO public.promo_codes (code, type, value, is_active, usage_count, expires_at) VALUES
  ('WELCOME15', 'percentage', 15, TRUE, 234, '2026-06-30'),
  ('STUDIO100', 'flat', 100, TRUE, 89, '2026-04-30'),
  ('SPRING10', 'percentage', 10, FALSE, 567, '2026-03-01');
```

### 6. Storage Buckets

```sql
-- Run in Supabase Dashboard → Storage
-- Create bucket: product-images (public)
-- Create bucket: avatars (public)
```

### Schema Diagram (ERD)

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│  auth.users  │────▶│   profiles   │     │  user_roles  │
└──────┬──────┘     └──────────────┘     └──────────────┘
       │
       ├──────────▶ addresses
       ├──────────▶ cart_items ──────────▶ products
       ├──────────▶ wishlist_items ──────▶ products
       ├──────────▶ reviews ────────────▶ products
       │
       └──────────▶ orders
                      │
                      └──▶ order_items ─▶ products
                      └──▶ promo_codes

products ◀──▶ complementary_products

b2b_inquiries (standalone)
contact_messages (standalone)
```

## License

Private — All rights reserved.
