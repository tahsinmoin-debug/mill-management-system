"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { getSession, signOut } from "next-auth/react";
import { useLang } from "@/lib/i18n";
import {
  LayoutDashboard,
  ClipboardEdit,
  Settings2,
  Factory,
  Users,
  FileBarChart,
  FileText,
  Receipt,
  Calendar,
  DollarSign,
  UserCog,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Globe,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["reports", "settings"]);
  const [user, setUser] = useState<any>(null);
  const { t, lang, setLang } = useLang();

  useEffect(() => {
    getSession().then((session) => {
      if (session?.user) setUser(session.user);
    });
  }, []);

  const navItems = [
    { key: "dashboard", label: t("nav.dashboard"), href: "/dashboard", icon: LayoutDashboard },
    { key: "entry", label: t("nav.entry"), href: "/entry", icon: ClipboardEdit },
    { key: "machines", label: t("nav.machines"), href: "/machines", icon: Factory },
    { key: "workers", label: t("nav.workers"), href: "/workers", icon: Users },
    {
      key: "reports",
      label: t("nav.reports"),
      icon: FileBarChart,
      children: [
        { label: t("nav.reports.daily"), href: "/reports/daily", icon: FileText },
        { label: t("nav.reports.monthly"), href: "/reports/monthly", icon: FileBarChart },
        { label: t("nav.reports.yearly"), href: "/reports/yearly", icon: Calendar },
        { label: t("nav.reports.payslip"), href: "/reports/payslip", icon: Receipt },
      ],
    },
    {
      key: "settings",
      label: t("nav.settings"),
      icon: Settings2,
      adminOnly: true,
      children: [
        { label: t("nav.settings.wage"), href: "/settings/wage-rate", icon: DollarSign },
        { label: t("nav.settings.users"), href: "/settings/users", icon: UserCog },
      ],
    },
  ];

  const toggleGroup = (key: string) => {
    setExpandedGroups((prev) =>
      prev.includes(key)
        ? prev.filter((g) => g !== key)
        : [...prev, key]
    );
  };

  const isActive = (href: string) => pathname === href;

  const renderNav = () => (
    <nav className="flex flex-col gap-1 px-3 py-4">
      {navItems.map((item) => {
        if (item.adminOnly && user?.role !== "ADMIN") return null;

        if (item.children) {
          const isGroupExpanded = expandedGroups.includes(item.key);
          const hasActiveChild = item.children.some((c) => isActive(c.href));

          return (
            <div key={item.key}>
              <button
                onClick={() => toggleGroup(item.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${hasActiveChild ? "text-accent-cyan" : "text-text-secondary hover:text-text-primary hover:bg-bg-card"}`}
              >
                <item.icon size={18} />
                <span className="flex-1 text-left">{item.label}</span>
                {item.adminOnly && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent-purple/15 text-accent-purple font-semibold">
                    ADMIN
                  </span>
                )}
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${isGroupExpanded ? "rotate-180" : ""}`}
                />
              </button>

              <div
                className={`overflow-hidden transition-all duration-200 ${
                  isGroupExpanded ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="ml-4 border-l-2 border-border-primary pl-2 mt-1 flex flex-col gap-0.5">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-200
                        ${isActive(child.href)
                          ? "bg-accent-cyan/10 text-accent-cyan font-medium"
                          : "text-text-secondary hover:text-text-primary hover:bg-bg-card"
                        }`}
                    >
                      <child.icon size={16} />
                      <span>{child.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href!}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
              ${isActive(item.href!)
                ? "bg-accent-cyan/10 text-accent-cyan shadow-[inset_3px_0_0_0_var(--color-accent-cyan)]"
                : "text-text-secondary hover:text-text-primary hover:bg-bg-card"
              }`}
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-bg-card border border-border-primary text-text-primary hover:bg-bg-card-hover transition-colors no-print"
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-30"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static z-40 h-screen w-64 bg-bg-sidebar border-r border-border-primary flex flex-col transition-transform duration-300 no-print
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Logo/Brand — Clickable to go home */}
        <Link href="/dashboard" className="h-16 flex items-center gap-3 px-5 border-b border-border-primary shrink-0 hover:bg-bg-card-hover transition-colors">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-cyan to-accent-blue flex items-center justify-center">
            <Factory size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold gradient-text">{t("sidebar.brand")}</h1>
            <p className="text-[10px] text-text-muted">{t("sidebar.subtitle")}</p>
          </div>
        </Link>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto">{renderNav()}</div>

        {/* Language Toggle + User Section */}
        <div className="border-t border-border-primary p-4 shrink-0 space-y-3">
          {/* Language Toggle */}
          <button
            onClick={() => setLang(lang === "bn" ? "en" : "bn")}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-text-secondary hover:text-text-primary hover:bg-bg-card transition-all"
          >
            <Globe size={16} />
            <span className="flex-1 text-left">
              {lang === "bn" ? "Switch to English" : "বাংলায় দেখুন"}
            </span>
            <span className="text-xs font-semibold text-accent-cyan bg-accent-cyan/10 px-2 py-0.5 rounded-full">
              {lang === "bn" ? "বাং" : "EN"}
            </span>
          </button>

          {/* User */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-teal to-accent-cyan flex items-center justify-center text-xs font-bold text-white uppercase">
              {user?.name?.slice(0, 2) || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">
                {user?.name || "User"}
              </p>
              <p className="text-[10px] text-accent-cyan font-semibold uppercase">
                {user?.role || "USER"}
              </p>
            </div>
            <button
              onClick={() => signOut()}
              title={t("sidebar.logout")}
              className="p-1.5 rounded-lg hover:bg-bg-card text-text-muted hover:text-accent-red transition-colors"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
