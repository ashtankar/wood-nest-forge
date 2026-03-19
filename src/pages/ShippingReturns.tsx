import { StorefrontLayout } from "@/components/storefront/StorefrontLayout";
import { Truck, RotateCcw } from "lucide-react";

const ShippingReturns = () => (
  <StorefrontLayout>
    <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-20 max-w-3xl">
      <h1 className="font-display text-4xl lg:text-5xl mb-12">Shipping & Returns</h1>

      <div className="space-y-12 font-body text-muted-foreground leading-relaxed">
        <section>
          <div className="flex items-center gap-3 mb-4">
            <Truck className="h-6 w-6 text-primary" />
            <h2 className="font-display text-2xl text-foreground">Shipping</h2>
          </div>
          <div className="space-y-4">
            <p>We offer white-glove delivery to your room of choice, including unpacking and packaging removal.</p>
            <div className="rounded-xl border border-border bg-card p-5 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-foreground font-medium">Denmark</span>
                <span>Free — 5–7 business days</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-foreground font-medium">EU Countries</span>
                <span>€49 — 7–14 business days</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-foreground font-medium">UK & Switzerland</span>
                <span>€89 — 10–18 business days</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-foreground font-medium">Rest of World</span>
                <span>Custom quote — contact us</span>
              </div>
            </div>
            <p className="text-sm">
              Orders are handcrafted after purchase. Production takes 3–5 weeks depending on the piece.
              You'll receive tracking details once your order ships.
            </p>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-4">
            <RotateCcw className="h-6 w-6 text-primary" />
            <h2 className="font-display text-2xl text-foreground">Returns</h2>
          </div>
          <div className="space-y-4">
            <p>
              We want you to love your furniture. If something isn't right, we offer a 30-day return
              policy from the date of delivery.
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Items must be in original condition, free from damage or heavy use.</li>
              <li>Return shipping is arranged by AlgoForge; a flat fee of €79 applies for EU returns.</li>
              <li>Refunds are processed within 5–7 business days of receiving the returned item.</li>
              <li>Custom or made-to-order pieces are final sale and cannot be returned.</li>
            </ul>
            <p className="text-sm">
              To initiate a return, email <span className="text-foreground font-medium">returns@algoforge.com</span> with
              your order number.
            </p>
          </div>
        </section>
      </div>
    </div>
  </StorefrontLayout>
);

export default ShippingReturns;
