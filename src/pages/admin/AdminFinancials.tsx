import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { useAllOrders } from "@/hooks/useOrders";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

const AdminFinancials = () => {
  const { data: orders, isLoading } = useAllOrders();

  const grossRevenue = (orders ?? []).reduce((sum, o) => sum + Number(o.total), 0);
  const totalTax = (orders ?? []).reduce((sum, o) => sum + Number(o.tax), 0);
  const netRevenue = grossRevenue - totalTax;

  const handleExport = () => {
    if (!orders?.length) return;
    const csv = ["Date,Order ID,Gross,Tax,Net,Status"];
    orders.forEach((o) => {
      csv.push(`${new Date(o.created_at).toLocaleDateString()},${o.id.slice(0, 8)},${o.total},${o.tax},${Number(o.total) - Number(o.tax)},${o.status}`);
    });
    const blob = new Blob([csv.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tax-ledger.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Ledger exported as CSV");
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl lg:text-3xl">Financial & Tax Dashboard</h1>
            <p className="text-muted-foreground font-body text-sm mt-1">Revenue tracking and tax compliance</p>
          </div>
          <Button onClick={handleExport}><Download className="h-4 w-4 mr-2" /> Export Tax Ledger</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-[16px] bg-card card-shadow">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Gross Revenue</p>
            <p className="font-display text-3xl tabular-nums mt-2">€{grossRevenue.toLocaleString()}</p>
          </div>
          <div className="p-5 rounded-[16px] bg-card card-shadow">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Tax Collected</p>
            <p className="font-display text-3xl tabular-nums mt-2">€{totalTax.toLocaleString()}</p>
          </div>
          <div className="p-5 rounded-[16px] bg-card card-shadow">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Net Revenue</p>
            <p className="font-display text-3xl tabular-nums mt-2">€{netRevenue.toLocaleString()}</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <div>
            <h2 className="font-display text-xl mb-4">Tax Ledger</h2>
            <div className="rounded-[16px] bg-card card-shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left font-medium text-muted-foreground p-4 text-xs uppercase tracking-wider">Date</th>
                      <th className="text-left font-medium text-muted-foreground p-4 text-xs uppercase tracking-wider">Order ID</th>
                      <th className="text-right font-medium text-muted-foreground p-4 text-xs uppercase tracking-wider">Gross</th>
                      <th className="text-right font-medium text-muted-foreground p-4 text-xs uppercase tracking-wider">Tax</th>
                      <th className="text-right font-medium text-muted-foreground p-4 text-xs uppercase tracking-wider">Net</th>
                      <th className="text-right font-medium text-muted-foreground p-4 text-xs uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(orders ?? []).map((order) => (
                      <tr key={order.id} className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="p-4 text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</td>
                        <td className="p-4 font-medium">{order.id.slice(0, 8)}</td>
                        <td className="p-4 text-right tabular-nums">€{Number(order.total).toLocaleString()}</td>
                        <td className="p-4 text-right tabular-nums">€{Number(order.tax).toLocaleString()}</td>
                        <td className="p-4 text-right tabular-nums">€{(Number(order.total) - Number(order.tax)).toLocaleString()}</td>
                        <td className="p-4 text-right">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            order.status === "delivered" ? "bg-primary/10 text-primary" :
                            order.status === "shipped" ? "bg-blue-50 text-blue-700" :
                            "bg-orange-50 text-orange-700"
                          }`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-border bg-muted/30">
                      <td className="p-4 font-medium" colSpan={2}>Totals</td>
                      <td className="p-4 text-right font-medium tabular-nums">€{grossRevenue.toLocaleString()}</td>
                      <td className="p-4 text-right font-medium tabular-nums">€{totalTax.toLocaleString()}</td>
                      <td className="p-4 text-right font-medium tabular-nums">€{netRevenue.toLocaleString()}</td>
                      <td className="p-4"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminFinancials;
