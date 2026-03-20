import { StorefrontLayout } from "@/components/storefront/StorefrontLayout";
import { ProductCard } from "@/components/storefront/ProductCard";
import { Button } from "@/components/ui/button";
import { products, reviews } from "@/data/products";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Star, View, ZoomIn, ChevronLeft, ChevronRight, MessageSquare, Phone, Heart, ShoppingBag, Play } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { isLoggedIn } from "@/lib/auth";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

const ProductDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const product = products.find((p) => p.id === id);
  const [currentImage, setCurrentImage] = useState(0);
  const [bulkPricingOpen, setBulkPricingOpen] = useState(false);
  const [qty, setQty] = useState(1);

  if (!product) {
    return (
      <StorefrontLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-display text-3xl">Product not found</h1>
          <Link to="/shop"><Button className="mt-4">Back to Shop</Button></Link>
        </div>
      </StorefrontLayout>
    );
  }

  const complementary = products.filter((p) => product.complementaryIds.includes(p.id));
  const similar = products.filter((p) => p.category === product.category && p.id !== product.id);

  return (
    <StorefrontLayout>
      <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-foreground transition-colors">Shop</Link>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Media Gallery */}
          <div className="space-y-3">
            <div className="relative aspect-square overflow-hidden rounded-[16px] card-shadow bg-card">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImage}
                  src={product.images[currentImage]}
                  alt={product.name}
                  className="w-full h-full object-cover rounded-[12px] m-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </AnimatePresence>

              {/* Controls */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <button className="h-10 w-10 rounded-full bg-background/90 backdrop-blur-md elevated-shadow flex items-center justify-center hover:bg-background transition-colors">
                  <ZoomIn className="h-4 w-4" />
                </button>
                <button className="h-10 w-10 rounded-full bg-background/90 backdrop-blur-md elevated-shadow flex items-center justify-center hover:bg-background transition-colors">
                  <Play className="h-4 w-4" />
                </button>
              </div>

              {/* AR Button */}
              <button
                className="absolute bottom-4 left-4 h-10 px-4 rounded-full bg-background/90 backdrop-blur-md elevated-shadow flex items-center gap-2 text-sm font-medium hover:bg-background transition-colors"
                onClick={() => toast.info("AR experience would launch here")}
              >
                <View className="h-4 w-4" />
                View in your room (AR)
              </button>

              {/* Nav arrows */}
              {product.images.length > 1 && (
                <>
                  <button onClick={() => setCurrentImage(Math.max(0, currentImage - 1))} className="absolute left-4 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 flex items-center justify-center">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button onClick={() => setCurrentImage(Math.min(product.images.length - 1, currentImage + 1))} className="absolute right-4 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 flex items-center justify-center">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            <div className="flex gap-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentImage(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                    currentImage === i ? "border-primary" : "border-transparent"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="lg:sticky lg:top-24 lg:self-start space-y-6">
            <div>
              <p className="text-sm text-muted-foreground font-body uppercase tracking-wider">{product.category} · {product.room}</p>
              <h1 className="font-display text-3xl lg:text-4xl mt-1">{product.name}</h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mt-3">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < Math.floor(product.rating) ? "fill-accent text-accent" : "text-muted"}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">{product.rating} ({product.reviewCount} reviews)</span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="font-display text-3xl tabular-nums">€{product.price.toLocaleString()}</span>
              {product.originalPrice && (
                <span className="text-lg text-muted-foreground line-through tabular-nums">€{product.originalPrice.toLocaleString()}</span>
              )}
            </div>

            <p className="text-foreground/80 font-body leading-relaxed">{product.description}</p>

            {/* Specs */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-card card-shadow">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Dimensions</p>
                <p className="text-sm font-medium mt-1">{product.dimensions}</p>
              </div>
              <div className="p-3 rounded-lg bg-card card-shadow">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Weight</p>
                <p className="text-sm font-medium mt-1">{product.weight}</p>
              </div>
              <div className="p-3 rounded-lg bg-card card-shadow">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Material</p>
                <p className="text-sm font-medium mt-1">{product.material}</p>
              </div>
              <div className="p-3 rounded-lg bg-card card-shadow">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Stock</p>
                <p className="text-sm font-medium mt-1">
                  {product.stock === 0 ? "Out of stock" : product.stock < 5 ? `Only ${product.stock} left` : `${product.stock} available`}
                </p>
              </div>
            </div>

            {/* Quantity & Add to cart */}
            <div className="flex items-center gap-3">
              <div className="flex items-center rounded-full border border-input">
                <button className="h-10 w-10 flex items-center justify-center text-muted-foreground hover:text-foreground" onClick={() => setQty(Math.max(1, qty - 1))}>-</button>
                <span className="w-8 text-center text-sm tabular-nums">{qty}</span>
                <button className="h-10 w-10 flex items-center justify-center text-muted-foreground hover:text-foreground" onClick={() => setQty(qty + 1)}>+</button>
              </div>
              <Button
                variant="hero"
                className="flex-1"
                disabled={product.stock === 0}
                onClick={() => {
                  if (!isLoggedIn()) {
                    toast.error("Please log in to add items to cart");
                    navigate("/auth");
                    return;
                  }
                  toast.success(`${qty}x ${product.name} added to cart`);
                }}
                <ShoppingBag className="h-4 w-4 mr-2" />
                {product.stock === 0 ? "Sold Out" : "Add to Cart"}
              </Button>
              <Button variant="outline" size="icon" className="h-12 w-12" onClick={() => toast.success("Added to wishlist")}>
                <Heart className="h-5 w-5" />
              </Button>
            </div>

            {/* B2B & Support */}
            <div className="flex flex-col gap-2">
              <Button variant="outline" className="w-full justify-start" onClick={() => setBulkPricingOpen(true)}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Request Bulk Pricing
              </Button>
              <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={() => toast.info("WhatsApp support would open here")}>
                <Phone className="h-4 w-4 mr-2" />
                WhatsApp Support
              </Button>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <section className="mt-20">
          <h2 className="font-display text-2xl mb-6">Customer Reviews</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((review, i) => (
              <div key={i} className="p-5 rounded-[16px] bg-card card-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className={`h-3.5 w-3.5 ${j < review.rating ? "fill-accent text-accent" : "text-muted"}`} />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">{review.date}</span>
                </div>
                <p className="text-sm text-foreground/80 font-body leading-relaxed">{review.text}</p>
                <p className="text-xs font-medium mt-2 text-muted-foreground">— {review.author}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Complementary Products */}
        {complementary.length > 0 && (
          <section className="mt-20">
            <h2 className="font-display text-2xl mb-6">Complementary Products</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {complementary.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* Similar Items */}
        {similar.length > 0 && (
          <section className="mt-16">
            <h2 className="font-display text-2xl mb-6">Similar Items</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {similar.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Bulk Pricing Sheet */}
      <Sheet open={bulkPricingOpen} onOpenChange={setBulkPricingOpen}>
        <SheetContent className="w-full sm:max-w-md bg-background">
          <SheetHeader>
            <SheetTitle className="font-display text-xl">Bulk Pricing Inquiry</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div className="p-4 rounded-lg bg-card card-shadow">
              <p className="text-sm text-muted-foreground">Product</p>
              <p className="font-medium">{product.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Quantity Needed</label>
              <Input type="number" placeholder="e.g., 25" className="mt-1 border-none input-shadow focus:input-shadow-focus" />
            </div>
            <div>
              <label className="text-sm font-medium">Message</label>
              <Textarea
                placeholder={`Hi, I'm looking for 20+ units of the ${product.name} for a studio project.`}
                className="mt-1 min-h-[100px] border-none input-shadow focus:input-shadow-focus"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Your Email</label>
              <Input type="email" placeholder="you@company.com" className="mt-1 border-none input-shadow focus:input-shadow-focus" />
            </div>
            <Button
              variant="hero"
              className="w-full"
              onClick={() => {
                toast.success("Inquiry sent. A manager will respond within 2 hours.");
                setBulkPricingOpen(false);
              }}
            >
              Send Inquiry
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </StorefrontLayout>
  );
};

export default ProductDetail;
