import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  DollarSign,
  Package,
  ShoppingCart,
  Briefcase,
  Tag,
  Users,
  LogOut,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const navItems = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Financials", href: "/admin/financials", icon: DollarSign },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "B2B Catalog", href: "/admin/b2b", icon: Briefcase },
  { label: "Promos", href: "/admin/promos", icon: Tag },
  { label: "Customers", href: "/admin/customers", icon: Users },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col bg-card border-r border-border/50 transition-all duration-300",
          collapsed ? "w-16" : "w-60"
        )}
      >
        <div className="h-16 flex items-center px-4 border-b border-border/50">
          {!collapsed && (
            <Link to="/admin" className="font-display text-xl">AlgoForge</Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={cn("ml-auto", collapsed && "mx-auto")}
            onClick={() => setCollapsed(!collapsed)}
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>

        <nav className="flex-1 py-4 space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body transition-colors",
                  isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-2 border-t border-border/50">
          <button
            onClick={() => { toast.info("Logged out"); navigate("/"); }}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted w-full transition-colors"
            )}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Log Out</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden h-14 flex items-center px-4 border-b border-border/50 bg-card">
          <Link to="/admin" className="font-display text-lg">AlgoForge</Link>
          <div className="ml-auto flex items-center gap-1 overflow-x-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link key={item.href} to={item.href}>
                  <Button variant={isActive ? "default" : "ghost"} size="icon" className="h-9 w-9 shrink-0">
                    <item.icon className="h-4 w-4" />
                  </Button>
                </Link>
              );
            })}
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
