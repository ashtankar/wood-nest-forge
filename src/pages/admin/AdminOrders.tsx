import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { orders } from "@/data/products";
import { useState } from "react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExternalLink, Mail, Send } from "lucide-react";
import type { Order } from "@/data/products";

const AdminOrders = () => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl">Orders Management</h1>
          <p className="text-muted-foreground font-body text-sm mt-1">{orders.length} orders</p>
        </div>

        <div className="rounded-[16px] bg-card card-shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left font-medium text-muted-foreground p-4 text-xs uppercase tracking-wider">Order</th>
                  <th className="text-left font-medium text-muted-foreground p-4 text-xs uppercase tracking-wider">Customer</th>
                  <th className="text-left font-medium text-muted-foreground p-4 text-xs uppercase tracking-wider">Items</th>
                  <th className="text-left font-medium text-muted-foreground p-4 text-xs uppercase tracking-wider">Date</th>
                  <th className="text-right font-medium text-muted-foreground p-4 text-xs uppercase tracking-wider">Total</th>
                  <th className="text-right font-medium text-muted-foreground p-4 text-xs uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="p-4 font-medium">{order.id}</td>
                    <td className="p-4">
                      <p>{order.customer}</p>
                      <p className="text-xs text-muted-foreground">{order.email}</p>
                    </td>
                    <td className="p-4 text-muted-foreground text-xs">
                      {order.items.map((i) => i.name).join(", ")}
                    </td>
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

      {/* Order Detail Sheet */}
      <Sheet open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <SheetContent className="w-full sm:max-w-md bg-background">
          {selectedOrder && (
            <>
              <SheetHeader>
                <SheetTitle className="font-display text-xl">{selectedOrder.id}</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                <div className="p-4 rounded-lg bg-card card-shadow space-y-2">
                  <p className="text-sm"><span className="text-muted-foreground">Customer:</span> {selectedOrder.customer}</p>
                  <p className="text-sm"><span className="text-muted-foreground">Email:</span> {selectedOrder.email}</p>
                  <p className="text-sm"><span className="text-muted-foreground">Date:</span> {selectedOrder.date}</p>
                  <p className="text-sm"><span className="text-muted-foreground">Total:</span> <span className="tabular-nums">€{selectedOrder.total.toLocaleString()}</span></p>
                  <p className="text-sm"><span className="text-muted-foreground">Tax:</span> <span className="tabular-nums">€{selectedOrder.tax.toLocaleString()}</span></p>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Items</h3>
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} className="flex justify-between py-2 border-b border-border/30 last:border-0 text-sm">
                      <span>{item.name} × {item.qty}</span>
                      <span className="tabular-nums">€{(item.price * item.qty).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="text-sm font-medium">Update Status</label>
                  <Select defaultValue={selectedOrder.status}>
                    <SelectTrigger className="mt-1 border-none input-shadow">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Tracking Link</label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      className="border-none input-shadow focus:input-shadow-focus"
                      placeholder="https://tracking.example.com/..."
                      defaultValue={selectedOrder.trackingLink || ""}
                    />
                    {selectedOrder.trackingLink && (
                      <Button variant="outline" size="icon">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Button onClick={() => { toast.success("Order status updated"); setSelectedOrder(null); }}>
                    <Send className="h-4 w-4 mr-2" /> Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => toast.success("Invoice and dispatch email resent")}>
                    <Mail className="h-4 w-4 mr-2" /> Resend Invoice & Dispatch Email
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </AdminLayout>
  );
};

export default AdminOrders;
