import { AdminLayout } from "@/components/admin/AdminLayout";
import { ArrowUp, ArrowDown, DollarSign, Package, ShoppingCart, Users, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useProducts } from "@/hooks/useProducts";
import { useAllOrders } from "@/hooks/useOrders";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const AdminOverview = () => {
  const { data: products } = useProducts();
  const { data: orders, isLoading } = useAllOrders();
  const { data: profiles } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("id");
      if (error) throw error;
      return data;
    },
  });

  const revenue = (orders ?? []).reduce((sum, o) => sum + Number(o.total), 0);

  const stats = [
    { label: "Revenue (MTD)", value: `€${revenue.toLocaleString()}`, icon: DollarSign },
    { label: "Orders", value: String((orders ?? []).length), icon: ShoppingCart },
    { label: "Products", value: String((products ?? []).length), icon: Package },
    { label: "Customers", value: String((profiles ?? []).length), icon: Users },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl">Dashboard</h1>
          <p className="text-muted-foreground font-body text-sm mt-1">Welcome back. Here's what's happening.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, duration: 0.35 }} className="p-5 rounded-[16px] bg-card card-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-body">{stat.label}</span>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="font-display text-2xl tabular-nums">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        <div>
          <h2 className="font-display text-xl mb-4">Recent Orders</h2>
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : (
            <div className="rounded-[16px] bg-card card-shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left font-medium text-muted-foreground p-4 text-xs uppercase tracking-wider">Order</th>
                      <th className="text-left font-medium text-muted-foreground p-4 text-xs uppercase tracking-wider">Date</th>
                      <th className="text-right font-medium text-muted-foreground p-4 text-xs uppercase tracking-wider">Total</th>
                      <th className="text-right font-medium text-muted-foreground p-4 text-xs uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(orders ?? []).slice(0, 10).map((order) => (
                      <tr key={order.id} className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="p-4 font-medium">{order.id.slice(0, 8)}</td>
                        <td className="p-4 text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</td>
                        <td className="p-4 text-right tabular-nums">€{Number(order.total).toLocaleString()}</td>
                        <td className="p-4 text-right">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            order.status === "delivered" ? "bg-primary/10 text-primary" :
                            order.status === "shipped" ? "bg-blue-50 text-blue-700" :
                            order.status === "processing" ? "bg-orange-50 text-orange-700" :
                            "bg-destructive/10 text-destructive"
                          }`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOverview;
