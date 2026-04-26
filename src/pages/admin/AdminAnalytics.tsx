import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAllOrders } from "@/hooks/useOrders";
import { useProducts } from "@/hooks/useProducts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, DollarSign, ShoppingCart, TrendingUp, Package } from "lucide-react";
import { motion } from "framer-motion";
import { formatPrice } from "@/lib/format";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, PieChart, Pie, Cell, Legend,
} from "recharts";
import { useMemo } from "react";

type Order = NonNullable<ReturnType<typeof useAllOrders>["data"]>[number];

const STATUS_COLORS: Record<string, string> = {
  processing: "hsl(38 92% 50%)",
  shipped: "hsl(217 91% 60%)",
  delivered: "hsl(142 71% 45%)",
  cancelled: "hsl(0 84% 60%)",
};

function startOfDay(d: Date) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
function startOfWeek(d: Date) {
  const x = startOfDay(d);
  const day = x.getDay();
  const diff = (day + 6) % 7; // Monday-start
  x.setDate(x.getDate() - diff);
  return x;
}
function startOfMonth(d: Date) { const x = new Date(d.getFullYear(), d.getMonth(), 1); return x; }

function buildBuckets(orders: Order[], granularity: "day" | "week" | "month") {
  const now = new Date();
  const map = new Map<string, { revenue: number; count: number }>();
  const labels: { key: string; label: string }[] = [];

  if (granularity === "day") {
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i);
      const key = startOfDay(d).toISOString();
      labels.push({ key, label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }) });
      map.set(key, { revenue: 0, count: 0 });
    }
    orders.forEach((o) => {
      const k = startOfDay(new Date(o.created_at)).toISOString();
      const b = map.get(k); if (b) { b.revenue += Number(o.total); b.count += 1; }
    });
  } else if (granularity === "week") {
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i * 7);
      const key = startOfWeek(d).toISOString();
      labels.push({ key, label: `Wk ${new Date(key).toLocaleDateString(undefined, { month: "short", day: "numeric" })}` });
      map.set(key, { revenue: 0, count: 0 });
    }
    orders.forEach((o) => {
      const k = startOfWeek(new Date(o.created_at)).toISOString();
      const b = map.get(k); if (b) { b.revenue += Number(o.total); b.count += 1; }
    });
  } else {
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toISOString();
      labels.push({ key, label: d.toLocaleDateString(undefined, { month: "short", year: "2-digit" }) });
      map.set(key, { revenue: 0, count: 0 });
    }
    orders.forEach((o) => {
      const k = startOfMonth(new Date(o.created_at)).toISOString();
      const b = map.get(k); if (b) { b.revenue += Number(o.total); b.count += 1; }
    });
  }

  return labels.map((l) => ({ label: l.label, ...(map.get(l.key) ?? { revenue: 0, count: 0 }) }));
}

const AdminAnalytics = () => {
  const { data: orders, isLoading } = useAllOrders();
  const { data: products } = useProducts();

  const allOrders = orders ?? [];
  const totalRevenue = allOrders.reduce((s, o) => s + Number(o.total), 0);
  const totalOrders = allOrders.length;
  const aov = totalOrders ? totalRevenue / totalOrders : 0;

  const daily = useMemo(() => buildBuckets(allOrders, "day"), [allOrders]);
  const weekly = useMemo(() => buildBuckets(allOrders, "week"), [allOrders]);
  const monthly = useMemo(() => buildBuckets(allOrders, "month"), [allOrders]);

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    allOrders.forEach((o) => { counts[o.status] = (counts[o.status] ?? 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [allOrders]);

  const topProducts = useMemo(() => {
    const tally = new Map<string, { name: string; revenue: number; qty: number }>();
    allOrders.forEach((o) => {
      o.items.forEach((it) => {
        const key = it.product_name || "Unknown";
        const cur = tally.get(key) ?? { name: key, revenue: 0, qty: 0 };
        cur.revenue += Number(it.unit_price) * it.quantity;
        cur.qty += it.quantity;
        tally.set(key, cur);
      });
    });
    return Array.from(tally.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 8);
  }, [allOrders]);

  const stats = [
    { label: "Total Revenue", value: formatPrice(totalRevenue), icon: DollarSign, hue: "bg-primary/10 text-primary" },
    { label: "Total Orders", value: String(totalOrders), icon: ShoppingCart, hue: "bg-blue-50 text-blue-700" },
    { label: "Avg Order Value", value: formatPrice(Math.round(aov)), icon: TrendingUp, hue: "bg-emerald-50 text-emerald-700" },
    { label: "Active Products", value: String((products ?? []).length), icon: Package, hue: "bg-amber-50 text-amber-700" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl">Analytics</h1>
          <p className="text-muted-foreground font-body text-sm mt-1">Sales trends and performance insights.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="p-5 rounded-[16px] bg-card card-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-body">{s.label}</span>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${s.hue}`}><s.icon className="h-4 w-4" /></div>
              </div>
              <p className="font-display text-2xl tabular-nums">{s.value}</p>
            </motion.div>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <>
            <div className="p-5 rounded-[16px] bg-card card-shadow">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h2 className="font-display text-lg">Sales Over Time</h2>
              </div>
              <Tabs defaultValue="day">
                <TabsList>
                  <TabsTrigger value="day">Daily (30d)</TabsTrigger>
                  <TabsTrigger value="week">Weekly (12w)</TabsTrigger>
                  <TabsTrigger value="month">Monthly (12m)</TabsTrigger>
                </TabsList>
                {([
                  { value: "day", data: daily },
                  { value: "week", data: weekly },
                  { value: "month", data: monthly },
                ] as const).map((t) => (
                  <TabsContent key={t.value} value={t.value} className="mt-4">
                    <div className="h-[320px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={t.data}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                          <Tooltip
                            contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                            formatter={(v: number, name) => name === "revenue" ? [formatPrice(v), "Revenue"] : [v, "Orders"]}
                          />
                          <Legend />
                          <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
                          <Line type="monotone" dataKey="count" stroke="hsl(217 91% 60%)" strokeWidth={2} dot={{ r: 3 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="p-5 rounded-[16px] bg-card card-shadow">
                <h2 className="font-display text-lg mb-4">Top Products by Revenue</h2>
                {topProducts.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No sales data yet.</p>
                ) : (
                  <div className="h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topProducts} layout="vertical" margin={{ left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} width={120} />
                        <Tooltip
                          contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                          formatter={(v: number) => [formatPrice(v), "Revenue"]}
                        />
                        <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              <div className="p-5 rounded-[16px] bg-card card-shadow">
                <h2 className="font-display text-lg mb-4">Order Status Breakdown</h2>
                {statusData.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No orders yet.</p>
                ) : (
                  <div className="h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={statusData} dataKey="value" nameKey="name" outerRadius={110} label>
                          {statusData.map((entry) => (
                            <Cell key={entry.name} fill={STATUS_COLORS[entry.name] ?? "hsl(var(--muted-foreground))"} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
