import { Link } from "react-router-dom";

export function StorefrontFooter() {
  return (
    <footer className="border-t border-border/50 bg-card mt-20">
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <h3 className="font-display text-2xl mb-4">AlgoForge</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Heirlooms for the modern workspace. Handcrafted furniture designed to last generations.
            </p>
          </div>

          <div>
            <h4 className="font-body font-semibold text-sm mb-4 uppercase tracking-wider text-muted-foreground">Shop</h4>
            <nav className="flex flex-col gap-2">
              {[
                { label: "Living Room", href: "/shop?room=Living+Room" },
                { label: "Dining Room", href: "/shop?room=Dining+Room" },
                { label: "Office", href: "/shop?room=Office" },
                { label: "Bedroom", href: "/shop?room=Bedroom" },
                { label: "All Products", href: "/shop" },
              ].map((item) => (
                <Link key={item.label} to={item.href} className="text-sm text-foreground/70 hover:text-foreground transition-colors">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h4 className="font-body font-semibold text-sm mb-4 uppercase tracking-wider text-muted-foreground">Company</h4>
            <nav className="flex flex-col gap-2">
              {[
                { label: "About Us", href: "/about" },
                { label: "Sustainability", href: "/sustainability" },
                { label: "Press", href: "/press" },
              ].map((item) => (
                <Link key={item.label} to={item.href} className="text-sm text-foreground/70 hover:text-foreground transition-colors">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h4 className="font-body font-semibold text-sm mb-4 uppercase tracking-wider text-muted-foreground">Support</h4>
            <nav className="flex flex-col gap-2">
              {[
                { label: "Shipping & Returns", href: "/shipping-returns" },
                { label: "Warranty", href: "/warranty" },
                { label: "Care Guide", href: "/care-guide" },
                { label: "Contact Us", href: "/contact" },
              ].map((item) => (
                <Link key={item.label} to={item.href} className="text-sm text-foreground/70 hover:text-foreground transition-colors">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">© 2026 AlgoForge. All rights reserved.</p>
          <div className="flex items-center gap-6">
            {["Privacy Policy", "Terms of Service", "Cookie Settings"].map((item) => (
              <Link key={item} to="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
