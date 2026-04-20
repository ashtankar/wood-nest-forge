import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAllOrders } from "@/hooks/useOrders";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExternalLink, Mail, Send, Loader2 } from "lucide-react";

const AdminOrders = () => {
  const { data: orders, isLoading } = useAllOrders();
  const queryClient = useQueryClient();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [trackingLink, setTrackingLink] = useState("");

  const selectedOrder = (orders ?? []).find((o) => o.id === selectedOrderId);

  const handleSave = async () => {
    if (!selectedOrderId) return;
    const updates: { status?: "processing" | "shipped" | "delivered" | "cancelled"; tracking_link?: string } = {};
    if (newStatus) updates.status = newStatus as "processing" | "shipped" | "delivered" | "cancelled";
    if (trackingLink) updates.tracking_link = trackingLink;

    const { error } = await supabase.from("orders").update(updates).eq("id", selectedOrderId);
    if (error) { toast.error("Failed to update order"); return; }
    toast.success("Order updated");
    queryClient.invalidateQueries({ queryKey: ["all-orders"] });
    setSelectedOrderId(null);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl">Orders Management</h1>
          <p className="text-muted-foreground font-body text-sm mt-1">{(orders ?? []).length} orders</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="rounded-[16px] bg-card card-shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left font-medium text-muted-foreground p-4 text-xs uppercase tracking-wider">Order</th>
                    <th className="text-left font-medium text-muted-foreground p-4 text-xs uppercase tracking-wider">Items</th>
                    <th className="text-left font-medium text-muted-foreground p-4 text-xs uppercase tracking-wider">Date</th>
                    <th className="text-right font-medium text-muted-foreground p-4 text-xs uppercase tracking-wider">Total</th>
                    <th className="text-right font-medium text-muted-foreground p-4 text-xs uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(orders ?? []).map((order) => (
                    <tr key={order.id} className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => { setSelectedOrderId(order.id); setNewStatus(order.status); setTrackingLink(order.tracking_link || ""); }}>
                      <td className="p-4 font-medium">{order.id.slice(0, 8)}</td>
                      <td className="p-4 text-muted-foreground text-xs">{order.items.map((i) => i.product_name).join(", ")}</td>
                      <td className="p-4 text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</td>
                      <td className="p-4 text-right tabular-nums">€{Number(order.total).toLocaleString()}</td>
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

      <Sheet open={!!selectedOrder} onOpenChange={() => setSelectedOrderId(null)}>
        <SheetContent className="w-full sm:max-w-md bg-background">
          {selectedOrder && (
            <>
              <SheetHeader><SheetTitle className="font-display text-xl">{selectedOrder.id.slice(0, 8)}</SheetTitle></SheetHeader>
              <div className="mt-6 space-y-6">
                <div className="p-4 rounded-lg bg-card card-shadow space-y-2">
                  <p className="text-sm"><span className="text-muted-foreground">Date:</span> {new Date(selectedOrder.created_at).toLocaleDateString()}</p>
                  <p className="text-sm"><span className="text-muted-foreground">Total:</span> <span className="tabular-nums">€{Number(selectedOrder.total).toLocaleString()}</span></p>
                  <p className="text-sm"><span className="text-muted-foreground">Tax:</span> <span className="tabular-nums">€{Number(selectedOrder.tax).toLocaleString()}</span></p>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-2">Items</h3>
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} className="flex justify-between py-2 border-b border-border/30 last:border-0 text-sm">
                      <span>{item.product_name} × {item.quantity}</span>
                      <span className="tabular-nums">€{(Number(item.unit_price) * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <label className="text-sm font-medium">Update Status</label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger className="mt-1 border-none input-shadow"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Tracking Link</label>
                  <Input className="mt-1 border-none input-shadow" value={trackingLink} onChange={(e) => setTrackingLink(e.target.value)} />
                </div>
                <Button className="w-full" onClick={handleSave}><Send className="h-4 w-4 mr-2" /> Save Changes</Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </AdminLayout>
  );
};

export default AdminOrders;
