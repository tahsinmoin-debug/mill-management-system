"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ClipboardEdit,
  FileBarChart,
  FileText,
  Receipt,
  Loader2,
} from "lucide-react";
import {
  calculateMonthlyWage,
  formatBDT,
} from "@/lib/wage-calc";
import { getActiveMachines } from "@/app/actions/machines";
import { getActiveWorkers } from "@/app/actions/workers";
import { getWageRates } from "@/app/actions/wageRates";
import { getEntriesForDate, getEntriesForMonth } from "@/app/actions/production";
import { getSession } from "next-auth/react";
import { useLang } from "@/lib/i18n";
import { Skeleton, StatCardSkeleton } from "@/components/Skeleton";

function getTodayStr() {
  return new Date().toISOString().split("T")[0];
}

export default function DashboardPage() {
  const today = getTodayStr();
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const { t, monthName } = useLang();

  const [activeWorkers, setActiveWorkers] = useState<any[]>([]);
  const [wageRates, setWageRates] = useState<any[]>([]);
  const [todayEntries, setTodayEntries] = useState<any[]>([]);
  const [monthEntries, setMonthEntries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const session = await getSession();
      if (session?.user) setUser(session.user);
      const monthStr = `${currentYear}-${String(currentMonth).padStart(2, "0")}`;
      const [w, r, tEntries, mEntries] = await Promise.all([
        getActiveWorkers(),
        getWageRates(),
        getEntriesForDate(today),
        getEntriesForMonth(monthStr),
      ]);
      setActiveWorkers(w);
      setWageRates(r);
      setTodayEntries(tEntries);
      setMonthEntries(mEntries);
      setIsLoading(false);
    }
    loadData();
  }, [today, currentMonth, currentYear]);

  const monthlyYards = monthEntries.reduce((sum, e) => sum + e.totalYards, 0);

  const monthlyWage = activeWorkers.reduce((total, w) => {
    return (
      total +
      calculateMonthlyWage(
        monthEntries.filter((e) => e.workerId === w.id),
        wageRates,
        currentMonth,
        currentYear
      )
    );
  }, 0);

  const todayTotalYards = todayEntries.reduce((sum, e) => sum + e.totalYards, 0);

  const greeting = now.getHours() < 12
    ? t("dash.greeting.morning")
    : now.getHours() < 17
    ? t("dash.greeting.afternoon")
    : t("dash.greeting.evening");

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-28 w-full" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-accent-cyan/10 via-accent-blue/5 to-accent-teal/10 border border-accent-cyan/15 p-6">
        <div className="relative z-10">
          <h1 className="text-2xl font-bold text-text-primary">
            {greeting}, {user?.name || "User"} 👋
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            {t("dash.subtitle")} — {monthName(currentMonth)} {currentYear}
          </p>
        </div>
      </div>

      {/* 3 Big Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Today's Output */}
        <div className="p-6 rounded-2xl bg-white border border-border-primary shadow-sm">
          <div className="text-3xl mb-2">🧵</div>
          <p className="text-sm text-text-muted mb-1">{t("dash.today_output")}</p>
          <p className="text-3xl font-bold text-text-primary">
            {todayTotalYards.toLocaleString()}
            <span className="text-base font-normal text-text-muted ml-1">{t("dash.yards")}</span>
          </p>
        </div>

        {/* Monthly Output */}
        <div className="p-6 rounded-2xl bg-white border border-border-primary shadow-sm">
          <div className="text-3xl mb-2">📅</div>
          <p className="text-sm text-text-muted mb-1">{t("dash.monthly_output")}</p>
          <p className="text-3xl font-bold text-text-primary">
            {monthlyYards.toLocaleString()}
            <span className="text-base font-normal text-text-muted ml-1">{t("dash.yards")}</span>
          </p>
        </div>

        {/* Monthly Wage */}
        <div className="p-6 rounded-2xl bg-white border border-border-primary shadow-sm">
          <div className="text-3xl mb-2">💰</div>
          <p className="text-sm text-text-muted mb-1">{t("dash.monthly_wage")}</p>
          <p className="text-3xl font-bold text-accent-amber">
            {formatBDT(monthlyWage)}
          </p>
        </div>
      </div>

      {/* 4 Big Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <Link
          href="/entry"
          className="group flex flex-col items-center gap-3 p-8 rounded-2xl bg-white border-2 border-accent-cyan/20 hover:border-accent-cyan/50 hover:shadow-md transition-all duration-200"
        >
          <div className="w-14 h-14 rounded-2xl bg-accent-cyan/10 text-accent-cyan flex items-center justify-center group-hover:scale-110 transition-transform">
            <ClipboardEdit size={28} />
          </div>
          <div className="text-center">
            <p className="text-base font-semibold text-text-primary">
              {t("dash.enter_production")}
            </p>
            <p className="text-xs text-text-muted mt-0.5">
              {t("dash.enter_production_desc")}
            </p>
          </div>
        </Link>

        <Link
          href="/reports/weekly"
          className="group flex flex-col items-center gap-3 p-8 rounded-2xl bg-white border-2 border-accent-green/20 hover:border-accent-green/50 hover:shadow-md transition-all duration-200"
        >
          <div className="w-14 h-14 rounded-2xl bg-accent-green/10 text-accent-green flex items-center justify-center group-hover:scale-110 transition-transform">
            <FileText size={28} />
          </div>
          <div className="text-center">
            <p className="text-base font-semibold text-text-primary">
              {t("dash.weekly_report")}
            </p>
            <p className="text-xs text-text-muted mt-0.5">
              {t("dash.weekly_report_desc")}
            </p>
          </div>
        </Link>

        <Link
          href="/reports/monthly"
          className="group flex flex-col items-center gap-3 p-8 rounded-2xl bg-white border-2 border-accent-blue/20 hover:border-accent-blue/50 hover:shadow-md transition-all duration-200"
        >
          <div className="w-14 h-14 rounded-2xl bg-accent-blue/10 text-accent-blue flex items-center justify-center group-hover:scale-110 transition-transform">
            <FileBarChart size={28} />
          </div>
          <div className="text-center">
            <p className="text-base font-semibold text-text-primary">
              {t("dash.monthly_report")}
            </p>
            <p className="text-xs text-text-muted mt-0.5">
              {t("dash.monthly_report_desc")}
            </p>
          </div>
        </Link>

        <Link
          href="/reports/payslip"
          className="group flex flex-col items-center gap-3 p-8 rounded-2xl bg-white border-2 border-accent-amber/20 hover:border-accent-amber/50 hover:shadow-md transition-all duration-200"
        >
          <div className="w-14 h-14 rounded-2xl bg-accent-amber/10 text-accent-amber flex items-center justify-center group-hover:scale-110 transition-transform">
            <Receipt size={28} />
          </div>
          <div className="text-center">
            <p className="text-base font-semibold text-text-primary">
              {t("dash.payslip")}
            </p>
            <p className="text-xs text-text-muted mt-0.5">
              {t("dash.payslip_desc")}
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
