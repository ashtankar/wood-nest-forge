import credenzaImg from "@/assets/product-credenza.jpg";
import chairImg from "@/assets/product-chair.jpg";
import tableImg from "@/assets/product-table.jpg";
import bookshelfImg from "@/assets/product-bookshelf.jpg";
import lampImg from "@/assets/product-lamp.jpg";
import sofaImg from "@/assets/product-sofa.jpg";
import nightstandImg from "@/assets/product-nightstand.jpg";

export interface Product {
  id: string;
  name: string;
  category: string;
  room: string;
  material: string;
  color: string;
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  rating: number;
  reviewCount: number;
  stock: number;
  dimensions: string;
  weight: string;
  description: string;
  complementaryIds: string[];
  tags: string[];
}

export interface Order {
  id: string;
  customer: string;
  email: string;
  date: string;
  total: number;
  tax: number;
  status: "processing" | "shipped" | "delivered" | "cancelled";
  items: { name: string; qty: number; price: number }[];
  trackingLink?: string;
}

export interface PromoCode {
  id: string;
  code: string;
  type: "percentage" | "flat";
  value: number;
  active: boolean;
  usageCount: number;
  expiresAt: string;
}

export const products: Product[] = [
  {
    id: "walnut-credenza",
    name: "Walnut Credenza",
    category: "Storage",
    room: "Living Room",
    material: "Walnut",
    color: "Brown",
    price: 2890,
    image: credenzaImg,
    images: [credenzaImg, credenzaImg],
    rating: 4.8,
    reviewCount: 47,
    stock: 12,
    dimensions: "180 × 45 × 75 cm",
    weight: "42 kg",
    description: "Hand-finished solid walnut credenza with soft-close drawers and brass hardware. Each piece is unique with natural grain variations that tell the story of the wood.",
    complementaryIds: ["boucle-accent-chair", "arc-desk-lamp"],
    tags: ["bestseller"],
  },
  {
    id: "boucle-accent-chair",
    name: "Bouclé Accent Chair",
    category: "Seating",
    room: "Living Room",
    material: "Bouclé",
    color: "Cream",
    price: 1240,
    image: chairImg,
    images: [chairImg, chairImg],
    rating: 4.9,
    reviewCount: 83,
    stock: 3,
    dimensions: "72 × 68 × 80 cm",
    weight: "14 kg",
    description: "Generously proportioned accent chair upholstered in premium Italian bouclé. Solid oak frame with a gentle recline for hours of comfortable reading.",
    complementaryIds: ["walnut-credenza", "linen-sofa"],
    tags: ["low-stock"],
  },
  {
    id: "oak-dining-table",
    name: "Oak Dining Table",
    category: "Tables",
    room: "Dining Room",
    material: "Oak",
    color: "Natural",
    price: 3450,
    originalPrice: 3800,
    image: tableImg,
    images: [tableImg, tableImg],
    rating: 4.7,
    reviewCount: 32,
    stock: 8,
    dimensions: "220 × 100 × 76 cm",
    weight: "68 kg",
    description: "Solid European oak dining table with a live-edge detail on one side. Seats 8 comfortably. The surface is treated with a matte oil finish for a natural tactile experience.",
    complementaryIds: ["boucle-accent-chair"],
    tags: [],
  },
  {
    id: "modular-bookshelf",
    name: "Modular Bookshelf",
    category: "Storage",
    room: "Office",
    material: "Walnut",
    color: "Dark Brown",
    price: 1890,
    image: bookshelfImg,
    images: [bookshelfImg, bookshelfImg],
    rating: 4.6,
    reviewCount: 21,
    stock: 15,
    dimensions: "120 × 35 × 200 cm",
    weight: "55 kg",
    description: "A modular shelving system in dark walnut. Configurable shelves allow for books, objects, and integrated lighting. Wall-mounted for a floating effect.",
    complementaryIds: ["arc-desk-lamp", "walnut-credenza"],
    tags: [],
  },
  {
    id: "arc-desk-lamp",
    name: "Arc Desk Lamp",
    category: "Lighting",
    room: "Office",
    material: "Brass & Leather",
    color: "Gold",
    price: 380,
    image: lampImg,
    images: [lampImg, lampImg],
    rating: 4.9,
    reviewCount: 112,
    stock: 28,
    dimensions: "20 × 20 × 52 cm",
    weight: "2.8 kg",
    description: "Adjustable brass arc lamp with a hand-stitched leather grip. Warm LED illumination with three brightness settings. The perfect companion for focused work.",
    complementaryIds: ["modular-bookshelf"],
    tags: ["bestseller"],
  },
  {
    id: "linen-sofa",
    name: "Linen Sofa",
    category: "Seating",
    room: "Living Room",
    material: "Linen",
    color: "Gray",
    price: 4200,
    image: sofaImg,
    images: [sofaImg, sofaImg],
    rating: 4.8,
    reviewCount: 56,
    stock: 5,
    dimensions: "240 × 95 × 82 cm",
    weight: "72 kg",
    description: "Three-seat sofa in stonewashed Belgian linen with a solid oak base. Deep cushions with a high-resilience foam core wrapped in down feathers.",
    complementaryIds: ["boucle-accent-chair", "walnut-credenza"],
    tags: [],
  },
  {
    id: "walnut-nightstand",
    name: "Walnut Nightstand",
    category: "Tables",
    room: "Bedroom",
    material: "Walnut",
    color: "Brown",
    price: 680,
    image: nightstandImg,
    images: [nightstandImg, nightstandImg],
    rating: 4.7,
    reviewCount: 39,
    stock: 0,
    dimensions: "50 × 40 × 55 cm",
    weight: "12 kg",
    description: "Compact nightstand in solid walnut with a single soft-close drawer and an open shelf for books. Pairs perfectly with our bedroom collection.",
    complementaryIds: ["arc-desk-lamp"],
    tags: ["out-of-stock"],
  },
];

