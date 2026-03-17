import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, FileText, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const tiers = [
  { label: "Tier 1 (10–24 units)", discount: "10%", minQty: 10 },
  { label: "Tier 2 (25–49 units)", discount: "15%", minQty: 25 },
  { label: "Tier 3 (50+ units)", discount: "22%", minQty: 50 },
];

const resellers = [
  { name: "Studio Collective", contact: "emma@studio.co", tier: "Tier 2", totalOrders: 12, revenue: "€34,200" },
  { name: "Arch & Co.", contact: "tom@arch.de", tier: "Tier 1", totalOrders: 5, revenue: "€12,800" },
  { name: "Nordic Interiors", contact: "sven@nordic.fi", tier: "Tier 3", totalOrders: 28, revenue: "€98,500" },
];

const AdminB2B = () => {
  const [generating, setGenerating] = useState(false);

  const handleGenerateCatalog = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      toast.success("PDF catalog generated and ready for download");
    }, 2000);
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl lg:text-3xl">B2B / Reseller Hub</h1>
            <p className="text-muted-foreground font-body text-sm mt-1">Manage wholesale pricing and reseller accounts</p>
          </div>
          <Button onClick={handleGenerateCatalog} disabled={generating}>
            {generating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileText className="h-4 w-4 mr-2" />}
            Generate PDF Catalog
          </Button>
        </div>

        {/* Pricing Tiers */}
        <div>
          <h2 className="font-display text-xl mb-4">Wholesale Pricing Tiers</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tiers.map((tier) => (
              <div key={tier.label} className="p-5 rounded-[16px] bg-card card-shadow">
                <h3 className="font-medium text-sm">{tier.label}</h3>
                <p className="font-display text-3xl mt-2 text-primary">{tier.discount}</p>
                <p className="text-xs text-muted-foreground mt-1">Minimum {tier.minQty} units per order</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={() => toast.info("Edit tier settings")}>
                  Configure
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Resellers */}
        <div>
          <h2 className="font-display text-xl mb-4">Reseller Accounts</h2>
          <div className="rounded-[16px] bg-card card-shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left font-medium text-muted-foreground p-4 text-xs uppercase tracking-wider">Company</th>
                    <th className="text-left font-medium text-muted-foreground p-4 text-xs uppercase tracking-wider">Contact</th>
                    <th className="text-left font-medium text-muted-foreground p-4 text-xs uppercase tracking-wider">Tier</th>
                    <th className="text-right font-medium text-muted-foreground p-4 text-xs uppercase tracking-wider">Orders</th>
                    <th className="text-right font-medium text-muted-foreground p-4 text-xs uppercase tracking-wider">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {resellers.map((r) => (
                    <tr key={r.name} className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="p-4 font-medium">{r.name}</td>
                      <td className="p-4 text-muted-foreground">{r.contact}</td>
                      <td className="p-4">
                        <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">{r.tier}</span>
                      </td>
                      <td className="p-4 text-right tabular-nums">{r.totalOrders}</td>
                      <td className="p-4 text-right tabular-nums">{r.revenue}</td>
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

export default AdminB2B;
