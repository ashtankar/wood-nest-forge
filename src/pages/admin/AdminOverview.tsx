import { AdminLayout } from "@/components/admin/AdminLayout";
import { DollarSign, Package, ShoppingCart, Users, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useProducts } from "@/hooks/useProducts";
import { useAllOrders } from "@/hooks/useOrders";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const AdminOverview = () => {
  // We rely securely on Supabase RLS now instead of frontend role blocking
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: orders, isLoading: ordersLoading } = useAllOrders();
  
  const { data: profiles, isLoading: profilesLoading } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("id");
      if (error) throw error;
      return data;
    }
  });

  const allOrders = orders ?? [];
  const allProducts = products ?? [];
  const allProfiles = profiles ?? [];

  // Calculate Lifetime Revenue instead of just Month-To-Date
  const totalRevenue = allOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);

  const stats = [
    { label: "Lifetime Revenue", value: `₹${totalRevenue.toLocaleString()}`, icon: DollarSign },
    { label: "Total Orders", value: String(allOrders.length), icon: ShoppingCart },
    { label: "Total Products", value: String(allProducts.length), icon: Package },
    { label: "Registered Customers", value: String(allProfiles.length), icon: Users },
  ];

  const isLoading = ordersLoading || profilesLoading || productsLoading;

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl">Dashboard</h1>
          <p className="text-muted-foreground font-body text-sm mt-1">Welcome back. Here's what's happening across your business.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, duration: 0.35 }} className="p-5 rounded-[16px] bg-card card-shadow border border-border/50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-body font-semibold">{stat.label}</span>
                <div className="p-2 bg-primary/5 rounded-full">
                  <stat.icon className="h-4 w-4 text-primary" />
                </div>
              </div>
              <p className="font-display text-2xl tabular-nums">{isLoading ? "-" : stat.value}</p>
            </motion.div>
          ))}
        </div>

        <div>
          <h2 className="font-display text-xl mb-4">Recent Orders</h2>
          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : allOrders.length === 0 ? (
            <div className="rounded-[16px] bg-card card-shadow border border-border/50 py-12 text-center text-muted-foreground">
              No orders found in the database.
            </div>
          ) : (
            <div className="rounded-[16px] bg-card card-shadow border border-border/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50 bg-muted/20">
                      <th className="text-left font-medium text-muted-foreground p-4 text-xs uppercase tracking-wider">Order ID</th>
                      <th className="text-left font-medium text-muted-foreground p-4 text-xs uppercase tracking-wider">Date</th>
                      <th className="text-right font-medium text-muted-foreground p-4 text-xs uppercase tracking-wider">Total</th>
                      <th className="text-right font-medium text-muted-foreground p-4 text-xs uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Sort by newest first, take top 10 */}
                    {allOrders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10).map((order) => (
                      <tr key={order.id} className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="p-4 font-medium font-mono text-xs">{order.id.slice(0, 8)}</td>
                        <td className="p-4 text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</td>
                        <td className="p-4 text-right tabular-nums font-medium">₹{Number(order.total).toLocaleString()}</td>
                        <td className="p-4 text-right">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold tracking-wide ${
                            order.status === "delivered" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                            order.status === "shipped" ? "bg-blue-50 text-blue-700 border border-blue-200" :
                            order.status === "processing" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                            "bg-red-50 text-red-700 border border-red-200"
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
