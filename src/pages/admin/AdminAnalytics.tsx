import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAllOrders } from "@/hooks/useOrders";
import { useProducts } from "@/hooks/useProducts";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, DollarSign, ShoppingCart, TrendingUp, Package } from "lucide-react";
import { motion } from "framer-motion";
import { formatPrice } from "@/lib/format";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, PieChart, Pie, Cell, Legend,
} from "recharts";
import { useMemo, useState } from "react";

type Order = NonNullable<ReturnType<typeof useAllOrders>["data"]>[number];

const STATUS_COLORS: Record<string, string> = {
  processing: "hsl(38 92% 50%)",
  shipped: "hsl(217 91% 60%)",
  delivered: "hsl(142 71% 45%)",
  cancelled: "hsl(0 84% 60%)",
};

// Date Helpers
function startOfDay(d: Date) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
function startOfWeek(d: Date) {
  const x = startOfDay(d);
  const diff = (x.getDay() + 6) % 7; // Monday-start
  x.setDate(x.getDate() - diff);
  return x;
}
function startOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth(), 1); }
function getLocalDateString(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const AdminAnalytics = () => {
  const { data: orders, isLoading } = useAllOrders();
  const { data: products } = useProducts();

  const allOrders = orders ?? [];
  const totalRevenue = allOrders.reduce((s, o) => s + Number(o.total), 0);
  const totalOrders = allOrders.length;
  const aov = totalOrders ? totalRevenue / totalOrders : 0;

  // Chart Controls State
  const [startDate, setStartDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 30); return getLocalDateString(d);
  });
  const [endDate, setEndDate] = useState(() => getLocalDateString(new Date()));
  const [granularity, setGranularity] = useState<"day" | "week" | "month">("day");
  const [chartType, setChartType] = useState<"line" | "bar" | "area">("line");

  // Dynamic Bucket Builder based on Date Range
  const chartData = useMemo(() => {
    const map = new Map<string, { revenue: number; count: number }>();
    const labels: { key: string; label: string }[] = [];
    
    const start = new Date(startDate); start.setHours(0,0,0,0);
    const end = new Date(endDate); end.setHours(23,59,59,999);

    let current = new Date(start);

    // 1. Initialize Buckets
    if (granularity === "day") {
      while (current <= end) {
        const key = startOfDay(current).toISOString();
        labels.push({ key, label: current.toLocaleDateString(undefined, { month: "short", day: "numeric" }) });
        map.set(key, { revenue: 0, count: 0 });
        current.setDate(current.getDate() + 1);
      }
    } else if (granularity === "week") {
      current = startOfWeek(current);
      while (current <= end) {
        const key = startOfWeek(current).toISOString();
        labels.push({ key, label: `Wk ${current.toLocaleDateString(undefined, { month: "short", day: "numeric" })}` });
        map.set(key, { revenue: 0, count: 0 });
        current.setDate(current.getDate() + 7);
      }
    } else {
      current = startOfMonth(current);
      while (current <= end) {
        const key = startOfMonth(current).toISOString();
        labels.push({ key, label: current.toLocaleDateString(undefined, { month: "short", year: "2-digit" }) });
        map.set(key, { revenue: 0, count: 0 });
        current.setMonth(current.getMonth() + 1);
      }
    }

    // 2. Fill Buckets
    allOrders.forEach((o) => {
      const d = new Date(o.created_at);
      if (d >= start && d <= end) {
        let k = "";
        if (granularity === "day") k = startOfDay(d).toISOString();
        else if (granularity === "week") k = startOfWeek(d).toISOString();
        else k = startOfMonth(d).toISOString();
        
        const b = map.get(k); 
        if (b) { b.revenue += Number(o.total); b.count += 1; }
      }
    });

    return labels.map((l) => ({ label: l.label, ...(map.get(l.key) ?? { revenue: 0, count: 0 }) }));
  }, [allOrders, startDate, endDate, granularity]);

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

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 10, right: 10, left: 0, bottom: 0 }
    };

    if (chartType === "bar") {
      return (
        <BarChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} dy={10} />
          <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} dx={-10} tickFormatter={(v) => `₹${v}`} />
          <YAxis yAxisId="right" orientation="right" stroke="hsl(217 91% 60%)" fontSize={12} tickLine={false} axisLine={false} dx={10} />
          <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} formatter={(v: number, name: string) => name === "revenue" ? [formatPrice(v), "Revenue"] : [v, "Orders"]} />
          <Legend wrapperStyle={{ paddingTop: "20px" }} />
          <Bar yAxisId="left" dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="revenue" />
          <Bar yAxisId="right" dataKey="count" fill="hsl(217 91% 60%)" radius={[4, 4, 0, 0]} name="count" />
        </BarChart>
      );
    }

    if (chartType === "area") {
      return (
        <AreaChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} dy={10} />
          <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} dx={-10} tickFormatter={(v) => `₹${v}`} />
          <YAxis yAxisId="right" orientation="right" stroke="hsl(217 91% 60%)" fontSize={12} tickLine={false} axisLine={false} dx={10} />
          <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} formatter={(v: number, name: string) => name === "revenue" ? [formatPrice(v), "Revenue"] : [v, "Orders"]} />
          <Legend wrapperStyle={{ paddingTop: "20px" }} />
          <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} name="revenue" />
          <Area yAxisId="right" type="monotone" dataKey="count" stroke="hsl(217 91% 60%)" fill="hsl(217 91% 60%)" fillOpacity={0.2} strokeWidth={2} name="count" />
        </AreaChart>
      );
    }

    return (
      <LineChart {...commonProps}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} dy={10} />
        <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} dx={-10} tickFormatter={(v) => `₹${v}`} />
        <YAxis yAxisId="right" orientation="right" stroke="hsl(217 91% 60%)" fontSize={12} tickLine={false} axisLine={false} dx={10} />
        <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} formatter={(v: number, name: string) => name === "revenue" ? [formatPrice(v), "Revenue"] : [v, "Orders"]} />
        <Legend wrapperStyle={{ paddingTop: "20px" }} />
        <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} name="revenue" />
        <Line yAxisId="right" type="monotone" dataKey="count" stroke="hsl(217 91% 60%)" strokeWidth={2} dot={{ r: 3 }} name="count" />
      </LineChart>
    );
  };

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
              <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
                <h2 className="font-display text-lg">Sales Over Time</h2>
                
                {/* Control Panel */}
                <div className="flex flex-wrap items-center gap-3 bg-muted/30 p-2 rounded-lg border border-border/50">
                  <div className="flex items-center gap-2">
                    <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-8 w-[140px] text-xs bg-background" />
                    <span className="text-muted-foreground text-xs">to</span>
                    <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-8 w-[140px] text-xs bg-background" />
                  </div>
                  <div className="w-[1px] h-6 bg-border/50 hidden sm:block mx-1"></div>
                  <Select value={granularity} onValueChange={(v: any) => setGranularity(v)}>
                    <SelectTrigger className="h-8 w-[110px] text-xs bg-background"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day" className="text-xs">Daily</SelectItem>
                      <SelectItem value="week" className="text-xs">Weekly</SelectItem>
                      <SelectItem value="month" className="text-xs">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={chartType} onValueChange={(v: any) => setChartType(v)}>
                    <SelectTrigger className="h-8 w-[110px] text-xs bg-background"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="line" className="text-xs">Line Chart</SelectItem>
                      <SelectItem value="bar" className="text-xs">Bar Chart</SelectItem>
                      <SelectItem value="area" className="text-xs">Area Chart</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Chart Render */}
              <div className="h-[360px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  {renderChart()}
                </ResponsiveContainer>
              </div>
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
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                        <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
                        <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} width={120} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} formatter={(v: number) => [formatPrice(v), "Revenue"]} />
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
                        <Pie data={statusData} dataKey="value" nameKey="name" outerRadius={110} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                          {statusData.map((entry) => (
                            <Cell key={entry.name} fill={STATUS_COLORS[entry.name] ?? "hsl(var(--muted-foreground))"} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
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
