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

## License

Private — All rights reserved.
