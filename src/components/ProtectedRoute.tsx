import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

export function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode; requiredRole?: "manager" | "customer" }) {
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem("algoforge_logged_in") === "true");
  const role = localStorage.getItem("algoforge_user_role");

  useEffect(() => {
    const handler = () => setIsLoggedIn(localStorage.getItem("algoforge_logged_in") === "true");
    window.addEventListener("auth-change", handler);
    return () => window.removeEventListener("auth-change", handler);
  }, []);

  if (!isLoggedIn) return <Navigate to="/auth" replace />;
  if (requiredRole && role !== requiredRole) return <Navigate to="/" replace />;
  return <>{children}</>;
}
