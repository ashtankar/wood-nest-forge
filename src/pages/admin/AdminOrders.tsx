import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAllOrders } from "@/hooks/useOrders";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Loader2, Search, Filter, X } from "lucide-react";

const AdminOrders = () => {
  const { data: orders, isLoading } = useAllOrders();
  const queryClient = useQueryClient();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [trackingLink, setTrackingLink] = useState("");

  // --- Filter States ---
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [customerFilter, setCustomerFilter] = useState("all");
  const [productFilter, setProductFilter] = useState("all");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const allOrders = orders ?? [];

  // --- Dynamic Dropdown Lists (Pre-filled from data) ---
  const uniqueCustomers = useMemo(() => {
    return Array.from(new Set(allOrders.map(o => o.customer?.full_name || "Guest"))).filter(Boolean).sort();
  }, [allOrders]);

  const uniqueProducts = useMemo(() => {
    return Array.from(new Set(allOrders.flatMap(o => o.items.map(i => i.product_name)))).filter(Boolean).sort();
  }, [allOrders]);

  // --- Filter Engine ---
  const filteredOrders = useMemo(() => {
    return allOrders.filter(order => {
      // 1. Search by Order ID
      if (searchQuery && !order.id.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      
      // 2. Status
      if (statusFilter !== "all" && order.status !== statusFilter) return false;
      
      // 3. Customer
      const customerName = order.customer?.full_name || "Guest";
      if (customerFilter !== "all" && customerName !== customerFilter) return false;
      
      // 4. Product presence
      if (productFilter !== "all" && !order.items.some(i => i.product_name === productFilter)) return false;
      
      // 5. Price Range
      const total = Number(order.total);
      if (priceMin && total < Number(priceMin)) return false;
      if (priceMax && total > Number(priceMax)) return false;
      
      // 6. Date Range
      const orderDate = new Date(order.created_at);
      if (dateFrom) {
        const from = new Date(dateFrom);
        from.setHours(0, 0, 0, 0);
        if (orderDate < from) return false;
      }
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        if (orderDate > to) return false;
      }

      return true;
    });
  }, [allOrders, searchQuery, statusFilter, customerFilter, productFilter, priceMin, priceMax, dateFrom, dateTo]);

  const selectedOrder = allOrders.find((o) => o.id === selectedOrderId);

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

  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setCustomerFilter("all");
    setProductFilter("all");
    setPriceMin("");
    setPriceMax("");
    setDateFrom("");
    setDateTo("");
  };

  const activeFilterCount = [
    statusFilter !== "all", customerFilter !== "all", productFilter !== "all", 
    priceMin, priceMax, dateFrom, dateTo
  ].filter(Boolean).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl lg:text-3xl">Orders Management</h1>
            <p className="text-muted-foreground font-body text-sm mt-1">Showing {filteredOrders.length} of {allOrders.length} orders</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search Order ID..." 
                className="pl-9 w-[200px] lg:w-[250px] border-none input-shadow" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant={showFilters ? "default" : "outline"} className="border-none input-shadow" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="h-4 w-4 mr-2" />
              Filters {activeFilterCount > 0 && <span className="ml-1 bg-background text-foreground px-1.5 py-0.5 rounded-full text-[10px] leading-none">{activeFilterCount}</span>}
            </Button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-card p-5 rounded-[16px] card-shadow grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-4 duration-200">
            
            {/* Status & Customer */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-9 border-none bg-background"><SelectValue placeholder="All Statuses" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Customer</label>
                <Select value={customerFilter} onValueChange={setCustomerFilter}>
                  <SelectTrigger className="h-9 border-none bg-background"><SelectValue placeholder="All Customers" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Customers</SelectItem>
                    {uniqueCustomers.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Product & Price */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Contains Product</label>
                <Select value={productFilter} onValueChange={setProductFilter}>
                  <SelectTrigger className="h-9 border-none bg-background truncate"><SelectValue placeholder="All Products" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Products</SelectItem>
                    {uniqueProducts.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Total Price Range</label>
                <div className="flex items-center gap-2">
                  <Input type="number" placeholder="Min ₹" className="h-9 border-none bg-background text-sm" value={priceMin} onChange={e => setPriceMin(e.target.value)} />
                  <span className="text-muted-foreground text-xs">-</span>
                  <Input type="number" placeholder="Max ₹" className="h-9 border-none bg-background text-sm" value={priceMax} onChange={e => setPriceMax(e.target.value)} />
                </div>
              </div>
            </div>

            {/* Date Range */}
            <div className="space-y-3 xl:col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Date Range</label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs text-muted-foreground w-8">From</span>
                  <Input type="date" className="h-9 border-none bg-background flex-1" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs text-muted-foreground w-8">To</span>
                  <Input type="date" className="h-9 border-none bg-background flex-1" value={dateTo} onChange={e => setDateTo(e.target.value)} />
                </div>
                
                {activeFilterCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={resetFilters} className="text-xs h-9 mt-2 sm:mt-0 ml-auto xl:ml-4 text-muted-foreground hover:text-foreground">
                    <X className="h-3 w-3 mr-1" /> Clear All
                  </Button>
                )}
              </div>
            </div>

          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-card rounded-[16px] card-shadow py-20 text-center">
            <p className="text-muted-foreground mb-2">No orders match your current filters.</p>
            {activeFilterCount > 0 && <Button variant="outline" size="sm" onClick={resetFilters}>Clear Filters</Button>}
          </div>
        ) : (
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
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => { setSelectedOrderId(order.id); setNewStatus(order.status); setTrackingLink(order.tracking_link || ""); }}>
                      <td className="p-4 font-medium">{order.id.slice(0, 8)}</td>
                      <td className="p-4 text-muted-foreground">{order.customer?.full_name || "Guest"}</td>
                      <td className="p-4 text-muted-foreground text-xs max-w-[240px] truncate">{order.items.map((i) => `${i.product_name} ×${i.quantity}`).join(", ")}</td>
                      <td className="p-4 text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</td>
                      <td className="p-4 text-right tabular-nums">₹{Number(order.total).toLocaleString()}</td>
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
                  <p className="text-sm"><span className="text-muted-foreground">Customer:</span> {selectedOrder.customer?.full_name || "Guest"}</p>
                  <p className="text-sm"><span className="text-muted-foreground">Date:</span> {new Date(selectedOrder.created_at).toLocaleDateString()}</p>
                  <p className="text-sm"><span className="text-muted-foreground">Total:</span> <span className="tabular-nums">₹{Number(selectedOrder.total).toLocaleString()}</span></p>
                  <p className="text-sm"><span className="text-muted-foreground">Tax:</span> <span className="tabular-nums">₹{Number(selectedOrder.tax).toLocaleString()}</span></p>
                  {selectedOrder.shipping_address && (
                    <div className="text-sm pt-2 border-t border-border/30">
                      <span className="text-muted-foreground">Shipping to:</span>
                      <p className="mt-1 whitespace-pre-line text-xs">
                        {[
                          (selectedOrder.shipping_address as any)?.address_line,
                          (selectedOrder.shipping_address as any)?.city,
                          (selectedOrder.shipping_address as any)?.postal_code,
                          (selectedOrder.shipping_address as any)?.country,
                        ].filter(Boolean).join(", ")}
                      </p>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-2">Items</h3>
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} className="flex justify-between py-2 border-b border-border/30 last:border-0 text-sm">
                      <span>{item.product_name} × {item.quantity}</span>
                      <span className="tabular-nums">₹{(Number(item.unit_price) * item.quantity).toLocaleString()}</span>
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
