import { StorefrontLayout } from "@/components/storefront/StorefrontLayout";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ShieldCheck, User as UserIcon } from "lucide-react";

const BUSINESS_INTENT_KEY = "auth_intent_business";

const GoogleIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1-3.31 0-6-2.74-6-6.1s2.69-6.1 6-6.1c1.88 0 3.14.8 3.86 1.49l2.63-2.54C16.84 3.46 14.66 2.5 12 2.5 6.76 2.5 2.5 6.76 2.5 12s4.26 9.5 9.5 9.5c5.49 0 9.12-3.86 9.12-9.29 0-.62-.07-1.1-.16-1.51H12z"/>
  </svg>
);

const Auth = () => {
  const [loginType, setLoginType] = useState<"customer" | "business">("customer");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, role, loading: authLoading } = useAuth();

  // Enforce business-only access after OAuth callback
  useEffect(() => {
    if (authLoading || !user) return;
    const wantedBusiness = sessionStorage.getItem(BUSINESS_INTENT_KEY) === "1";

    if (wantedBusiness && role !== "admin") {
      sessionStorage.removeItem(BUSINESS_INTENT_KEY);
      toast.error("This Google account is not authorized for business owner access.");
      supabase.auth.signOut();
      return;
    }

    sessionStorage.removeItem(BUSINESS_INTENT_KEY);

    if (role === "admin") {
      navigate("/admin", { replace: true });
    } else if (role === "customer") {
      navigate("/account", { replace: true });
    }
  }, [user, role, authLoading, navigate]);

  const handleGoogleLogin = async (intent: "customer" | "business") => {
    setLoading(true);
    if (intent === "business") {
      sessionStorage.setItem(BUSINESS_INTENT_KEY, "1");
    } else {
      sessionStorage.removeItem(BUSINESS_INTENT_KEY);
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth` },
    });
    if (error) {
      setLoading(false);
      toast.error(error.message);
    }
  };

  return (
    <StorefrontLayout>
      <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.2, 0, 0, 1] }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl">Welcome</h1>
            <p className="text-muted-foreground font-body mt-1">Sign in to your AlgoForge account</p>
          </div>

          {/* Login type selector */}
          <div className="flex gap-2 mb-4">
            <Button
              variant={loginType === "customer" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setLoginType("customer")}
            >
              <UserIcon className="h-4 w-4 mr-2" />
              Customer
            </Button>
            <Button
              variant={loginType === "business" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setLoginType("business")}
            >
              <ShieldCheck className="h-4 w-4 mr-2" />
              Business Owner
            </Button>
          </div>

          <div className="p-6 rounded-[20px] bg-card card-shadow space-y-5">
            {loginType === "customer" ? (
              <>
                <div className="text-center">
                  <h2 className="font-display text-xl">Customer sign in</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Continue with your Google account to shop, track orders, and manage your wishlist.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleGoogleLogin("customer")}
                  disabled={loading}
                >
                  <GoogleIcon />
                  <span className="ml-2">{loading ? "Redirecting…" : "Continue with Google"}</span>
                </Button>
              </>
            ) : (
              <>
                <div className="text-center">
                  <h2 className="font-display text-xl">Business owner sign in</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Restricted to authorized accounts. Only Google emails approved by an administrator can access the business dashboard.
                  </p>
                </div>
                <Button
                  variant="hero"
                  className="w-full"
                  onClick={() => handleGoogleLogin("business")}
                  disabled={loading}
                >
                  <GoogleIcon />
                  <span className="ml-2">{loading ? "Redirecting…" : "Continue with Google (Business)"}</span>
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Not authorized? Contact your administrator to add your Google email to the approved list.
                </p>
              </>
            )}
          </div>

          <p className="text-xs text-muted-foreground text-center mt-6">
            By continuing you agree to our Terms of Service and Privacy Policy.
          </p>
        </motion.div>
      </div>
    </StorefrontLayout>
  );
};

export default Auth;
