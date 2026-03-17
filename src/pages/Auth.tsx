import { StorefrontLayout } from "@/components/storefront/StorefrontLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";

const Auth = () => {
  const [tab, setTab] = useState("login");
  const [role, setRole] = useState<"customer" | "manager">("customer");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (role === "manager") {
        toast.success("Welcome back, Manager");
        navigate("/admin");
      } else {
        toast.success("Welcome to AlgoForge");
        navigate("/account");
      }
    }, 1000);
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
            {/* Role Selector */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setRole("customer")}
                className={`flex-1 py-2 rounded-full text-sm font-medium transition-colors ${
                  role === "customer" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                Customer
              </button>
              <button
                onClick={() => setRole("manager")}
                className={`flex-1 py-2 rounded-full text-sm font-medium transition-colors ${
                  role === "manager" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                Business Manager
              </button>
            </div>

            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="w-full bg-muted rounded-full h-10 p-1">
                <TabsTrigger value="login" className="flex-1 rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm text-sm">Log In</TabsTrigger>
                <TabsTrigger value="signup" className="flex-1 rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm text-sm">Sign Up</TabsTrigger>
              </TabsList>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <TabsContent value="signup" className="mt-0 space-y-4">
                  <div>
                    <label className="text-sm font-medium">Full Name</label>
                    <Input className="mt-1 border-none input-shadow focus:input-shadow-focus" placeholder="Sarah Mitchell" />
                  </div>
                </TabsContent>

                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input type="email" className="mt-1 border-none input-shadow focus:input-shadow-focus" placeholder="you@example.com" required />
                </div>

                <div>
                  <label className="text-sm font-medium">Password</label>
                  <Input type="password" className="mt-1 border-none input-shadow focus:input-shadow-focus" placeholder="••••••••" required />
                </div>

                {tab === "signup" && role === "manager" && (
                  <div>
                    <label className="text-sm font-medium">Company Name</label>
                    <Input className="mt-1 border-none input-shadow focus:input-shadow-focus" placeholder="Studio ABC" />
                  </div>
                )}

                <Button variant="hero" className="w-full" disabled={loading}>
                  {loading ? "Please wait…" : tab === "login" ? "Log In" : "Create Account"}
                </Button>
              </form>
            </Tabs>
          </div>
        </motion.div>
      </div>
    </StorefrontLayout>
  );
};

export default Auth;
