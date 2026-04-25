import { AdminLayout } from "@/components/admin/AdminLayout";
import { Loader2, ShoppingBag } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/format";

const AdminCustomers = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-customers-with-stats"],
    queryFn: async () => {
      const [profilesRes, ordersRes, rolesRes] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("orders").select("user_id, total, status"),
        supabase.from("user_roles").select("user_id, role"),
      ]);
      if (profilesRes.error) throw profilesRes.error;
      if (ordersRes.error) throw ordersRes.error;
      if (rolesRes.error) throw rolesRes.error;

      const orders = ordersRes.data ?? [];
      const roles = rolesRes.data ?? [];

      return (profilesRes.data ?? []).map((p) => {
        const myOrders = orders.filter((o) => o.user_id === p.id);
        const totalSpent = myOrders.reduce((s, o) => s + Number(o.total), 0);
        const role = roles.find((r) => r.user_id === p.id)?.role ?? "customer";
        return {
          ...p,
          orderCount: myOrders.length,
          totalSpent,
          role,
        };
      });
    },
  });

  const customers = data ?? [];
  const totalRevenue = customers.reduce((s, c) => s + c.totalSpent, 0);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl">Customers</h1>
          <p className="text-muted-foreground font-body text-sm mt-1">
            {customers.length} registered · {formatPrice(totalRevenue)} lifetime revenue
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="rounded-[16px] bg-card card-shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left font-medium text-muted-foreground p-4 text-xs uppercase tracking-wider">Name</th>
                    <th className="text-left font-medium text-muted-foreground p-4 text-xs uppercase tracking-wider">Role</th>
                    <th className="text-left font-medium text-muted-foreground p-4 text-xs uppercase tracking-wider">Joined</th>
                    <th className="text-right font-medium text-muted-foreground p-4 text-xs uppercase tracking-wider">Orders</th>
                    <th className="text-right font-medium text-muted-foreground p-4 text-xs uppercase tracking-wider">Total Spent</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => (
                    <tr key={c.id} className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="p-4 font-medium">{c.full_name || "Unnamed"}</td>
                      <td className="p-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          c.role === "admin" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                        }`}>
                          {c.role}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</td>
                      <td className="p-4 text-right tabular-nums">
                        <span className="inline-flex items-center gap-1">
                          <ShoppingBag className="h-3 w-3 text-muted-foreground" />
                          {c.orderCount}
                        </span>
                      </td>
                      <td className="p-4 text-right tabular-nums">{formatPrice(c.totalSpent)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminCustomers;
