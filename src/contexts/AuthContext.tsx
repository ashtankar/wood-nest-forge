import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: "admin" | "customer" | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  role: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<"admin" | "customer" | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRole = async (currentUser: User) => {
    console.log(`[Auth] Checking admin status for user_id: ${currentUser.id}`);
    
    // 1. Check admin_emails table strictly by user_id
    const { data: adminData, error: adminError } = await supabase
      .from("admin_emails")
      .select("user_id")
      .eq("user_id", currentUser.id)
      .maybeSingle();

    console.log("[Auth] Admin table result:", { adminData, adminError });

    if (adminData) {
      console.log("[Auth] Success: User verified as Admin via user_id!");
      setRole("admin");
      return;
    }

    // 2. Fallback to standard user_roles check for standard customers
    const { data: roleData, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", currentUser.id)
      .maybeSingle(); 
      
    console.log("[Auth] Fallback user_roles result:", { roleData, roleError });
    setRole((roleData?.role as "admin" | "customer") ?? "customer");
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        fetchRole(s.user).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, s) => {
        setSession(s);
        setUser(s?.user ?? null);
        if (s?.user) {
          fetchRole(s.user).finally(() => setLoading(false));
        } else {
          setRole(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, role, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
