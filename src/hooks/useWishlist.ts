import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { DbProduct } from "./useProducts";

export interface WishlistItemWithProduct {
  id: string;
  product_id: string;
  product: DbProduct;
}

export function useWishlist() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const wishlistQuery = useQuery({
    queryKey: ["wishlist", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data: items, error } = await supabase
        .from("wishlist_items")
        .select("*")
        .eq("user_id", user.id);
      if (error) throw error;
      if (!items?.length) return [];

      const productIds = items.map((i) => i.product_id);
      const { data: products, error: pErr } = await supabase
        .from("products")
        .select("*")
        .in("id", productIds);
      if (pErr) throw pErr;

      const productMap = new Map((products ?? []).map((p) => [p.id, p]));
      return items
        .map((i) => ({
          id: i.id,
          product_id: i.product_id,
          product: productMap.get(i.product_id)!,
        }))
        .filter((i) => i.product) as WishlistItemWithProduct[];
    },
    enabled: !!user,
  });

  const addToWishlist = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error("Not logged in");
      const { data: existing } = await supabase
        .from("wishlist_items")
        .select("id")
        .eq("user_id", user.id)
        .eq("product_id", productId)
        .maybeSingle();
      if (existing) return; // Already in wishlist
      const { error } = await supabase
        .from("wishlist_items")
        .insert({ user_id: user.id, product_id: productId });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["wishlist"] }),
  });

  const removeFromWishlist = useMutation({
    mutationFn: async (wishlistItemId: string) => {
      const { error } = await supabase.from("wishlist_items").delete().eq("id", wishlistItemId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["wishlist"] }),
  });

  return {
    items: wishlistQuery.data ?? [],
    isLoading: wishlistQuery.isLoading,
    addToWishlist,
    removeFromWishlist,
  };
}
