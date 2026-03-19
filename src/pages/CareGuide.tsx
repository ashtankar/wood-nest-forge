import { StorefrontLayout } from "@/components/storefront/StorefrontLayout";

const sections = [
  {
    title: "Solid Wood",
    tips: [
      "Dust regularly with a soft, dry cloth following the grain direction.",
      "Clean spills immediately with a damp cloth, then dry thoroughly.",
      "Avoid placing in direct sunlight to prevent uneven fading.",
      "Re-oil surfaces every 6–12 months with a natural furniture oil for oiled finishes.",
      "Use coasters and trivets to protect from heat and moisture rings.",
    ],
  },
  {
    title: "Upholstery & Bouclé",
    tips: [
      "Vacuum weekly with a soft brush attachment to prevent dust buildup.",
      "Blot spills immediately — never rub, as this can spread the stain.",
      "Rotate and flip cushions monthly for even wear.",
      "Professional cleaning is recommended annually for light-colored fabrics.",
      "Keep away from direct heat sources and sunlight.",
    ],
  },
  {
    title: "Brass & Metal Hardware",
    tips: [
      "Wipe with a soft, dry cloth to maintain luster.",
      "Unlacquered brass will develop a natural patina over time — this is intentional.",
      "To restore shine, use a gentle brass polish sparingly.",
      "Avoid abrasive cleaners or steel wool.",
    ],
  },
  {
    title: "Leather",
    tips: [
      "Wipe with a damp cloth and mild soap when needed.",
      "Condition with a leather balm every 3–6 months.",
      "Keep away from direct sunlight and heat to prevent drying and cracking.",
      "Leather develops a rich patina with age — embrace the character.",
    ],
  },
];

const CareGuide = () => (
  <StorefrontLayout>
    <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-20 max-w-3xl">
      <h1 className="font-display text-4xl lg:text-5xl mb-4">Care Guide</h1>
      <p className="text-muted-foreground font-body text-lg mb-12">
        With proper care, your AlgoForge furniture will age beautifully for decades.
      </p>

      <div className="space-y-10">
        {sections.map((s) => (
          <section key={s.title}>
            <h2 className="font-display text-xl text-foreground mb-4">{s.title}</h2>
            <ul className="space-y-2">
              {s.tips.map((tip) => (
                <li key={tip} className="flex items-start gap-2 text-sm text-muted-foreground font-body leading-relaxed">
                  <span className="text-primary mt-1">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  </StorefrontLayout>
);

export default CareGuide;
