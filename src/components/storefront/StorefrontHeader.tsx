import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingBag, Heart, LogIn, LogOut, Menu, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useRef } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { CartDrawer } from "./CartDrawer";
import { toast } from "sonner";
import { products } from "@/data/products";

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
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem("algoforge_logged_in") === "true");

  const searchResults = searchQuery.trim().length > 0
    ? products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.room.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    const handler = () => setIsLoggedIn(localStorage.getItem("algoforge_logged_in") === "true");
    window.addEventListener("storage", handler);
    window.addEventListener("auth-change", handler);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("auth-change", handler);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("algoforge_logged_in");
    localStorage.removeItem("algoforge_user_role");
    window.dispatchEvent(new Event("auth-change"));
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 bg-background">
              <nav className="flex flex-col gap-4 mt-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="text-lg font-body text-foreground/80 hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link to="/" className="font-display text-2xl lg:text-3xl tracking-tight text-foreground">
            AlgoForge
          </Link>

          {/* Desktop nav */}
          {location.pathname !== "/auth" && (
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
          <div className="flex items-center gap-1">
            {location.pathname !== "/auth" && (
              <Button variant="ghost" size="icon" onClick={() => { setSearchOpen(!searchOpen); setSearchQuery(""); }}>
                <Search className="h-5 w-5" />
              </Button>
            )}

            {isLoggedIn ? (
              <>
                <Link to="/account?tab=wishlist">
                  <Button variant="ghost" size="icon">
                    <Heart className="h-5 w-5" />
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-sm font-body">
                  Logout
                </Button>
              </>
            ) : location.pathname !== "/auth" ? (
              <Link to="/auth">
                <Button variant="ghost" size="sm" className="text-sm font-body">
                  Login
                </Button>
              </Link>
            ) : null}

            {location.pathname !== "/auth" && isLoggedIn && (
              <Button variant="ghost" size="icon" className="relative" onClick={() => setCartOpen(true)}>
                <ShoppingBag className="h-5 w-5" />
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-accent text-accent-foreground text-[10px] flex items-center justify-center font-medium">
                  2
                </span>
              </Button>
            )}
          </div>
        </div>
      </div>

      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />

      {/* Search overlay */}
      {searchOpen && (
        <div className="absolute top-full left-0 right-0 bg-background border-b border-border shadow-lg z-50">
          <div className="container mx-auto px-4 lg:px-8 py-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground shrink-0" />
              <Input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
                onKeyDown={(e) => {
                  if (e.key === "Escape") { setSearchOpen(false); setSearchQuery(""); }
                }}
              />
              <Button variant="ghost" size="icon" onClick={() => { setSearchOpen(false); setSearchQuery(""); }}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            {searchResults.length > 0 && (
              <div className="mt-3 border-t border-border pt-3 space-y-1">
                {searchResults.map((product) => (
                  <Link
                    key={product.id}
                    to={`/product/${product.id}`}
                    onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-muted transition-colors"
                  >
                    <img src={product.image} alt={product.name} className="w-10 h-10 rounded object-cover" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{product.name}</p>
                      <p className="text-xs text-muted-foreground">€{product.price}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            {searchQuery.trim().length > 0 && searchResults.length === 0 && (
              <p className="mt-3 text-sm text-muted-foreground">No products found.</p>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
