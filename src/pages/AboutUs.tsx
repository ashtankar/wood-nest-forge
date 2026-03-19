import { StorefrontLayout } from "@/components/storefront/StorefrontLayout";
import { Heart, Hammer, Leaf, Users } from "lucide-react";

const values = [
  { icon: Hammer, title: "Craftsmanship", desc: "Every piece is handcrafted by skilled artisans using time-honored techniques passed down through generations." },
  { icon: Leaf, title: "Sustainability", desc: "We source responsibly harvested wood and use eco-friendly finishes to minimize our environmental footprint." },
  { icon: Heart, title: "Passion", desc: "We believe furniture should be more than functional — it should inspire and bring joy to everyday life." },
  { icon: Users, title: "Community", desc: "We partner with local workshops and support fair labor practices across our entire supply chain." },
];

const AboutUs = () => (
  <StorefrontLayout>
    <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-20">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="font-display text-4xl lg:text-5xl mb-6">About AlgoForge</h1>
        <p className="text-muted-foreground font-body text-lg leading-relaxed">
          Founded in 2018, AlgoForge was born from a simple belief: that the objects we live with should be
          built to last and designed to delight. We create heirloom-quality furniture for the modern home,
          blending traditional craftsmanship with contemporary design.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-20">
        {values.map((v) => (
          <div key={v.title} className="flex gap-4 p-6 rounded-xl border border-border bg-card">
            <v.icon className="h-6 w-6 text-primary shrink-0 mt-1" />
            <div>
              <h3 className="font-body font-semibold mb-1">{v.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="max-w-3xl mx-auto space-y-6 text-muted-foreground font-body leading-relaxed">
        <h2 className="font-display text-2xl text-foreground">Our Story</h2>
        <p>
          What started as a small workshop in Copenhagen has grown into a studio of 40 designers and
          craftspeople. Every piece in our collection is designed in-house and produced in small batches
          to ensure the highest quality.
        </p>
        <p>
          We work exclusively with sustainably sourced European hardwoods — oak, walnut, and ash — and
          finish every surface by hand. Our upholstery fabrics are sourced from heritage mills in Italy
          and Belgium, chosen for their durability and tactile beauty.
        </p>
        <p>
          AlgoForge furniture is made to be lived with, not just looked at. We stand behind every piece
          with our lifetime structural warranty and a commitment to repair rather than replace.
        </p>
      </div>
    </div>
  </StorefrontLayout>
);

export default AboutUs;
