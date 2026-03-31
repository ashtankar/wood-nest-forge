import { StorefrontLayout } from "@/components/storefront/StorefrontLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

const steps = ["Shipping", "Payment", "Review"];

const Checkout = () => {
  const { user } = useAuth();
  const { items: cartItems, clearCart } = useCart();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoValue, setPromoValue] = useState(0);
  const [promoType, setPromoType] = useState<"percentage" | "flat">("percentage");
  const [promoCodeId, setPromoCodeId] = useState<string | null>(null);

  // Shipping form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");

  const subtotal = cartItems.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);
  const discount = promoApplied
    ? promoType === "percentage" ? subtotal * (promoValue / 100) : promoValue
    : 0;
  const tax = (subtotal - discount) * 0.16;
  const total = subtotal - discount + tax;

  const handlePlaceOrder = async () => {
    if (!user) return;
    setLoading(true);

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        subtotal,
        discount,
        tax,
        total,
        promo_code_id: promoCodeId,
        shipping_address: { firstName, lastName, address, city, postalCode, country },
      })
      .select("id")
      .single();

    if (orderError) {
      toast.error("Failed to place order");
      setLoading(false);
      return;
    }

    // Insert order items
    const orderItems = cartItems.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.product.name,
      quantity: item.quantity,
      unit_price: Number(item.product.price),
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
    if (itemsError) {
      toast.error("Failed to save order items");
      setLoading(false);
      return;
    }

    // Clear cart
    await clearCart.mutateAsync();
    queryClient.invalidateQueries({ queryKey: ["orders"] });

    setOrderId(order.id);
    setLoading(false);
    setComplete(true);
  };

  const applyPromo = async () => {
    const { data, error } = await supabase
      .from("promo_codes")
      .select("*")
      .eq("code", promoCode.toUpperCase())
      .eq("active", true)
      .maybeSingle();

    if (error || !data) {
      toast.error("Invalid promo code");
      return;
    }

    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      toast.error("This promo code has expired");
      return;
    }

    setPromoApplied(true);
    setPromoValue(Number(data.value));
    setPromoType(data.type as "percentage" | "flat");
    setPromoCodeId(data.id);
    toast.success(`Promo code applied: ${data.type === "percentage" ? `${data.value}% off` : `€${data.value} off`}`);
  };

  if (complete) {
    return (
      <StorefrontLayout>
        <div className="container mx-auto px-4 max-w-lg py-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.2, 0, 0, 1] }}
            className="text-center space-y-6"
          >
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Check className="h-8 w-8 text-primary" />
            </div>
            <h1 className="font-display text-3xl">Order Confirmed</h1>
            <p className="text-muted-foreground font-body">
              Your tax-compliant invoice has been emailed to your address.
            </p>
            <div className="p-5 rounded-[16px] bg-card card-shadow text-left space-y-2">
              <p className="text-sm"><span className="text-muted-foreground">Order ID:</span> {orderId.slice(0, 8)}</p>
              <p className="text-sm"><span className="text-muted-foreground">Total:</span> <span className="tabular-nums">€{total.toFixed(2)}</span></p>
              <p className="text-sm"><span className="text-muted-foreground">Estimated delivery:</span> 5–7 business days</p>
            </div>
          </motion.div>
        </div>
      </StorefrontLayout>
    );
  }

  if (cartItems.length === 0 && !complete) {
    return (
      <StorefrontLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-display text-3xl">Your cart is empty</h1>
          <p className="text-muted-foreground mt-2">Add some items to proceed to checkout.</p>
        </div>
      </StorefrontLayout>
    );
  }

  return (
    <StorefrontLayout>
      <div className="container mx-auto px-4 max-w-2xl py-8 lg:py-12">
        <h1 className="font-display text-3xl mb-8">Checkout</h1>

        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <button
                onClick={() => i < step && setStep(i)}
                className={`h-8 px-3 rounded-full text-sm font-medium transition-colors ${
                  i === step ? "bg-primary text-primary-foreground" :
                  i < step ? "bg-primary/10 text-primary" :
                  "bg-muted text-muted-foreground"
                }`}
              >
                {s}
              </button>
              {i < steps.length - 1 && <div className="w-8 h-px bg-border" />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
                className="space-y-4"
              >
                {step === 0 && (
                  <>
                    <h2 className="font-display text-xl">Shipping Address</h2>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="text-sm font-medium">First Name</label><Input className="mt-1 border-none input-shadow focus:input-shadow-focus" value={firstName} onChange={(e) => setFirstName(e.target.value)} /></div>
                      <div><label className="text-sm font-medium">Last Name</label><Input className="mt-1 border-none input-shadow focus:input-shadow-focus" value={lastName} onChange={(e) => setLastName(e.target.value)} /></div>
                    </div>
                    <div><label className="text-sm font-medium">Address</label><Input className="mt-1 border-none input-shadow focus:input-shadow-focus" value={address} onChange={(e) => setAddress(e.target.value)} /></div>
                    <div className="grid grid-cols-3 gap-3">
                      <div><label className="text-sm font-medium">City</label><Input className="mt-1 border-none input-shadow focus:input-shadow-focus" value={city} onChange={(e) => setCity(e.target.value)} /></div>
                      <div><label className="text-sm font-medium">Postal Code</label><Input className="mt-1 border-none input-shadow focus:input-shadow-focus" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} /></div>
                      <div><label className="text-sm font-medium">Country</label><Input className="mt-1 border-none input-shadow focus:input-shadow-focus" value={country} onChange={(e) => setCountry(e.target.value)} /></div>
                    </div>
                    <Button variant="hero" className="w-full mt-4" onClick={() => setStep(1)}>Continue to Payment</Button>
                  </>
                )}
                {step === 1 && (
                  <>
                    <h2 className="font-display text-xl">Payment Details</h2>
                    <div><label className="text-sm font-medium">Card Number</label><Input className="mt-1 border-none input-shadow focus:input-shadow-focus tabular-nums" placeholder="4242 4242 4242 4242" /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="text-sm font-medium">Expiry</label><Input className="mt-1 border-none input-shadow focus:input-shadow-focus" placeholder="MM / YY" /></div>
                      <div><label className="text-sm font-medium">CVC</label><Input className="mt-1 border-none input-shadow focus:input-shadow-focus" placeholder="123" /></div>
                    </div>
                    <div className="flex gap-3 mt-4">
                      <Button variant="outline" onClick={() => setStep(0)}>Back</Button>
                      <Button variant="hero" className="flex-1" onClick={() => setStep(2)}>Continue to Review</Button>
                    </div>
                  </>
                )}
                {step === 2 && (
                  <>
                    <h2 className="font-display text-xl">Review Order</h2>
                    <div className="space-y-3">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex gap-3 p-3 rounded-lg bg-card card-shadow">
                          <img src={item.product.image_url} alt={item.product.name} className="w-16 h-16 object-cover rounded-md" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{item.product.name}</p>
                            <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                          </div>
                          <p className="text-sm font-medium tabular-nums">€{(Number(item.product.price) * item.quantity).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-3 mt-4">
                      <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                      <Button variant="hero" className="flex-1" onClick={handlePlaceOrder} disabled={loading}>
                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        {loading ? "Processing…" : "Place Order"}
                      </Button>
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="lg:col-span-2">
            <div className="p-5 rounded-[16px] bg-card card-shadow space-y-3 sticky top-24">
              <h3 className="font-display text-lg">Order Summary</h3>
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{item.product.name} × {item.quantity}</span>
                  <span className="tabular-nums">€{(Number(item.product.price) * item.quantity).toLocaleString()}</span>
                </div>
              ))}
              <div className="border-t pt-3 mt-3">
                <div className="flex gap-2 mb-3">
                  <Input placeholder="Promo code" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} className="border-none input-shadow focus:input-shadow-focus text-sm" />
                  <Button variant="outline" size="sm" onClick={applyPromo}>Apply</Button>
                </div>
                {promoApplied && (
                  <div className="flex justify-between text-sm text-primary mb-1">
                    <span>Discount</span>
                    <span className="tabular-nums">-€{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="tabular-nums">€{(subtotal - discount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (16%)</span>
                  <span className="tabular-nums">€{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium mt-2 pt-2 border-t">
                  <span>Total</span>
                  <span className="tabular-nums">€{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StorefrontLayout>
  );
};

export default Checkout;
