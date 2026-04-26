import { StorefrontLayout } from "@/components/storefront/StorefrontLayout";
import { ProductCard } from "@/components/storefront/ProductCard";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/useProducts";
import { ArrowRight, Loader2, ShieldCheck, Truck, CreditCard, Clock, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import heroImg from "@/assets/hero-furniture.jpg";

// Replaced generic icons with professional photo-circles (Marketplace Standard)
const CATEGORIES = [
  { name: "Living Room", image: "https://loremflickr.com/200/200/sofa,livingroom?lock=101", path: "/shop?room=Living+Room" },
  { name: "Bedroom", image: "https://loremflickr.com/200/200/bed,bedroom?lock=102", path: "/shop?room=Bedroom" },
  { name: "Dining", image: "https://loremflickr.com/200/200/diningtable?lock=103", path: "/shop?room=Dining+Room" },
  { name: "Office", image: "https://loremflickr.com/200/200/desk,office?lock=104", path: "/shop?room=Office" },
  { name: "Decor", image: "https://loremflickr.com/200/200/lamp,decor?lock=105", path: "/shop?category=Decor" },
  { name: "Outdoor", image: "https://loremflickr.com/200/200/patio,furniture?lock=106", path: "/shop?room=Outdoor" },
];

const Index = () => {
  const { data: products, isLoading } = useProducts();

  const allProducts = products ?? [];
  const deals = allProducts.filter(p => p.original_price && p.original_price > p.price).slice(0, 4);
  const seating = allProducts.filter(p => p.category === 'Seating').slice(0, 4);
  const decor = allProducts.filter(p => p.category === 'Lighting' || p.category === 'Decor').slice(0, 4);

  const displayDeals = deals.length >= 4 ? deals : allProducts.slice(0, 4);
  const displaySeating = seating.length >= 4 ? seating : allProducts.slice(4, 8);
  const displayDecor = decor.length >= 4 ? decor : allProducts.slice(8, 12);

  return (
    <StorefrontLayout>
      {/* 1. Photo-Based Top Categories Bar */}
      <div className="bg-background border-b border-border/40 hidden md:block">
        <div className="container mx-auto px-4 py-5 overflow-x-auto no-scrollbar">
          <div className="flex items-center justify-between lg:justify-center gap-10 lg:gap-16 min-w-max">
            {CATEGORIES.map((cat) => (
              <Link key={cat.name} to={cat.path} className="flex flex-col items-center gap-3 group">
                <div className="h-20 w-20 rounded-full overflow-hidden border border-border/50 card-shadow group-hover:shadow-md group-hover:border-primary/50 transition-all">
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <span className="text-sm font-medium text-foreground/90 group-hover:text-primary transition-colors">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Premium Promotional Hero Banner */}
      <section className="container mx-auto px-4 py-6 md:py-8">
        <div className="relative rounded-2xl overflow-hidden bg-muted aspect-[4/3] md:aspect-[21/7] shadow-xl group">
          <img src={heroImg} alt="Grand Furniture Sale" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent flex flex-col justify-center px-6 md:px-16">
            <div className="inline-block bg-primary text-primary-foreground font-bold tracking-widest text-[10px] md:text-xs uppercase mb-4 px-3 py-1.5 rounded-sm w-max shadow-sm">
              Season Finale Sale
            </div>
            <h1 className="text-white text-4xl md:text-5xl lg:text-6xl font-display leading-[1.1] max-w-2xl">
              Elevate Your Home.<br /> Up to 40% Off.
            </h1>
            <p className="text-white/80 mt-4 md:mt-5 text-sm md:text-lg max-w-md font-body font-light">
              Discover masterfully crafted wooden furniture designed for modern living. Limited stock available.
            </p>
            <div className="mt-8 md:mt-10">
              <Link to="/shop">
                <Button size="lg" className="bg-white text-black hover:bg-neutral-200 rounded-sm px-8 h-14 text-base font-semibold shadow-lg transition-all hover:pl-6 hover:pr-10 relative group/btn">
                  Shop The Collection 
                  <ChevronRight className="absolute right-4 h-5 w-5 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Subtle Trust Badges */}
      <section className="container mx-auto px-4 py-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-8">
          <div className="flex items-center gap-4 bg-muted/30 p-5 rounded-xl border border-border/50">
            <div className="h-12 w-12 rounded-full bg-background flex items-center justify-center shadow-sm shrink-0">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-bold text-sm">Secure Checkout</p>
              <p className="text-xs text-muted-foreground mt-0.5">100% encrypted payments</p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-muted/30 p-5 rounded-xl border border-border/50">
            <div className="h-12 w-12 rounded-full bg-background flex items-center justify-center shadow-sm shrink-0">
              <Truck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-bold text-sm">Free Delivery</p>
              <p className="text-xs text-muted-foreground mt-0.5">On all orders above ₹999</p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-muted/30 p-5 rounded-xl border border-border/50">
            <div className="h-12 w-12 rounded-full bg-background flex items-center justify-center shadow-sm shrink-0">
              <CreditCard className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-bold text-sm">No Cost EMI</p>
              <p className="text-xs text-muted-foreground mt-0.5">Up to 6 months on major cards</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Deals of the Day (Marketplace style) */}
      <section className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-6">
          <div className="flex items-center gap-4">
            <h2 className="font-display text-2xl md:text-3xl font-bold">Deals of the Day</h2>
            <div className="hidden md:flex items-center gap-1.5 bg-red-50 text-red-600 border border-red-200 px-3 py-1 rounded-sm text-xs font-bold tracking-wide">
              <Clock className="h-3.5 w-3.5" /> ENDS IN 12:34:56
            </div>
          </div>
          <Link to="/shop">
            <Button variant="outline" size="sm" className="rounded-sm font-semibold">View All Deals</Button>
          </Link>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {displayDeals.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* 5. Photographic Promo Banners (Replaced Icons with Real Images) */}
      <section className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          {/* Office Promo */}
          <Link to="/shop?room=Office" className="relative rounded-2xl overflow-hidden aspect-[16/9] md:aspect-[2/1] group block shadow-md">
            <img src="https://loremflickr.com/800/600/homeoffice,desk?lock=201" alt="Home Office" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 md:p-10">
              <h3 className="font-display text-2xl md:text-3xl text-white font-bold mb-2">The Modern Office</h3>
              <p className="text-white/80 text-sm md:text-base mb-4 max-w-[280px]">Premium ergonomic chairs & solid wood desks starting at ₹4,999.</p>
              <span className="text-primary font-semibold text-sm flex items-center group-hover:underline">Shop Workspace <ArrowRight className="h-4 w-4 ml-1" /></span>
            </div>
          </Link>
          
          {/* Bedroom Promo */}
          <Link to="/shop?room=Bedroom" className="relative rounded-2xl overflow-hidden aspect-[16/9] md:aspect-[2/1] group block shadow-md">
            <img src="https://loremflickr.com/800/600/bedroom,interior?lock=202" alt="Bedroom" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 md:p-10">
              <h3 className="font-display text-2xl md:text-3xl text-white font-bold mb-2">Cozy Sanctuaries</h3>
              <p className="text-white/80 text-sm md:text-base mb-4 max-w-[280px]">Refresh your bedroom with our new oak and walnut frames.</p>
              <span className="text-primary font-semibold text-sm flex items-center group-hover:underline">Shop Bedroom <ArrowRight className="h-4 w-4 ml-1" /></span>
            </div>
          </Link>
        </div>
      </section>

      {/* 6. Category Showcase: Seating */}
      <section className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-6">
          <h2 className="font-display text-2xl md:text-3xl font-bold">Trending in Seating</h2>
          <Link to="/shop?category=Seating" className="text-primary text-sm font-bold hover:underline flex items-center">
            View Collection <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {displaySeating.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </section>

      {/* 7. Category Showcase: Decor */}
      <section className="container mx-auto px-4 py-10 mb-12 bg-muted/20 rounded-3xl">
        <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-6">
          <h2 className="font-display text-2xl md:text-3xl font-bold">Lighting & Decor</h2>
          <Link to="/shop?category=Decor" className="text-primary text-sm font-bold hover:underline flex items-center">
            View Collection <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {displayDecor.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </section>

    </StorefrontLayout>
  );
};

export default Index;
