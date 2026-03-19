import { StorefrontLayout } from "@/components/storefront/StorefrontLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, Phone, Clock } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

const info = [
  { icon: Mail, label: "Email", value: "hello@algoforge.com" },
  { icon: Phone, label: "Phone", value: "+45 32 12 34 56" },
  { icon: MapPin, label: "Showroom", value: "Bredgade 42, 1260 Copenhagen, Denmark" },
  { icon: Clock, label: "Hours", value: "Mon–Sat 10:00–18:00" },
];

const ContactUs = () => {
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast.success("Message sent! We'll get back to you within 24 hours.");
      (e.target as HTMLFormElement).reset();
    }, 800);
  };

  return (
    <StorefrontLayout>
      <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-20">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="font-display text-4xl lg:text-5xl mb-4">Contact Us</h1>
          <p className="text-muted-foreground font-body text-lg">
            Have a question about an order, a product, or a custom project? We'd love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          <div className="space-y-6">
            {info.map((i) => (
              <div key={i.label} className="flex items-start gap-4">
                <i.icon className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-body font-semibold text-sm">{i.label}</p>
                  <p className="text-sm text-muted-foreground">{i.value}</p>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input placeholder="First name" required />
              <Input placeholder="Last name" required />
            </div>
            <Input type="email" placeholder="Email address" required />
            <Input placeholder="Subject" required />
            <Textarea placeholder="Your message..." rows={5} required />
            <Button type="submit" className="w-full" disabled={sending}>
              {sending ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </div>
      </div>
    </StorefrontLayout>
  );
};

export default ContactUs;