export const orders: Order[] = [
  {
    id: "ORD-2024-001",
    customer: "Sarah Mitchell",
    email: "sarah@example.com",
    date: "2026-03-15",
    total: 4130,
    tax: 661,
    status: "processing",
    items: [
      { name: "Walnut Credenza", qty: 1, price: 2890 },
      { name: "Bouclé Accent Chair", qty: 1, price: 1240 },
    ],
  },
  {
    id: "ORD-2024-002",
    customer: "James Chen",
    email: "james@studio.co",
    date: "2026-03-14",
    total: 3450,
    tax: 552,
    status: "shipped",
    items: [{ name: "Oak Dining Table", qty: 1, price: 3450 }],
    trackingLink: "https://tracking.example.com/abc123",
  },
  {
    id: "ORD-2024-003",
    customer: "Elena Rossi",
    email: "elena@design.it",
    date: "2026-03-12",
    total: 6090,
    tax: 974,
    status: "delivered",
    items: [
      { name: "Linen Sofa", qty: 1, price: 4200 },
      { name: "Modular Bookshelf", qty: 1, price: 1890 },
    ],
  },
  {
    id: "ORD-2024-004",
    customer: "Tom Albrecht",
    email: "tom@arch.de",
    date: "2026-03-10",
    total: 760,
    tax: 122,
    status: "delivered",
    items: [{ name: "Arc Desk Lamp", qty: 2, price: 380 }],
  },
  {
    id: "ORD-2024-005",
    customer: "Mia Tanaka",
    email: "mia@workspace.jp",
    date: "2026-03-08",
    total: 12600,
    tax: 2016,
    status: "shipped",
    items: [{ name: "Linen Sofa", qty: 3, price: 4200 }],
    trackingLink: "https://tracking.example.com/xyz789",
  },
];

export const promoCodes: PromoCode[] = [
  { id: "p1", code: "WELCOME15", type: "percentage", value: 15, active: true, usageCount: 234, expiresAt: "2026-06-30" },
  { id: "p2", code: "STUDIO100", type: "flat", value: 100, active: true, usageCount: 89, expiresAt: "2026-04-30" },
  { id: "p3", code: "SPRING10", type: "percentage", value: 10, active: false, usageCount: 567, expiresAt: "2026-03-01" },
];

export const rooms = ["Living Room", "Dining Room", "Bedroom", "Office"];
export const materials = ["Walnut", "Oak", "Bouclé", "Linen", "Brass & Leather"];
export const colors = ["Brown", "Dark Brown", "Cream", "Natural", "Gold", "Gray"];

export const reviews = [
  { author: "Anna K.", rating: 5, date: "2026-02-14", text: "Absolutely stunning piece. The walnut grain is beautiful and the craftsmanship is impeccable." },
  { author: "Mark D.", rating: 4, date: "2026-01-28", text: "Very well made. Took about 3 weeks to arrive but worth the wait. Minor scratch on delivery, quickly resolved." },
  { author: "Lisa P.", rating: 5, date: "2026-01-15", text: "This is the third piece I've purchased from AlgoForge. Consistent quality every time." },
  { author: "David R.", rating: 5, date: "2025-12-20", text: "The materials feel premium and the dimensions are perfect for my space. Highly recommend." },
];
