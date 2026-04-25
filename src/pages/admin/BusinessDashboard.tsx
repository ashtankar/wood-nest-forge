import { AdminLayout } from "@/components/admin/AdminLayout";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  DollarSign, Package, ShoppingCart, Users, Briefcase, Tag,
  TrendingUp, ArrowRight, Loader2,
} from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useAllOrders } from "@/hooks/useOrders";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatPrice } from "@/lib/format";

const BusinessDashboard = () => {
  const { user } = useAuth();
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
  const { data: inquiries } = useQuery({
    queryKey: ["b2b-inquiries-count"],
    queryFn: async () => {
      const { data, error } = await supabase.from("b2b_inquiries").select("id,status");
      if (error) throw error;
      return data;
    },
  });

  const allOrders = orders ?? [];
  const revenue = allOrders.reduce((sum, o) => sum + Number(o.total), 0);
  const pending = allOrders.filter((o) => o.status === "processing").length;
  const lowStock = (products ?? []).filter((p) => p.stock > 0 && p.stock < 5).length;
  const outOfStock = (products ?? []).filter((p) => p.stock === 0).length;
  const newInquiries = (inquiries ?? []).filter((i) => i.status === "new").length;

  const stats = [
    { label: "Total Revenue", value: formatPrice(revenue), icon: DollarSign, hue: "bg-primary/10 text-primary" },
    { label: "Total Orders", value: String(allOrders.length), icon: ShoppingCart, hue: "bg-blue-50 text-blue-700" },
    { label: "Products", value: String((products ?? []).length), icon: Package, hue: "bg-amber-50 text-amber-700" },
    { label: "Customers", value: String((profiles ?? []).length), icon: Users, hue: "bg-emerald-50 text-emerald-700" },
  ];

  const quickLinks = [
    { label: "Manage Products", href: "/admin/products", icon: Package, desc: "Add, edit, or remove inventory" },
    { label: "View Orders", href: "/admin/orders", icon: ShoppingCart, desc: `${pending} pending orders` },
    { label: "Financials", href: "/admin/financials", icon: TrendingUp, desc: "Revenue & tax reports" },
    { label: "B2B Inquiries", href: "/admin/b2b", icon: Briefcase, desc: `${newInquiries} new inquiry${newInquiries === 1 ? "" : "ies"}` },
    { label: "Promo Codes", href: "/admin/promos", icon: Tag, desc: "Manage discount campaigns" },
    { label: "Customers", href: "/admin/customers", icon: Users, desc: "View customer list" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-body">Business Owner</span>
          <h1 className="font-display text-2xl lg:text-3xl">Welcome back{user?.email ? `, ${user.email.split("@")[0]}` : ""}</h1>
          <p className="text-muted-foreground font-body text-sm">Your business at a glance.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.35 }}
              className="p-5 rounded-[16px] bg-card card-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-body">{stat.label}</span>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${stat.hue}`}>
                  <stat.icon className="h-4 w-4" />
                </div>
              </div>
              <p className="font-display text-2xl tabular-nums">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Alerts */}
        {(lowStock > 0 || outOfStock > 0 || pending > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {outOfStock > 0 && (
              <div className="p-4 rounded-[12px] bg-destructive/10 border border-destructive/20">
                <p className="text-sm font-medium text-destructive">{outOfStock} product{outOfStock === 1 ? "" : "s"} out of stock</p>
                <Link to="/admin/products" className="text-xs text-destructive/80 hover:underline mt-1 inline-block">Restock now →</Link>
              </div>
            )}
            {lowStock > 0 && (
              <div className="p-4 rounded-[12px] bg-orange-50 border border-orange-200">
                <p className="text-sm font-medium text-orange-700">{lowStock} product{lowStock === 1 ? "" : "s"} running low</p>
                <Link to="/admin/products" className="text-xs text-orange-600 hover:underline mt-1 inline-block">Review inventory →</Link>
              </div>
            )}
            {pending > 0 && (
              <div className="p-4 rounded-[12px] bg-blue-50 border border-blue-200">
                <p className="text-sm font-medium text-blue-700">{pending} order{pending === 1 ? "" : "s"} awaiting processing</p>
                <Link to="/admin/orders" className="text-xs text-blue-600 hover:underline mt-1 inline-block">Process orders →</Link>
              </div>
            )}
          </div>
        )}

        {/* Quick links grid */}
        <div>
          <h2 className="font-display text-xl mb-4">Manage Your Business</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickLinks.map((link, i) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
              >
                <Link
                  to={link.href}
                  className="group block p-5 rounded-[16px] bg-card card-shadow hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <link.icon className="h-5 w-5 text-primary" />
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <p className="font-body font-medium">{link.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{link.desc}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent orders */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl">Recent Orders</h2>
            <Link to="/admin/orders" className="text-sm text-primary hover:underline">View all →</Link>
          </div>
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : allOrders.length === 0 ? (
            <div className="p-8 rounded-[16px] bg-card card-shadow text-center text-sm text-muted-foreground">
              No orders yet.
            </div>
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
                    {allOrders.slice(0, 8).map((order) => (
                      <tr key={order.id} className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="p-4 font-medium">{order.id.slice(0, 8)}</td>
                        <td className="p-4 text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</td>
                        <td className="p-4 text-right tabular-nums">{formatPrice(order.total)}</td>
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

export default BusinessDashboard;
