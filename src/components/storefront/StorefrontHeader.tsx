import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingBag, Heart, Menu, Search, X, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useRef } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { CartDrawer } from "./CartDrawer";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/hooks/useCart";
import { useProducts } from "@/hooks/useProducts";

const navLinks = [
  { label: "Shop", href: "/shop", room: null },
  { label: "Living Room", href: "/shop?room=Living+Room", room: "Living Room" },
  { label: "Dining", href: "/shop?room=Dining+Room", room: "Dining Room" },
  { label: "Office", href: "/shop?room=Office", room: "Office" },
  { label: "Bedroom", href: "/shop?room=Bedroom", room: "Bedroom" },
];

export function StorefrontHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, signOut } = useAuth();
  const { items: cartItems } = useCart();
  const { data: products } = useProducts();
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const isAuthPage = location.pathname === "/auth";

  const searchResults = searchQuery.trim().length > 0 && products
    ? products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.room.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Mobile menu */}
          {!isAuthPage && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 bg-background">
                <nav className="flex flex-col gap-4 mt-8">
                  {navLinks.map((link) => (
                    <Link key={link.href} to={link.href} className="text-lg font-body text-foreground/80 hover:text-foreground transition-colors">
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          )}

          {/* Logo */}
          <Link to="/" className="font-display text-2xl lg:text-3xl tracking-tight text-foreground">
            AlgoForge
          </Link>

          {/* Desktop nav */}
          {!isAuthPage && (
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`text-sm font-body tracking-wide transition-colors hover:text-foreground ${
                    location.pathname + location.search === link.href ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}

          {/* Actions */}
          <div className="flex items-center gap-1.5 md:gap-2">
            {!isAuthPage && (
              <>
                <Button variant="ghost" size="icon" onClick={() => { setSearchOpen(!searchOpen); setSearchQuery(""); }}>
                  <Search className="h-5 w-5" />
                </Button>

                {/* WhatsApp Chat Button */}
                <a 
                  href="https://wa.me/918653450123?text=Hi%20AlgoForge!%20I%20am%20interested%20in%20your%20furniture%20collection%20and%20would%20like%20to%20know%20more." 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full shadow-sm hover:shadow-md transition-all duration-200 mx-1"
                  title="Chat with us on WhatsApp"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  <span className="text-xs font-semibold hidden lg:block tracking-wide">Chat with us</span>
                </a>
              </>
            )}

            {user ? (
              <>
                {role === "admin" && (
                  <Link to="/admin">
                    <Button variant="outline" size="sm" className="text-sm font-body gap-1.5 hidden md:inline-flex border-border/50 bg-background hover:bg-muted">
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Button>
                    <Button variant="ghost" size="icon" className="md:hidden" aria-label="Dashboard">
                      <LayoutDashboard className="h-5 w-5" />
                    </Button>
                  </Link>
                )}
                <Link to="/account?tab=wishlist">
                  <Button variant="ghost" size="icon">
                    <Heart className="h-5 w-5" />
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-sm font-body hidden sm:inline-flex">
                  Logout
                </Button>
                <Button variant="ghost" size="icon" className="relative" onClick={() => setCartOpen(true)}>
                  <ShoppingBag className="h-5 w-5" />
                  {cartItems.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-medium shadow-sm">
                      {cartItems.reduce((s, i) => s + i.quantity, 0)}
                    </span>
                  )}
                </Button>
              </>
            ) : !isAuthPage ? (
              <Link to="/auth">
                <Button variant="ghost" size="sm" className="text-sm font-body font-medium">
                  Login
                </Button>
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      {user && <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />}

      {/* Search overlay */}
      {searchOpen && (
        <div className="absolute top-full left-0 right-0 bg-background/95 backdrop-blur-md border-b border-border shadow-lg z-50 animate-in slide-in-from-top-2 duration-200">
          <div className="container mx-auto px-4 lg:px-8 py-4">
            <div className="flex items-center gap-3">
              <Search className="h-5 w-5 text-muted-foreground shrink-0" />
              <Input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, categories, or rooms..."
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base lg:text-lg bg-transparent h-12"
                onKeyDown={(e) => {
                  if (e.key === "Escape") { setSearchOpen(false); setSearchQuery(""); }
                }}
              />
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted/50" onClick={() => { setSearchOpen(false); setSearchQuery(""); }}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            {searchResults.length > 0 && (
              <div className="mt-4 border-t border-border/50 pt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {searchResults.map((product) => (
                  <Link
                    key={product.id}
                    to={`/product/${product.slug}`}
                    onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors border border-transparent hover:border-border/50"
                  >
                    <img src={product.image_url || "/placeholder.svg"} alt={product.name} className="w-14 h-14 rounded-lg object-cover shadow-sm" />
                    <div>
                      <p className="text-sm font-semibold text-foreground line-clamp-1">{product.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">₹{product.price.toLocaleString()}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            {searchQuery.trim().length > 0 && searchResults.length === 0 && (
              <div className="mt-8 text-center pb-4">
                <p className="text-muted-foreground">No products found matching "{searchQuery}"</p>
                <Button variant="link" onClick={() => { setSearchOpen(false); setSearchQuery(""); }} className="mt-2 text-primary">Clear search</Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
