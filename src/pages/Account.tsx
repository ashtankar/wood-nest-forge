import { StorefrontLayout } from "@/components/storefront/StorefrontLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ProductCard } from "@/components/storefront/ProductCard";
import { Download, MapPin, Package, Trash2, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useOrders } from "@/hooks/useOrders";
import { useWishlist } from "@/hooks/useWishlist";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const Account = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { data: orders, isLoading: ordersLoading } = useOrders();
  const { items: wishlistItems, isLoading: wishlistLoading, removeFromWishlist } = useWishlist();
  const queryClient = useQueryClient();
  const activeTab = searchParams.get("tab") || "orders";
  const [addAddressOpen, setAddAddressOpen] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newPostal, setNewPostal] = useState("");
  const [newCountry, setNewCountry] = useState("");

  const { data: addresses, isLoading: addressesLoading } = useQuery({
    queryKey: ["addresses", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const handleTabChange = (value: string) => setSearchParams({ tab: value });

  const handleLogout = async () => {
    await signOut();
    toast.success("Logged out");
    navigate("/");
  };

  const handleAddAddress = async () => {
    if (!user) return;
    const { error } = await supabase.from("addresses").insert({
      user_id: user.id,
      label: newLabel,
      address_line: newAddress,
      city: newCity,
      postal_code: newPostal,
      country: newCountry,
    });
    if (error) { toast.error("Failed to add address"); return; }
    toast.success("Address added");
    queryClient.invalidateQueries({ queryKey: ["addresses"] });
    setAddAddressOpen(false);
    setNewLabel(""); setNewAddress(""); setNewCity(""); setNewPostal(""); setNewCountry("");
  };

  const handleDeleteAddress = async (id: string) => {
    const { error } = await supabase.from("addresses").delete().eq("id", id);
    if (error) { toast.error("Failed to delete address"); return; }
    toast.success("Address removed");
    queryClient.invalidateQueries({ queryKey: ["addresses"] });
  };

  const profile = user?.user_metadata;

  return (
    <StorefrontLayout>
      <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl">My Account</h1>
            <p className="text-muted-foreground font-body mt-1">
              {profile?.full_name || "User"} · {user?.email}
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>Log Out</Button>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="bg-muted rounded-full h-10 p-1 mb-8 flex-wrap">
            <TabsTrigger value="orders" className="rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm text-sm">Orders</TabsTrigger>
            <TabsTrigger value="wishlist" className="rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm text-sm">Wishlist</TabsTrigger>
            <TabsTrigger value="addresses" className="rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm text-sm">Addresses</TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            {ordersLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : (orders ?? []).length === 0 ? (
              <p className="text-muted-foreground text-center py-12">No orders yet.</p>
            ) : (
              <div className="space-y-4">
                {(orders ?? []).map((order) => (
                  <div key={order.id} className="p-5 rounded-[16px] bg-card card-shadow">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-sm">{order.id.slice(0, 8)}</p>
                        <p className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {order.items.map((item, i) => (
                            <span key={i} className="text-xs bg-muted px-2 py-1 rounded-full">{item.product_name} × {item.quantity}</span>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium tabular-nums">€{Number(order.total).toLocaleString()}</p>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium mt-1 inline-block ${
                          order.status === "delivered" ? "bg-primary/10 text-primary" :
                          order.status === "shipped" ? "bg-blue-50 text-blue-700" :
                          order.status === "processing" ? "bg-orange-50 text-orange-700" :
                          "bg-destructive/10 text-destructive"
                        }`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4 border-t pt-4">
                      {order.tracking_link && (
                        <Button variant="outline" size="sm" onClick={() => window.open(order.tracking_link!, "_blank")}>
                          <Package className="h-3.5 w-3.5 mr-1" /> Track
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="wishlist">
            {wishlistLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : wishlistItems.length === 0 ? (
              <p className="text-muted-foreground text-center py-12">Your wishlist is empty.</p>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {wishlistItems.map((item, i) => (
                  <div key={item.id} className="relative">
                    <ProductCard product={item.product} index={i} />
                    <Button
                      variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7 z-10"
                      onClick={() => removeFromWishlist.mutate(item.id, { onSuccess: () => toast.success("Removed from wishlist") })}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="addresses">
            {addressesLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : (
              <div className="space-y-4 max-w-lg">
                {(addresses ?? []).map((addr) => (
                  <div key={addr.id} className="p-4 rounded-[16px] bg-card card-shadow flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{addr.label}</p>
                      <p className="text-sm text-muted-foreground">{addr.address_line}, {addr.city} {addr.postal_code}, {addr.country}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteAddress(addr.id)}>
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                ))}

                <Dialog open={addAddressOpen} onOpenChange={setAddAddressOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline"><Plus className="h-4 w-4 mr-2" /> Add New Address</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md bg-background">
                    <DialogHeader><DialogTitle className="font-display text-xl">Add Address</DialogTitle></DialogHeader>
                    <div className="space-y-3 mt-4">
                      <div><label className="text-sm font-medium">Label</label><Input className="mt-1 border-none input-shadow" placeholder="Home, Office..." value={newLabel} onChange={(e) => setNewLabel(e.target.value)} /></div>
                      <div><label className="text-sm font-medium">Address</label><Input className="mt-1 border-none input-shadow" placeholder="123 Main Street" value={newAddress} onChange={(e) => setNewAddress(e.target.value)} /></div>
                      <div className="grid grid-cols-3 gap-3">
                        <div><label className="text-sm font-medium">City</label><Input className="mt-1 border-none input-shadow" value={newCity} onChange={(e) => setNewCity(e.target.value)} /></div>
                        <div><label className="text-sm font-medium">Postal</label><Input className="mt-1 border-none input-shadow" value={newPostal} onChange={(e) => setNewPostal(e.target.value)} /></div>
                        <div><label className="text-sm font-medium">Country</label><Input className="mt-1 border-none input-shadow" value={newCountry} onChange={(e) => setNewCountry(e.target.value)} /></div>
                      </div>
                      <Button variant="hero" className="w-full" onClick={handleAddAddress}>Save Address</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </StorefrontLayout>
  );
};

export default Account;
