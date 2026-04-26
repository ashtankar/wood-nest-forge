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
    if (currentUser.email) {
      // 1. Check if the user's email exists in the admin_emails table
      const { data: adminData } = await supabase
        .from("admin_emails")
        .select("email")
        .eq("email", currentUser.email)
        .maybeSingle();

      if (adminData) {
        setRole("admin");
        return;
      }
    }

    // 2. Fallback to standard user_roles table check for customers/others
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", currentUser.id)
      .single();
      
    setRole((data?.role as "admin" | "customer") ?? "customer");
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        fetchRole(s.user);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, s) => {
        setSession(s);
        setUser(s?.user ?? null);
        if (s?.user) {
          fetchRole(s.user);
        } else {
          setRole(null);
        }
        setLoading(false);
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
