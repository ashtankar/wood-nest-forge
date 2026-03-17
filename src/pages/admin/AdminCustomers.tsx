import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Mail, Eye } from "lucide-react";
import { toast } from "sonner";

const customers = [
  { name: "Sarah Mitchell", email: "sarah@example.com", orders: 3, totalSpent: "€7,580", lastOrder: "2026-03-15", type: "Customer" },
  { name: "James Chen", email: "james@studio.co", orders: 1, totalSpent: "€3,450", lastOrder: "2026-03-14", type: "B2B" },
  { name: "Elena Rossi", email: "elena@design.it", orders: 5, totalSpent: "€14,200", lastOrder: "2026-03-12", type: "B2B" },
  { name: "Tom Albrecht", email: "tom@arch.de", orders: 8, totalSpent: "€22,400", lastOrder: "2026-03-10", type: "B2B" },
  { name: "Mia Tanaka", email: "mia@workspace.jp", orders: 2, totalSpent: "€16,800", lastOrder: "2026-03-08", type: "Customer" },
  { name: "Lucas Moreau", email: "lucas@home.fr", orders: 1, totalSpent: "€1,240", lastOrder: "2026-02-28", type: "Customer" },
];

const AdminCustomers = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl">Customers</h1>
          <p className="text-muted-foreground font-body text-sm mt-1">{customers.length} registered customers</p>
        </div>

        <div className="rounded-[16px] bg-card card-shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left font-medium text-muted-foreground p-4 text-xs uppercase tracking-wider">Customer</th>
                  <th className="text-left font-medium text-muted-foreground p-4 text-xs uppercase tracking-wider">Type</th>
                  <th className="text-right font-medium text-muted-foreground p-4 text-xs uppercase tracking-wider">Orders</th>
                  <th className="text-right font-medium text-muted-foreground p-4 text-xs uppercase tracking-wider">Total Spent</th>
                  <th className="text-left font-medium text-muted-foreground p-4 text-xs uppercase tracking-wider">Last Order</th>
                  <th className="text-right font-medium text-muted-foreground p-4 text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.email} className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <p className="font-medium">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.email}</p>
                    </td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        c.type === "B2B" ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"
                      }`}>
                        {c.type}
                      </span>
                    </td>
                    <td className="p-4 text-right tabular-nums">{c.orders}</td>
                    <td className="p-4 text-right tabular-nums">{c.totalSpent}</td>
                    <td className="p-4 text-muted-foreground">{c.lastOrder}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast.info("Customer detail view")}>
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast.info("Compose email")}>
                          <Mail className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminCustomers;
