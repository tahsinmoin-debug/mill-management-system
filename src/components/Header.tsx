"use client";

import { usePathname } from "next/navigation";
import { useLang } from "@/lib/i18n";

const pageTitleKeys: Record<string, string> = {
  "/dashboard": "header.dashboard",
  "/entry": "header.entry",
  "/machines": "header.machines",
  "/workers": "header.workers",
  "/reports/daily": "header.reports.daily",
  "/reports/monthly": "header.reports.monthly",
  "/reports/yearly": "header.reports.yearly",
  "/reports/payslip": "header.reports.payslip",
  "/settings/wage-rate": "header.settings.wage",
  "/settings/users": "header.settings.users",
};

export default function Header() {
  const pathname = usePathname();
  const { t, lang } = useLang();
  const titleKey = pageTitleKeys[pathname] || "header.dashboard";
  const title = t(titleKey as any);

  return (
    <header className="h-14 bg-bg-sidebar/80 backdrop-blur-md border-b border-border-primary flex items-center justify-between px-6 shrink-0 no-print">
      <h2 className="text-lg font-semibold text-text-primary">{title}</h2>

      {/* Date Display */}
      <div className="hidden sm:block text-xs text-text-muted bg-bg-card px-3 py-1.5 rounded-lg border border-border-primary">
        {new Date().toLocaleDateString(lang === "bn" ? "bn-BD" : "en-GB", {
          weekday: "short",
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}
      </div>
    </header>
  );
}
