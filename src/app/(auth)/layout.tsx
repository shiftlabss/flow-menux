import { AppShell } from "@/components/layout/app-shell";
import { GlobalDrawers } from "@/components/shared/global-drawers";
import { GlobalSearch } from "@/components/shared/global-search";
import { HelpButton } from "@/components/shared/help-button";
import { MobileBottomNav } from "@/components/shared/mobile-bottom-nav";
import { OnboardingChecklist } from "@/components/shared/onboarding-checklist";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell>
      {children}
      <GlobalDrawers />
      <GlobalSearch />
      <HelpButton />
      <MobileBottomNav />
      <OnboardingChecklist />
    </AppShell>
  );
}
