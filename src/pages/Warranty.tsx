import { StorefrontLayout } from "@/components/storefront/StorefrontLayout";
import { ShieldCheck } from "lucide-react";

const Warranty = () => (
  <StorefrontLayout>
    <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-20 max-w-3xl">
      <div className="flex items-center gap-3 mb-8">
        <ShieldCheck className="h-8 w-8 text-primary" />
        <h1 className="font-display text-4xl lg:text-5xl">Warranty</h1>
      </div>

      <div className="space-y-8 font-body text-muted-foreground leading-relaxed">
        <section>
          <h2 className="font-display text-xl text-foreground mb-3">Lifetime Structural Warranty</h2>
          <p>
            Every AlgoForge piece comes with a lifetime structural warranty. We guarantee the frame,
            joints, and structural integrity of your furniture for as long as you own it. If a
            structural defect occurs under normal use, we will repair or replace the piece at no cost.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-foreground mb-3">5-Year Finish Warranty</h2>
          <p>
            All wood finishes and upholstery are covered for 5 years against manufacturing defects
            including peeling, cracking, or abnormal fading under normal indoor conditions.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-foreground mb-3">What's Not Covered</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Damage caused by misuse, accidents, or unauthorized modifications</li>
            <li>Normal wear and patina development (this is a feature of natural materials)</li>
            <li>Damage from exposure to extreme temperatures or moisture</li>
            <li>Commercial or outdoor use unless specified</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl text-foreground mb-3">Filing a Claim</h2>
          <p>
            To file a warranty claim, email <span className="text-foreground font-medium">warranty@algoforge.com</span> with
            your order number and photos of the issue. Our team will respond within 2 business days.
          </p>
        </section>
      </div>
    </div>
  </StorefrontLayout>
);

export default Warranty;
