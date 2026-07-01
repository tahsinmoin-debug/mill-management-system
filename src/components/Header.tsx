"use client";

import { usePathname } from "next/navigation";
import { Search } from "lucide-react";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/entry": "Production Entry",
  "/machines": "Machine Management",
  "/workers": "Worker Management",
  "/reports/daily": "Daily Report",
  "/reports/monthly": "Monthly Report",
  "/reports/payslip": "Wage Slip / Invoice",
  "/settings/wage-rate": "Wage Rate Settings",
  "/settings/users": "User Management",
};

export default function Header() {
  const pathname = usePathname();
  const title = pageTitles[pathname] || "Dashboard";

  // Build breadcrumb from path
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs = segments.map((seg, i) => ({
    label: seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " "),
    href: "/" + segments.slice(0, i + 1).join("/"),
    isLast: i === segments.length - 1,
  }));

  return (
    <header className="h-16 bg-bg-secondary/80 backdrop-blur-md border-b border-border-primary flex items-center justify-between px-6 shrink-0 no-print">
      <div className="flex flex-col">
        <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
        <div className="flex items-center gap-1.5 text-xs text-text-muted">
          <span className="hover:text-accent-cyan cursor-pointer transition-colors">Home</span>
          {breadcrumbs.map((crumb) => (
            <span key={crumb.href} className="flex items-center gap-1.5">
              <span className="text-border-primary">/</span>
              <span
                className={
                  crumb.isLast
                    ? "text-text-secondary"
                    : "hover:text-accent-cyan cursor-pointer transition-colors"
                }
              >
                {crumb.label}
              </span>
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-bg-card border border-border-primary rounded-lg">
          <Search size={14} className="text-text-muted" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none w-40"
          />
          <kbd className="text-[10px] text-text-muted bg-bg-secondary px-1.5 py-0.5 rounded">
            ⌘K
          </kbd>
        </div>



        {/* Date Display */}
        <div className="hidden sm:block text-xs text-text-muted bg-bg-card px-3 py-1.5 rounded-lg border border-border-primary">
          {new Date().toLocaleDateString("en-GB", {
            weekday: "short",
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </div>
      </div>
    </header>
  );
}
