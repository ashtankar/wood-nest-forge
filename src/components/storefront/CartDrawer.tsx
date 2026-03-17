import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Minus, Plus, X } from "lucide-react";
import { Link } from "react-router-dom";
import { products } from "@/data/products";

const cartItems = [
  { product: products[0], qty: 1 },
  { product: products[4], qty: 2 },
];

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.qty, 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md bg-background flex flex-col">
        <SheetHeader>
          <SheetTitle className="font-display text-xl">Your Cart</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {cartItems.map((item) => (
            <div key={item.product.id} className="flex gap-4 p-3 rounded-lg bg-card card-shadow">
              <img
                src={item.product.image}
                alt={item.product.name}
                className="w-20 h-20 object-cover rounded-md"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-body font-medium text-sm truncate">{item.product.name}</h4>
                <p className="text-muted-foreground text-sm tabular-nums">
                  €{item.product.price.toLocaleString()}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Button variant="outline" size="icon" className="h-7 w-7">
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="text-sm tabular-nums w-6 text-center">{item.qty}</span>
                  <Button variant="outline" size="icon" className="h-7 w-7">
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7 self-start">
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="border-t pt-4 space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium tabular-nums">€{subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Shipping</span>
            <span className="text-muted-foreground">Calculated at checkout</span>
          </div>
          <Link to="/checkout" onClick={() => onOpenChange(false)}>
            <Button variant="hero" className="w-full mt-2">
              Proceed to Checkout
            </Button>
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
