import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import Auth from "./pages/Auth";
import Account from "./pages/Account";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminFinancials from "./pages/admin/AdminFinancials";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminB2B from "./pages/admin/AdminB2B";
import AdminPromos from "./pages/admin/AdminPromos";
import AdminCustomers from "./pages/admin/AdminCustomers";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute requiredRole="manager"><AdminOverview /></ProtectedRoute>} />
          <Route path="/admin/financials" element={<ProtectedRoute requiredRole="manager"><AdminFinancials /></ProtectedRoute>} />
          <Route path="/admin/products" element={<ProtectedRoute requiredRole="manager"><AdminProducts /></ProtectedRoute>} />
          <Route path="/admin/orders" element={<ProtectedRoute requiredRole="manager"><AdminOrders /></ProtectedRoute>} />
          <Route path="/admin/b2b" element={<ProtectedRoute requiredRole="manager"><AdminB2B /></ProtectedRoute>} />
          <Route path="/admin/promos" element={<ProtectedRoute requiredRole="manager"><AdminPromos /></ProtectedRoute>} />
          <Route path="/admin/customers" element={<ProtectedRoute requiredRole="manager"><AdminCustomers /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
