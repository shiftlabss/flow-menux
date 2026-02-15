import { AppShell } from "@/components/layout/app-shell";
import { GlobalDrawers } from "@/components/shared/global-drawers";
import { GlobalSearch } from "@/components/shared/global-search";
import { MobileBottomNav } from "@/components/shared/mobile-bottom-nav";
import { IntelligenceProvider } from "@/components/intelligence/intelligence-provider";
import { RouteTransition } from "@/components/layout/route-transition";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell>
      <RouteTransition>{children}</RouteTransition>
      <GlobalDrawers />
      <GlobalSearch />
      <MobileBottomNav />
      <IntelligenceProvider />
    </AppShell>
  );
}
