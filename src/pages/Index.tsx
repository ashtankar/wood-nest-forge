import { StorefrontLayout } from "@/components/storefront/StorefrontLayout";
import { ProductCard } from "@/components/storefront/ProductCard";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/useProducts";
import { 
  ArrowRight, Loader2, Sofa, BedDouble, Utensils, 
  Briefcase, Lamp, TreePalm, ShieldCheck, Truck, 
  CreditCard, Clock, ChevronRight 
} from "lucide-react";
import { Link } from "react-router-dom";
import heroImg from "@/assets/hero-furniture.jpg";

// Flipkart-style top category quick links
const CATEGORIES = [
  { name: "Living Room", icon: Sofa, path: "/shop?room=Living+Room" },
  { name: "Bedroom", icon: BedDouble, path: "/shop?room=Bedroom" },
  { name: "Dining", icon: Utensils, path: "/shop?room=Dining+Room" },
  { name: "Office", icon: Briefcase, path: "/shop?room=Office" },
  { name: "Decor", icon: Lamp, path: "/shop?category=Decor" },
  { name: "Outdoor", icon: TreePalm, path: "/shop?room=Outdoor" },
];

const Index = () => {
  const { data: products, isLoading } = useProducts();

  // Slice data for different marketplace sections
  const allProducts = products ?? [];
  
  // Find products that are discounted for the "Deals" section
  const deals = allProducts.filter(p => p.original_price && p.original_price > p.price).slice(0, 4);
  const seating = allProducts.filter(p => p.category === 'Seating').slice(0, 4);
  const decor = allProducts.filter(p => p.category === 'Lighting' || p.category === 'Decor').slice(0, 4);

  // Fallbacks just in case the database doesn't have enough specific filtered items yet
  const displayDeals = deals.length >= 4 ? deals : allProducts.slice(0, 4);
  const displaySeating = seating.length >= 4 ? seating : allProducts.slice(4, 8);
  const displayDecor = decor.length >= 4 ? decor : allProducts.slice(8, 12);

  return (
    <StorefrontLayout>
      {/* 1. Top Categories Bar (Classic E-commerce Pattern) */}
      <div className="bg-background border-b border-border/50 hidden md:block">
        <div className="container mx-auto px-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center justify-between lg:justify-center gap-8 lg:gap-16 py-4 min-w-max">
            {CATEGORIES.map((cat) => (
              <Link key={cat.name} to={cat.path} className="flex flex-col items-center gap-2 group">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors card-shadow">
                  <cat.icon className="h-7 w-7" />
                </div>
                <span className="text-xs font-semibold text-foreground/80 group-hover:text-primary">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Promotional Hero Banner */}
      <section className="container mx-auto px-4 py-4 md:py-6">
        <div className="relative rounded-[16px] overflow-hidden bg-muted aspect-[4/3] md:aspect-[21/7] card-shadow">
          <img src={heroImg} alt="Sale" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent flex flex-col justify-center px-6 md:px-16">
            <span className="text-primary font-bold tracking-widest text-xs md:text-sm uppercase mb-2 bg-primary/20 w-max px-3 py-1 rounded-full border border-primary/30">
              Grand Furniture Sale
            </span>
            <h1 className="text-white text-3xl md:text-5xl lg:text-6xl font-display leading-tight max-w-xl mt-2">
              Upgrade Your Space.<br className="hidden md:block" /> Up to 40% Off.
            </h1>
            <p className="text-white/80 mt-3 md:mt-4 text-sm md:text-base max-w-md font-body">
              Premium handcrafted wood furniture, now at unbeatable prices. Limited time only.
            </p>
            <div className="mt-6 md:mt-8">
              <Link to="/shop">
                <Button className="bg-white text-black hover:bg-white/90 rounded-[8px] px-6 md:px-8 py-5 md:py-6 text-sm md:text-base font-bold shadow-xl">
                  Shop The Sale <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Trust Badges (Marketplace Standard) */}
      <section className="container mx-auto px-4 py-4 md:py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-border/50 rounded-[12px] bg-card card-shadow overflow-hidden divide-y md:divide-y-0 md:divide-x divide-border/50">
          <div className="flex items-center gap-4 justify-center p-4 md:p-6 hover:bg-muted/30 transition-colors">
            <ShieldCheck className="h-10 w-10 text-primary" />
            <div>
              <p className="font-bold text-sm md:text-base">100% Secure</p>
              <p className="text-xs md:text-sm text-muted-foreground">Safe & encrypted payments</p>
            </div>
          </div>
          <div className="flex items-center gap-4 justify-center p-4 md:p-6 hover:bg-muted/30 transition-colors">
            <Truck className="h-10 w-10 text-primary" />
            <div>
              <p className="font-bold text-sm md:text-base">Free Delivery</p>
              <p className="text-xs md:text-sm text-muted-foreground">On all orders above ₹999</p>
            </div>
          </div>
          <div className="flex items-center gap-4 justify-center p-4 md:p-6 hover:bg-muted/30 transition-colors">
            <CreditCard className="h-10 w-10 text-primary" />
            <div>
              <p className="font-bold text-sm md:text-base">No Cost EMI</p>
              <p className="text-xs md:text-sm text-muted-foreground">Up to 6 months on major cards</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Top Offers / Deals of the Day */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between bg-primary/5 p-4 md:p-6 rounded-t-[16px] border-x border-t border-primary/10">
          <div className="flex items-center gap-4">
            <h2 className="font-display text-xl md:text-3xl font-bold">Deals of the Day</h2>
            <div className="hidden md:flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm animate-pulse">
              <Clock className="h-3.5 w-3.5" /> 12 : 34 : 56 Left
            </div>
          </div>
          <Link to="/shop">
            <Button variant="default" size="sm" className="rounded-full px-6 font-semibold">View All Offers</Button>
          </Link>
        </div>
        
        <div className="bg-card border-x border-b border-border/50 rounded-b-[16px] p-4 lg:p-6 card-shadow">
          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {displayDeals.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 5. Promotional Banners Row */}
      <section className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          <div className="bg-blue-50 rounded-[16px] p-8 md:p-12 flex flex-col justify-center border border-blue-100 card-shadow relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="font-display text-3xl text-blue-900 mb-2 font-bold">Work from Home</h3>
              <p className="text-blue-700 mb-6 text-sm md:text-base max-w-[250px]">Premium ergonomic chairs & desks starting at ₹4,999</p>
              <Link to="/shop?room=Office">
                <Button size="lg" className="w-max bg-blue-600 hover:bg-blue-700 font-bold shadow-lg">Explore Office</Button>
              </Link>
            </div>
            <Briefcase className="absolute -bottom-10 -right-10 h-64 w-64 text-blue-500/10 rotate-12" />
          </div>
          
          <div className="bg-amber-50 rounded-[16px] p-8 md:p-12 flex flex-col justify-center border border-amber-100 card-shadow relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="font-display text-3xl text-amber-900 mb-2 font-bold">Cozy Bedrooms</h3>
              <p className="text-amber-700 mb-6 text-sm md:text-base max-w-[250px]">Solid wood beds, nightstands & more at flat 20% off</p>
              <Link to="/shop?room=Bedroom">
                <Button size="lg" className="w-max bg-amber-600 hover:bg-amber-700 font-bold shadow-lg">Explore Bedroom</Button>
              </Link>
            </div>
            <BedDouble className="absolute -bottom-10 -right-10 h-64 w-64 text-amber-500/10 -rotate-12" />
          </div>
        </div>
      </section>

      {/* 6. Category Showcase: Seating */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl md:text-3xl font-bold">Trending in Seating</h2>
          <Link to="/shop?category=Seating" className="text-primary text-sm font-bold hover:underline flex items-center">
            See All <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {displaySeating.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </section>

      {/* 7. Category Showcase: Decor */}
      <section className="container mx-auto px-4 py-8 mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl md:text-3xl font-bold">Lighting & Decor</h2>
          <Link to="/shop?category=Decor" className="text-primary text-sm font-bold hover:underline flex items-center">
            See All <ArrowRight className="h-4 w-4 ml-1" />
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
