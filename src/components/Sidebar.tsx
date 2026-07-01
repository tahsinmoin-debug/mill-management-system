"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { getSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  ClipboardEdit,
  Settings2,
  Factory,
  Users,
  FileBarChart,
  FileText,
  Receipt,
  DollarSign,
  UserCog,
  Menu,
  X,
  ChevronDown,
  LogOut,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Production Entry", href: "/entry", icon: ClipboardEdit },
  { label: "Machines", href: "/machines", icon: Factory },
  { label: "Workers", href: "/workers", icon: Users },
  {
    label: "Reports",
    icon: FileBarChart,
    children: [
      { label: "Daily Report", href: "/reports/daily", icon: FileText },
      { label: "Monthly Report", href: "/reports/monthly", icon: FileBarChart },
      { label: "Payslip", href: "/reports/payslip", icon: Receipt },
    ],
  },
  {
    label: "Settings",
    icon: Settings2,
    adminOnly: true,
    children: [
      { label: "Wage Rate", href: "/settings/wage-rate", icon: DollarSign },
      { label: "User Management", href: "/settings/users", icon: UserCog },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["Reports", "Settings"]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    getSession().then((session) => {
      if (session?.user) setUser(session.user);
    });
  }, []);

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) =>
      prev.includes(label)
        ? prev.filter((g) => g !== label)
        : [...prev, label]
    );
  };

  const isActive = (href: string) => pathname === href;

  const renderNav = () => (
    <nav className="flex flex-col gap-1 px-3 py-4">
      {navItems.map((item) => {
        if (item.adminOnly && user?.role !== "ADMIN") return null;

        if (item.children) {
          const isGroupExpanded = expandedGroups.includes(item.label);
          const hasActiveChild = item.children.some((c) => isActive(c.href));

          return (
            <div key={item.label}>
              <button
                onClick={() => toggleGroup(item.label)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                  ${hasActiveChild ? "text-accent-cyan" : "text-text-secondary hover:text-text-primary hover:bg-bg-card"}`}
              >
                <item.icon size={18} />
                <span className="flex-1 text-left">{item.label}</span>
                {item.adminOnly && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent-purple/20 text-accent-purple font-semibold">
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
                  isGroupExpanded ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="ml-4 border-l border-border-primary pl-2 mt-1 flex flex-col gap-0.5">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200
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
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
              ${isActive(item.href!)
                ? "bg-accent-cyan/10 text-accent-cyan shadow-[inset_2px_0_0_0_var(--color-accent-cyan)]"
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
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-bg-card border border-border-primary text-text-primary hover:bg-bg-card-hover transition-colors no-print"
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static z-40 h-screen w-64 bg-bg-sidebar border-r border-border-primary flex flex-col transition-transform duration-300 no-print
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Logo/Brand */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-border-primary shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-cyan to-accent-blue flex items-center justify-center">
            <Factory size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold gradient-text">MillTrack</h1>
            <p className="text-[10px] text-text-muted">Production & Wages</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto">{renderNav()}</div>

        {/* User Section */}
        <div className="border-t border-border-primary p-4 shrink-0">
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
