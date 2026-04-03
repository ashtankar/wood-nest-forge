import { StorefrontLayout } from "@/components/storefront/StorefrontLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const Auth = () => {
  const [tab, setTab] = useState("login");
  const [loginType, setLoginType] = useState<"customer" | "business">("customer");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const navigate = useNavigate();
  const { user, role } = useAuth();

  // Redirect if already logged in
  if (user) {
    if (role === "admin") {
      navigate("/admin", { replace: true });
    } else {
      navigate("/account", { replace: true });
    }
  }

  // Business owners can only log in, not sign up
  const effectiveTab = loginType === "business" ? "login" : tab;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Welcome back!");
    // AuthContext will update; redirect handled by useEffect or next render
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Account created! Check your email to confirm.");
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) toast.error(error.message);
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error("Enter your email first");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth`,
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password reset link sent to your email");
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

          <div className="p-6 rounded-[20px] bg-card card-shadow">
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="w-full bg-muted rounded-full h-10 p-1">
                <TabsTrigger value="login" className="flex-1 rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm text-sm">Log In</TabsTrigger>
                <TabsTrigger value="signup" className="flex-1 rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm text-sm">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="mt-6 space-y-4">
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <Input type="email" className="mt-1 border-none input-shadow focus:input-shadow-focus" placeholder="you@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Password</label>
                    <Input type="password" className="mt-1 border-none input-shadow focus:input-shadow-focus" placeholder="••••••••" required value={password} onChange={(e) => setPassword(e.target.value)} />
                  </div>
                  <button type="button" onClick={handleForgotPassword} className="text-xs text-primary hover:underline">
                    Forgot password?
                  </button>
                  <Button variant="hero" className="w-full" disabled={loading}>
                    {loading ? "Please wait…" : "Log In"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="mt-6 space-y-4">
                  <div>
                    <label className="text-sm font-medium">Full Name</label>
                    <Input className="mt-1 border-none input-shadow focus:input-shadow-focus" placeholder="Sarah Mitchell" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <Input type="email" className="mt-1 border-none input-shadow focus:input-shadow-focus" placeholder="you@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Password</label>
                    <Input type="password" className="mt-1 border-none input-shadow focus:input-shadow-focus" placeholder="••••••••" required value={password} onChange={(e) => setPassword(e.target.value)} />
                  </div>
                  <Button variant="hero" className="w-full" disabled={loading}>
                    {loading ? "Please wait…" : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-4">
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
                <div className="relative flex justify-center text-xs"><span className="bg-card px-2 text-muted-foreground">or</span></div>
              </div>
              <Button variant="outline" className="w-full" onClick={handleGoogleLogin}>
                Continue with Google
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </StorefrontLayout>
  );
};

export default Auth;
