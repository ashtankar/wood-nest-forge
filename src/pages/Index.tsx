import { StorefrontLayout } from "@/components/storefront/StorefrontLayout";
import { ProductCard } from "@/components/storefront/ProductCard";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/useProducts";
import { ArrowRight, Loader2, ShieldCheck, Truck, CreditCard, Clock, ChevronRight, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import heroImg from "@/assets/hero-furniture.jpg";

const CATEGORIES = [
  { name: "Living Room", image: "https://loremflickr.com/200/200/teak,sofa?lock=101", path: "/shop?room=Living+Room" },
  { name: "Bedroom", image: "https://loremflickr.com/200/200/sheesham,bed?lock=102", path: "/shop?room=Bedroom" },
  { name: "Dining", image: "https://loremflickr.com/200/200/wood,diningtable?lock=103", path: "/shop?room=Dining+Room" },
  { name: "Office", image: "https://loremflickr.com/200/200/study,desk,wood?lock=104", path: "/shop?room=Office" },
  { name: "Decor", image: "https://loremflickr.com/200/200/ethnic,decor,india?lock=105", path: "/shop?category=Decor" },
  { name: "Outdoor", image: "https://loremflickr.com/200/200/cane,furniture?lock=106", path: "/shop?room=Outdoor" },
];

const Index = () => {
  const { data: products, isLoading } = useProducts();
  
  // Catalogue State
  const [catalogueOpen, setCatalogueOpen] = useState(false);
  const [catEmail, setCatEmail] = useState("");
  const [catRoom, setCatRoom] = useState("");

  const allProducts = products ?? [];
  const deals = allProducts.filter(p => p.original_price && p.original_price > p.price).slice(0, 4);
  const seating = allProducts.filter(p => p.category === 'Seating').slice(0, 4);
  const decor = allProducts.filter(p => p.category === 'Lighting' || p.category === 'Decor').slice(0, 4);

  const displayDeals = deals.length >= 4 ? deals : allProducts.slice(0, 4);
  const displaySeating = seating.length >= 4 ? seating : allProducts.slice(4, 8);
  const displayDecor = decor.length >= 4 ? decor : allProducts.slice(8, 12);

  const handleDownloadCatalogue = () => {
    if (!catEmail) return toast.error("Please enter your email address.");
    if (!catRoom) return toast.error("Please select a category.");
    
    toast.success("Preparing your Lookbook...");
    // Simulate generation delay
    setTimeout(() => {
      toast.success("Catalogue downloaded successfully!");
      setCatalogueOpen(false);
      setCatEmail("");
      setCatRoom("");
    }, 1500);
  };

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
          <img src={heroImg} alt="Festive Furniture Sale" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent flex flex-col justify-center px-6 md:px-16">
            <div className="inline-block bg-primary text-primary-foreground font-bold tracking-widest text-[10px] md:text-xs uppercase mb-4 px-3 py-1.5 rounded-sm w-max shadow-sm">
              The Grand Festive Sale
            </div>
            <h1 className="text-white text-4xl md:text-5xl lg:text-6xl font-display leading-[1.1] max-w-2xl">
              Handcrafted Heritage.<br /> Up to 40% Off.
            </h1>
            <p className="text-white/80 mt-4 md:mt-5 text-sm md:text-lg max-w-md font-body font-light">
              Discover masterfully crafted Sheesham and Teak wood furniture, celebrating Indian artistry for your modern home.
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
              <p className="text-xs text-muted-foreground mt-0.5">100% encrypted payments via UPI & Cards</p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-muted/30 p-5 rounded-xl border border-border/50">
            <div className="h-12 w-12 rounded-full bg-background flex items-center justify-center shadow-sm shrink-0">
              <Truck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-bold text-sm">Pan-India Delivery</p>
              <p className="text-xs text-muted-foreground mt-0.5">Free shipping on all orders above ₹999</p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-muted/30 p-5 rounded-xl border border-border/50">
            <div className="h-12 w-12 rounded-full bg-background flex items-center justify-center shadow-sm shrink-0">
              <CreditCard className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-bold text-sm">No Cost EMI</p>
              <p className="text-xs text-muted-foreground mt-0.5">Up to 6 months on major Credit Cards</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Deals of the Day */}
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

      {/* 5. Photographic Promo Banners */}
      <section className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          <Link to="/shop?room=Office" className="relative rounded-2xl overflow-hidden aspect-[16/9] md:aspect-[2/1] group block shadow-md">
            <img src="https://loremflickr.com/800/600/teak,desk?lock=201" alt="Home Office" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 md:p-10">
              <h3 className="font-display text-2xl md:text-3xl text-white font-bold mb-2">The Modern Workspace</h3>
              <p className="text-white/80 text-sm md:text-base mb-4 max-w-[280px]">Solid Sheesham wood writing desks and ergonomic seating starting at ₹4,999.</p>
              <span className="text-primary font-semibold text-sm flex items-center group-hover:underline">Shop Study <ArrowRight className="h-4 w-4 ml-1" /></span>
            </div>
          </Link>
          
          <Link to="/shop?room=Bedroom" className="relative rounded-2xl overflow-hidden aspect-[16/9] md:aspect-[2/1] group block shadow-md">
            <img src="https://loremflickr.com/800/600/indian,bedroom,decor?lock=202" alt="Bedroom" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 md:p-10">
              <h3 className="font-display text-2xl md:text-3xl text-white font-bold mb-2">Ethnic Sanctuaries</h3>
              <p className="text-white/80 text-sm md:text-base mb-4 max-w-[280px]">Refresh your bedroom with beautifully carved wooden frames and warm tones.</p>
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
      <section className="container mx-auto px-4 py-10 mb-6 bg-muted/20 rounded-3xl">
        <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-6">
          <h2 className="font-display text-2xl md:text-3xl font-bold">Handcrafted Decor & Lighting</h2>
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

      {/* 8. Catalogue Download Section */}
      <section className="container mx-auto px-4 py-8 mb-16">
        <div className="bg-primary text-primary-foreground rounded-3xl p-10 md:p-16 flex flex-col items-center text-center relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl">
            <BookOpen className="h-12 w-12 mx-auto mb-6 opacity-80" />
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">The 2026 Lookbook</h2>
            <p className="text-primary-foreground/80 text-base md:text-lg mb-8 font-body">
              Explore our complete collection of Indic-inspired, handcrafted furniture. Curate your perfect space with our latest designs and exclusive trade pieces.
            </p>
            
            <Dialog open={catalogueOpen} onOpenChange={setCatalogueOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary" size="lg" className="rounded-sm px-8 h-14 font-bold shadow-xl text-base">
                  Download Digital Catalogue
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-background text-foreground border-border/50">
                <DialogHeader>
                  <DialogTitle className="font-display text-2xl">Get Your Lookbook</DialogTitle>
                </DialogHeader>
                <div className="space-y-5 pt-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email Address</label>
                    <Input 
                      placeholder="Enter your email" 
                      type="email" 
                      value={catEmail} 
                      onChange={(e) => setCatEmail(e.target.value)} 
                      className="border-border/50 input-shadow"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Which room are you furnishing?</label>
                    <Select value={catRoom} onValueChange={setCatRoom}>
                      <SelectTrigger className="border-border/50 input-shadow">
                        <SelectValue placeholder="Select your primary interest" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Complete Collection</SelectItem>
                        <SelectItem value="living">Living Room</SelectItem>
                        <SelectItem value="bedroom">Bedroom</SelectItem>
                        <SelectItem value="dining">Dining & Kitchen</SelectItem>
                        <SelectItem value="office">Workspace</SelectItem>
                        <SelectItem value="outdoor">Outdoor & Patio</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full mt-2" onClick={handleDownloadCatalogue}>
                    Generate & Download PDF
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          {/* Subtle background decoration */}
          <div className="absolute -top-24 -right-24 h-64 w-64 bg-white opacity-5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 h-64 w-64 bg-white opacity-5 rounded-full blur-3xl"></div>
        </div>
      </section>

    </StorefrontLayout>
  );
};

export default Index;
