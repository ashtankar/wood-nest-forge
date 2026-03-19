import { StorefrontLayout } from "@/components/storefront/StorefrontLayout";
import { ExternalLink } from "lucide-react";

const mentions = [
  { outlet: "Wallpaper*", title: "AlgoForge: The New Guard of Scandinavian Furniture", date: "February 2026" },
  { outlet: "Dezeen", title: "Copenhagen Studio Blends Craft and Contemporary Design", date: "January 2026" },
  { outlet: "Monocle", title: "The Workshops Keeping European Woodworking Alive", date: "November 2025" },
  { outlet: "Architectural Digest", title: "10 Furniture Brands Worth Investing In", date: "September 2025" },
  { outlet: "Financial Times — HTSI", title: "Heirloom Furniture for the Modern Home", date: "June 2025" },
];

const Press = () => (
  <StorefrontLayout>
    <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-20 max-w-3xl">
      <h1 className="font-display text-4xl lg:text-5xl mb-4">Press</h1>
      <p className="text-muted-foreground font-body text-lg mb-12">
        For press inquiries, contact <span className="text-foreground font-medium">press@algoforge.com</span>
      </p>

      <div className="space-y-6">
        {mentions.map((m) => (
          <div key={m.title} className="flex items-start justify-between gap-4 p-5 rounded-xl border border-border bg-card group hover:border-primary/30 transition-colors">
            <div>
              <p className="text-xs font-body font-semibold uppercase tracking-wider text-primary mb-1">{m.outlet}</p>
              <p className="font-body font-medium text-foreground">{m.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{m.date}</p>
            </div>
            <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
          </div>
        ))}
      </div>
    </div>
  </StorefrontLayout>
);

export default Press;
