import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, DollarSign, Package, ShoppingCart, Briefcase, Tag, Users, LogOut, Menu, BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
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
  
  // Extract user to display the connected business owner email
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <div className="min-h-screen flex font-sans">
      <aside className={cn("hidden lg:flex flex-col bg-card border-r border-border/50 transition-all duration-300", collapsed ? "w-16" : "w-60")}>
        <div className="h-16 flex items-center px-4 border-b border-border/50">
          {!collapsed && <Link to="/admin" className="font-display text-xl font-semibold tracking-tight">AlgoForge</Link>}
          <Button variant="ghost" size="icon" className={cn("ml-auto", collapsed && "mx-auto")} onClick={() => setCollapsed(!collapsed)}>
            <Menu className="h-4 w-4" />
          </Button>
        </div>
        <nav className="flex-1 py-4 space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link key={item.href} to={item.href} className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors", isActive ? "bg-primary text-primary-foreground font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted")}>
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-3 border-t border-border/50 flex flex-col gap-1">
          {/* Minimalist email display for the business owner */}
          {!collapsed && user?.email && (
            <div className="px-3 py-2 text-xs font-medium text-muted-foreground truncate rounded-md bg-muted/30">
              {user.email}
            </div>
          )}
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted w-full transition-colors mt-1">
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Log Out</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden h-14 flex items-center px-4 border-b border-border/50 bg-card gap-2">
          <Link to="/admin" className="font-display text-lg font-semibold shrink-0">AlgoForge</Link>
          <div className="ml-auto flex items-center gap-1 min-w-0">
            <div className="flex items-center gap-1 overflow-x-auto">
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
            <Button variant="ghost" size="sm" className="shrink-0" onClick={handleLogout}>Log Out</Button>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8 overflow-auto bg-background/95">{children}</main>
      </div>
    </div>
  );
}
