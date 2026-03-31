import { Link, useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DbProduct } from "@/hooks/useProducts";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";

interface ProductCardProps {
  product: DbProduct;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { addToWishlist } = useWishlist();

  const stockTag =
    product.stock === 0
      ? { label: "Out of Stock", className: "bg-destructive/10 text-destructive" }
      : product.stock < 5
      ? { label: "Low Stock", className: "bg-orange-50 text-orange-700" }
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: [0.2, 0, 0, 1] }}
      className="group"
    >
      <Link to={`/product/${product.slug}`} className="block">
        <div className="relative overflow-hidden rounded-[16px] card-shadow bg-card">
          <div className="aspect-square overflow-hidden rounded-[12px] m-1.5">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          </div>

          {/* Hover overlay */}
          <div className="absolute inset-x-1.5 bottom-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            <Button
              variant="default"
              className="w-full bg-foreground/90 backdrop-blur-md text-background hover:bg-foreground rounded-[12px]"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!user) {
                  toast.error("Please log in to add items to cart");
                  navigate("/auth");
                  return;
                }
                addToCart.mutate({ productId: product.id }, {
                  onSuccess: () => toast.success(`${product.name} added to cart`),
                  onError: () => toast.error("Failed to add to cart"),
                });
              }}
              disabled={product.stock === 0}
            >
              {product.stock === 0 ? "Sold Out" : "Quick Add to Cart"}
            </Button>
          </div>

          {/* Wishlist */}
          <button
            className="absolute top-4 right-4 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!user) {
                toast.error("Please log in to add items to wishlist");
                navigate("/auth");
                return;
              }
              addToWishlist.mutate(product.id, {
                onSuccess: () => toast.success("Added to wishlist"),
                onError: () => toast.error("Failed to add to wishlist"),
              });
            }}
          >
            <Heart className="h-4 w-4 text-foreground" />
          </button>

          {/* Tags */}
          <div className="absolute top-4 left-4 flex flex-col gap-1">
            {product.original_price && (
              <span className="text-xs px-2 py-1 rounded-full bg-accent text-accent-foreground font-medium">
                Sale
              </span>
            )}
            {stockTag && (
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${stockTag.className}`}>
                {stockTag.label}
              </span>
            )}
          </div>
        </div>
      </Link>

      <div className="mt-3 px-1">
        <Link to={`/product/${product.slug}`}>
          <h3 className="font-body font-medium text-sm text-foreground">{product.name}</h3>
        </Link>
        <p className="text-xs text-muted-foreground mt-0.5">{product.material} · {product.category}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="font-body font-semibold text-sm tabular-nums">
            €{Number(product.price).toLocaleString()}
          </span>
          {product.original_price && (
            <span className="text-xs text-muted-foreground line-through tabular-nums">
              €{Number(product.original_price).toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
