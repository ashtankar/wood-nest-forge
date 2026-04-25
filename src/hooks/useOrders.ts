import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useOrders() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["orders", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data: orders, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;

      // Fetch order items for each order
      const orderIds = orders.map((o) => o.id);
      if (!orderIds.length) return [];

      const { data: items, error: iErr } = await supabase
        .from("order_items")
        .select("*")
        .in("order_id", orderIds);
      if (iErr) throw iErr;

      return orders.map((order) => ({
        ...order,
        items: (items ?? []).filter((i) => i.order_id === order.id),
      }));
    },
    enabled: !!user,
  });
}

export function useAllOrders() {
  const { role } = useAuth();

  return useQuery({
    queryKey: ["all-orders"],
    queryFn: async () => {
      const { data: orders, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;

      const orderIds = orders.map((o) => o.id);
      if (!orderIds.length) return [];

      const userIds = Array.from(new Set(orders.map((o) => o.user_id)));

      const [itemsRes, profilesRes] = await Promise.all([
        supabase.from("order_items").select("*").in("order_id", orderIds),
        supabase.from("profiles").select("id, full_name").in("id", userIds),
      ]);
      if (itemsRes.error) throw itemsRes.error;
      if (profilesRes.error) throw profilesRes.error;

      const profileMap = new Map((profilesRes.data ?? []).map((p) => [p.id, p]));

      return orders.map((order) => ({
        ...order,
        items: (itemsRes.data ?? []).filter((i) => i.order_id === order.id),
        customer: profileMap.get(order.user_id) ?? null,
      }));
    },
    enabled: role === "admin",
  });
}
