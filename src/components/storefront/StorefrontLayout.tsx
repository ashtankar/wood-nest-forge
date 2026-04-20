import { StorefrontHeader } from "./StorefrontHeader";
import { StorefrontFooter } from "./StorefrontFooter";
import { ChatWidget } from "./ChatWidget";

export function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <StorefrontHeader />
      <main className="flex-1">{children}</main>
      <StorefrontFooter />
      <ChatWidget />
    </div>
  );
}
