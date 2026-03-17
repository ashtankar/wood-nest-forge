import { AdminLayout } from "@/components/admin/AdminLayout";
import { orders, products } from "@/data/products";
import { ArrowUp, ArrowDown, DollarSign, Package, ShoppingCart, Users } from "lucide-react";
import { motion } from "framer-motion";

const stats = [
  { label: "Revenue (MTD)", value: "€27,030", change: "+12.3%", up: true, icon: DollarSign },
  { label: "Orders", value: "23", change: "+8.1%", up: true, icon: ShoppingCart },
  { label: "Products", value: String(products.length), change: "0%", up: true, icon: Package },
  { label: "Customers", value: "156", change: "+5.4%", up: true, icon: Users },
];

const AdminOverview = () => {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl">Dashboard</h1>
          <p className="text-muted-foreground font-body text-sm mt-1">Welcome back. Here's what's happening.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.35, ease: [0.2, 0, 0, 1] }}
              className="p-5 rounded-[16px] bg-card card-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-body">{stat.label}</span>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="font-display text-2xl tabular-nums">{stat.value}</p>
              <div className="flex items-center gap-1 mt-1">
                {stat.up ? <ArrowUp className="h-3 w-3 text-primary" /> : <ArrowDown className="h-3 w-3 text-destructive" />}
                <span className={`text-xs tabular-nums ${stat.up ? "text-primary" : "text-destructive"}`}>{stat.change}</span>
                <span className="text-xs text-muted-foreground">vs last month</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Recent orders */}
        <div>
          <h2 className="font-display text-xl mb-4">Recent Orders</h2>
          <div className="rounded-[16px] bg-card card-shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left font-medium text-muted-foreground p-4 text-xs uppercase tracking-wider">Order</th>
                    <th className="text-left font-medium text-muted-foreground p-4 text-xs uppercase tracking-wider">Customer</th>
                    <th className="text-left font-medium text-muted-foreground p-4 text-xs uppercase tracking-wider">Date</th>
                    <th className="text-right font-medium text-muted-foreground p-4 text-xs uppercase tracking-wider">Total</th>
                    <th className="text-right font-medium text-muted-foreground p-4 text-xs uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="p-4 font-medium">{order.id}</td>
                      <td className="p-4 text-muted-foreground">{order.customer}</td>
                      <td className="p-4 text-muted-foreground">{order.date}</td>
                      <td className="p-4 text-right tabular-nums">€{order.total.toLocaleString()}</td>
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
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOverview;
