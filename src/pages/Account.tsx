import { StorefrontLayout } from "@/components/storefront/StorefrontLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { products, orders } from "@/data/products";
import { ProductCard } from "@/components/storefront/ProductCard";
import { Download, MapPin, Package, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useSearchParams, useNavigate } from "react-router-dom";

const savedAddresses = [
  { id: "1", label: "Home", address: "123 Design Street, Berlin 10115, Germany" },
  { id: "2", label: "Studio", address: "45 Creative Hub, Munich 80331, Germany" },
];

const wishlistItems = products.slice(0, 3);

const Account = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const activeTab = searchParams.get("tab") || "orders";

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  const handleLogout = () => {
    localStorage.removeItem("algoforge_logged_in");
    localStorage.removeItem("algoforge_user_role");
    window.dispatchEvent(new Event("auth-change"));
    toast.success("Logged out");
    navigate("/");
  };

  return (
    <StorefrontLayout>
      <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl">My Account</h1>
            <p className="text-muted-foreground font-body mt-1">Sarah Mitchell · sarah@example.com</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>Log Out</Button>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="bg-muted rounded-full h-10 p-1 mb-8 flex-wrap">
            <TabsTrigger value="orders" className="rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm text-sm">Orders</TabsTrigger>
            <TabsTrigger value="wishlist" className="rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm text-sm">Wishlist</TabsTrigger>
            <TabsTrigger value="addresses" className="rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm text-sm">Addresses</TabsTrigger>
          </TabsList>

          {/* Orders */}
          <TabsContent value="orders">
            <div className="space-y-4">
              {orders.slice(0, 3).map((order) => (
                <div key={order.id} className="p-5 rounded-[16px] bg-card card-shadow">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="font-medium">{order.id}</p>
                      <p className="text-sm text-muted-foreground">{order.date}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {order.items.map((item, i) => (
                          <span key={i} className="text-xs bg-muted px-2 py-1 rounded-full">{item.name} × {item.qty}</span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium tabular-nums">€{order.total.toLocaleString()}</p>
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
                    {order.trackingLink && (
                      <Button variant="outline" size="sm" onClick={() => toast.info("Opening tracking page…")}>
                        <Package className="h-3.5 w-3.5 mr-1" /> Track
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => toast.success("Invoice downloaded")}>
                      <Download className="h-3.5 w-3.5 mr-1" /> Invoice
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Wishlist */}
          <TabsContent value="wishlist">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {wishlistItems.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          </TabsContent>

          {/* Addresses */}
          <TabsContent value="addresses">
            <div className="space-y-4 max-w-lg">
              {savedAddresses.map((addr) => (
                <div key={addr.id} className="p-4 rounded-[16px] bg-card card-shadow flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{addr.label}</p>
                    <p className="text-sm text-muted-foreground">{addr.address}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast.info("Address removed")}>
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" onClick={() => toast.info("Address form would open")}>
                <MapPin className="h-4 w-4 mr-2" /> Add New Address
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </StorefrontLayout>
  );
};

export default Account;
