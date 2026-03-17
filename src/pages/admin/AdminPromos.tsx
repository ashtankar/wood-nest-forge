import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { promoCodes } from "@/data/products";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const AdminPromos = () => {
  const [addOpen, setAddOpen] = useState(false);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl lg:text-3xl">Promotions Manager</h1>
            <p className="text-muted-foreground font-body text-sm mt-1">Create and manage discount codes</p>
          </div>

          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" /> New Promo Code</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-background">
              <DialogHeader>
                <DialogTitle className="font-display text-xl">Create Promo Code</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium">Code</label>
                  <Input className="mt-1 border-none input-shadow focus:input-shadow-focus uppercase" placeholder="e.g., SUMMER20" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">Type</label>
                    <Select defaultValue="percentage">
                      <SelectTrigger className="mt-1 border-none input-shadow">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="flat">Flat Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Value</label>
                    <Input type="number" className="mt-1 border-none input-shadow focus:input-shadow-focus" placeholder="20" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Expires At</label>
                  <Input type="date" className="mt-1 border-none input-shadow focus:input-shadow-focus" />
                </div>
                <Button
                  variant="hero"
                  className="w-full"
                  onClick={() => {
                    toast.success("Promo code created");
                    setAddOpen(false);
                  }}
                >
                  Create Code
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-[16px] bg-card card-shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left font-medium text-muted-foreground p-4 text-xs uppercase tracking-wider">Code</th>
                  <th className="text-left font-medium text-muted-foreground p-4 text-xs uppercase tracking-wider">Type</th>
                  <th className="text-right font-medium text-muted-foreground p-4 text-xs uppercase tracking-wider">Value</th>
                  <th className="text-right font-medium text-muted-foreground p-4 text-xs uppercase tracking-wider">Usage</th>
                  <th className="text-left font-medium text-muted-foreground p-4 text-xs uppercase tracking-wider">Expires</th>
                  <th className="text-right font-medium text-muted-foreground p-4 text-xs uppercase tracking-wider">Status</th>
                  <th className="text-right font-medium text-muted-foreground p-4 text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {promoCodes.map((promo) => (
                  <tr key={promo.id} className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-medium font-mono text-sm">{promo.code}</td>
                    <td className="p-4 text-muted-foreground capitalize">{promo.type}</td>
                    <td className="p-4 text-right tabular-nums">{promo.type === "percentage" ? `${promo.value}%` : `€${promo.value}`}</td>
                    <td className="p-4 text-right tabular-nums">{promo.usageCount} uses</td>
                    <td className="p-4 text-muted-foreground">{promo.expiresAt}</td>
                    <td className="p-4 text-right">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        promo.active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                      }`}>
                        {promo.active ? "Active" : "Expired"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast.info("Delete confirmation")}>
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
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

export default AdminPromos;
