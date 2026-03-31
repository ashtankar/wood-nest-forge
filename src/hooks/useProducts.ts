import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type DbProduct = Tables<"products">;

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as DbProduct[];
    },
  });
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as DbProduct;
    },
    enabled: !!id,
  });
}

export function useProductBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ["product-slug", slug],
    queryFn: async () => {
      if (!slug) return null;
      // Try slug first, then id
      let { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (!data) {
        ({ data, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", slug)
          .maybeSingle());
      }
      if (error) throw error;
      return data as DbProduct | null;
    },
    enabled: !!slug,
  });
}

export function useComplementaryProducts(productId: string | undefined) {
  return useQuery({
    queryKey: ["complementary", productId],
    queryFn: async () => {
      if (!productId) return [];
      const { data, error } = await supabase
        .from("complementary_products")
        .select("complementary_product_id")
        .eq("product_id", productId);
      if (error) throw error;
      if (!data?.length) return [];
      const ids = data.map((d) => d.complementary_product_id);
      const { data: products, error: pError } = await supabase
        .from("products")
        .select("*")
        .in("id", ids);
      if (pError) throw pError;
      return products as DbProduct[];
    },
    enabled: !!productId,
  });
}

export function useReviews(productId: string | undefined) {
  return useQuery({
    queryKey: ["reviews", productId],
    queryFn: async () => {
      if (!productId) return [];
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("product_id", productId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!productId,
  });
}
