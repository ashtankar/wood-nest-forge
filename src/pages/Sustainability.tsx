import { StorefrontLayout } from "@/components/storefront/StorefrontLayout";
import { Leaf, Recycle, TreePine, Droplets } from "lucide-react";

const pillars = [
  { icon: TreePine, title: "Responsibly Sourced", desc: "100% of our wood comes from FSC-certified forests in Scandinavia and Central Europe." },
  { icon: Droplets, title: "Low-VOC Finishes", desc: "We use water-based, low-VOC finishes that are safe for your home and the planet." },
  { icon: Recycle, title: "Zero-Waste Workshop", desc: "Wood offcuts are repurposed into accessories or donated to local schools for woodworking programs." },
  { icon: Leaf, title: "Carbon Neutral Shipping", desc: "We offset 100% of shipping emissions through verified reforestation projects." },
];

const Sustainability = () => (
  <StorefrontLayout>
    <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-20">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="font-display text-4xl lg:text-5xl mb-6">Sustainability</h1>
        <p className="text-muted-foreground font-body text-lg leading-relaxed">
          Building furniture that lasts generations is inherently sustainable. But we go further —
          every decision we make considers the impact on people and the planet.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
        {pillars.map((p) => (
          <div key={p.title} className="flex gap-4 p-6 rounded-xl border border-border bg-card">
            <p.icon className="h-6 w-6 text-primary shrink-0 mt-1" />
            <div>
              <h3 className="font-body font-semibold mb-1">{p.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="max-w-3xl mx-auto space-y-6 text-muted-foreground font-body leading-relaxed">
        <h2 className="font-display text-2xl text-foreground">Our Commitment</h2>
        <p>
          By 2027, we aim to be fully circular — offering take-back programs for every product we sell.
          Returned furniture will be refurbished and resold through our Second Life collection, or
          responsibly recycled.
        </p>
        <p>
          We publish an annual sustainability report detailing our progress, carbon footprint, and
          goals. Transparency isn't optional — it's foundational to how we operate.
        </p>
      </div>
    </div>
  </StorefrontLayout>
);

export default Sustainability;
