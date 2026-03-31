import { StorefrontLayout } from "@/components/storefront/StorefrontLayout";
import { ProductCard } from "@/components/storefront/ProductCard";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/useProducts";
import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import heroImg from "@/assets/hero-furniture.jpg";

const Index = () => {
  const { data: products, isLoading } = useProducts();
  const featured = (products ?? []).slice(0, 4);
  const bestsellers = (products ?? []).filter((p) => p.tags.includes("bestseller"));

  return (
    <StorefrontLayout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt="AlgoForge showroom" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/60 via-foreground/30 to-transparent" />
        </div>

        <div className="relative container mx-auto px-4 lg:px-8 py-32 lg:py-48">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.2, 0, 0, 1] }}
            className="max-w-xl"
          >
            <h1 className="font-display text-4xl lg:text-6xl text-background leading-tight">
              Heirlooms for the modern workspace.
            </h1>
            <p className="mt-4 text-background/80 text-lg font-body max-w-md">
              Handcrafted furniture in walnut, oak, and bouclé — designed to outlast trends.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/shop">
                <Button variant="hero" className="bg-background text-foreground hover:bg-background/90">
                  Shop Collection <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
              <Link to="/shop?room=Living+Room">
                <Button variant="heroOutline" className="border-background/50 text-background hover:bg-background/10">
                  Living Room
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured */}
      <section className="container mx-auto px-4 lg:px-8 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="font-display text-3xl lg:text-4xl">New Arrivals</h2>
            <p className="text-muted-foreground mt-1 font-body">Pieces that define spaces.</p>
          </div>
          <Link to="/shop" className="hidden md:block">
            <Button variant="ghost" className="text-muted-foreground">
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {featured.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* Banner */}
      <section className="container mx-auto px-4 lg:px-8">
        <div className="bg-primary rounded-[20px] p-10 lg:p-16 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="font-display text-3xl lg:text-4xl text-primary-foreground">
              For studios & architects
            </h2>
            <p className="text-primary-foreground/70 mt-2 max-w-md font-body">
              Request bulk pricing for projects. Trade accounts get dedicated support and volume discounts.
            </p>
          </div>
          <Link to="/auth">
            <Button variant="hero" className="bg-background text-foreground hover:bg-background/90">
              Open a Trade Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Bestsellers */}
      {bestsellers.length > 0 && (
        <section className="container mx-auto px-4 lg:px-8 py-20">
          <h2 className="font-display text-3xl lg:text-4xl mb-10">Bestsellers</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {bestsellers.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        </section>
      )}
    </StorefrontLayout>
  );
};

export default Index;
