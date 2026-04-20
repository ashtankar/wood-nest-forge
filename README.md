# ArgoForge — E-Commerce Storefront & B2B Admin Platform

ArgoForge is a two-in-one commerce platform built on React + Supabase:

1. **Customer Storefront** — mobile-first shopping experience with catalog
   browsing, cart, wishlist, checkout (Razorpay), AI negotiation chat,
   reviews, B2B inquiries and a customer account portal.
2. **Business Manager Admin Dashboard** — desktop-optimised back-office for
   managing products, orders, customers, promo codes, B2B inquiries and
   financials.

Live preview: <https://wood-nest-forge.lovable.app>

---

## ✨ Feature Highlights

### Storefront
- Catalog with category/room/material filters, live search overlay
- Rich product detail pages (gallery, video, AR, complementary items, reviews)
- Persistent cart + wishlist synced to Supabase
- Checkout with **16 % tax**, promo codes (`%` and flat-rate) and **Razorpay** payment integration
- Customer account portal (orders, invoices, addresses, wishlist)
- AI **negotiation chat** widget powered by Lovable AI Gateway
- Contact form + B2B bulk-order inquiry intake
- WhatsApp + live-chat support entry points
- Brand & service pages: warranty, returns, shipping, care guides, sustainability

### Admin Dashboard
- Overview KPIs, financial reports, margin analysis
- Product CMS (specs, stock, low-stock indicators, complementary mapping)
- Order management with statuses and courier tracking links
- Customers, B2B inquiries, promo code management
- Role-based access via `user_roles` + `has_role()` (no client-side admin checks)

---

## 🧱 Tech Stack

| Layer | Tools |
|---|---|
| Frontend | React 18, Vite 5, TypeScript 5, Tailwind CSS v3 |
| UI kit   | shadcn/ui, Radix primitives, Lucide icons, Framer Motion |
| Routing  | React Router |
| State / data | TanStack Query, custom hooks (`useCart`, `useWishlist`, `useOrders`, `useProducts`) |
| Backend  | Supabase (Postgres + Auth + Storage + Edge Functions) |
| Auth     | Supabase email/password + Google OAuth, RBAC via `user_roles` |
| Payments | Razorpay (server-side order creation + HMAC signature verification) |
| AI       | Lovable AI Gateway (streaming negotiation chat) |
| Testing  | Pytest + Supabase Python SDK (`api_tests/`), Vitest (`src/test/`) |
| Hosting  | Lovable Preview / custom domain |

---

## 🗂 Project Structure

```
.
├── src/
│   ├── pages/                 # Route components (storefront + admin)
│   ├── components/            # Reusable UI (storefront, admin, shadcn ui)
│   ├── hooks/                 # useCart, useWishlist, useOrders, useProducts...
│   ├── contexts/AuthContext   # Auth + role state
│   ├── integrations/supabase  # Generated client + types
│   └── index.css              # HSL design tokens
├── supabase/
│   ├── functions/
│   │   ├── razorpay-create-order/
│   │   ├── razorpay-verify-payment/
│   │   └── negotiation-chat/
│   └── migrations/
├── docs/
│   ├── api/openapi.yaml       # Full OpenAPI 3.0.3 spec
│   └── BACKEND_README.md
├── api_tests/                 # Pytest API + RLS suite
└── index.html
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18 and npm/bun
- Python 3.10+ (only for running the API tests)
- A Supabase project (already linked: ref `brdtmlcwzrmoczemalbd`)

### Install & run the frontend
```bash
npm install
npm run dev          # Vite dev server
```

`.env` is auto-populated with `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.

### Edge function secrets
Configure these in **Supabase → Settings → Functions → Secrets**:

| Secret | Used by |
|---|---|
| `RAZORPAY_KEY_ID`     | `razorpay-create-order` |
| `RAZORPAY_KEY_SECRET` | `razorpay-create-order`, `razorpay-verify-payment` |
| `LOVABLE_API_KEY`     | `negotiation-chat` (auto-provisioned) |

### Run the API test suite
```bash
cd api_tests
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
pytest
```
See [`api_tests/README.md`](api_tests/README.md) for the full breakdown.

---

## 🔐 Security Model

- All sensitive tables have **RLS enabled**. Public reads are restricted to
  catalog/reviews/active promos; user-scoped tables (`cart_items`, `orders`,
  `addresses`, `wishlist_items`, `profiles`) require `user_id = auth.uid()`.
- Roles live in a dedicated `user_roles` table and are checked through the
  `has_role(user_id, role)` security-definer function — never on the client.
- Razorpay `KEY_SECRET` never leaves the edge function; the client only sees
  the public `KEY_ID` returned by `razorpay-create-order`.
- Payment signatures are verified server-side with HMAC-SHA-256 before any
  order row is finalised.

---

## 📚 API Documentation

The full API surface (PostgREST tables + edge functions) is documented in
[`docs/api/openapi.yaml`](docs/api/openapi.yaml). Open it in
[Swagger Editor](https://editor.swagger.io/) or any OpenAPI viewer.

---

## 🗺 Roadmap Ideas

- Razorpay webhooks for async refund / failure events
- Persisted AI chat history
- Admin-side payment ID display
- Invoice PDF generation
- Real-time order status updates via Supabase Realtime

---

## 📝 License

Proprietary — © ArgoForge. All rights reserved.
