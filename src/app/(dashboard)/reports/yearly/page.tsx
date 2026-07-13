"use client";

import { useState, useMemo, useEffect } from "react";
import { Printer, Ruler, DollarSign, Calendar as CalendarIcon } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import StatCard from "@/components/StatCard";
import { calculateMonthlyWage, formatBDT } from "@/lib/wage-calc";
import { getActiveWorkers } from "@/app/actions/workers";
import { getWageRates } from "@/app/actions/wageRates";
import { getEntriesForYear } from "@/app/actions/production";
import { Skeleton, StatCardSkeleton } from "@/components/Skeleton";
import { useLang } from "@/lib/i18n";

export default function YearlyReportPage() {
  const now = new Date();
  const { t, monthName } = useLang();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const [activeWorkers, setActiveWorkers] = useState<any[]>([]);
  const [wageRates, setWageRates] = useState<any[]>([]);
  const [yearEntries, setYearEntries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [yearlyTanaData, setYearlyTanaData] = useState<{ monthlyTana: number[]; yearlyTotal: number }>({ monthlyTana: Array(12).fill(0), yearlyTotal: 0 });

  useEffect(() => {
    async function loadInitial() {
      const [w, r] = await Promise.all([getActiveWorkers(), getWageRates()]);
      setActiveWorkers(w);
      setWageRates(r);
    }
    loadInitial();
  }, []);

  useEffect(() => {
    async function loadEntries() {
      setIsLoading(true);
      const { getYearlyTanaBreakdown } = await import("@/app/actions/production");
      
      const [entries, tanaData] = await Promise.all([
        getEntriesForYear(String(selectedYear)),
        getYearlyTanaBreakdown(selectedYear)
      ]);
      
      setYearEntries(entries);
      setYearlyTanaData(tanaData);
      setIsLoading(false);
    }
    loadEntries();
  }, [selectedYear]);

  const yearTotalYards = yearEntries.reduce((sum, e) => sum + e.totalYards, 0);
  const yearTotalTana = yearlyTanaData.yearlyTotal;
  const workingDays = new Set(yearEntries.map((e) => e.date)).size;

  const yearTotalWage = useMemo(() => {
    let total = 0;
    for (let month = 1; month <= 12; month++) {
      const monthStr = `${selectedYear}-${String(month).padStart(2, "0")}`;
      const monthEntries = yearEntries.filter((e) => e.date.startsWith(monthStr));
      activeWorkers.forEach((w) => {
        total += calculateMonthlyWage(
          monthEntries.filter((e) => e.workerId === w.id),
          wageRates, month, selectedYear
        );
      });
    }
    return total;
  }, [yearEntries, activeWorkers, wageRates, selectedYear]);

  const monthlyBreakdown = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const monthStr = `${selectedYear}-${String(month).padStart(2, "0")}`;
      const entries = yearEntries.filter((e) => e.date.startsWith(monthStr));
      const yards = entries.reduce((sum, e) => sum + e.totalYards, 0);
      const tana = yearlyTanaData.monthlyTana[i] || 0;
      const days = new Set(entries.map((e) => e.date)).size;
      let wage = 0;
      activeWorkers.forEach((w) => {
        wage += calculateMonthlyWage(entries.filter((e) => e.workerId === w.id), wageRates, month, selectedYear);
      });
      return { month, name: monthName(month), yards, tana, days, wage };
    });
  }, [yearEntries, activeWorkers, wageRates, selectedYear, monthName, yearlyTanaData]);

  if (isLoading && activeWorkers.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-16 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton />
        </div>
        <Skeleton className="h-72 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-4 py-2 bg-bg-card border border-border-primary rounded-xl text-sm text-text-primary focus:border-accent-cyan outline-none">
            {[2024, 2025, 2026, 2027].map((y) => (<option key={y} value={y}>{y}</option>))}
          </select>
        </div>
        <button onClick={() => window.print()}
          className="no-print flex items-center gap-2 px-4 py-2 bg-bg-card border border-border-primary text-text-primary text-sm rounded-xl hover:bg-bg-card-hover transition-all">
          <Printer size={16} />{t("yearly.print")}
        </button>
      </div>

      {/* Print-only Header */}
      <div className="print-only text-center mb-8 border-b-2 border-black/10 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{t("nav.reports.yearly")}</h1>
        <p className="text-gray-500 mt-1">{selectedYear}</p>
      </div>

      {/* Summary */}
      <div className="no-print grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label={t("yearly.total_output")} value={`${yearTotalYards.toLocaleString()} ${t("common.yards")}`} icon={<Ruler size={20} />} variant="cyan" />
        <StatCard label={t("yearly.total_wage")} value={formatBDT(yearTotalWage)} icon={<DollarSign size={20} />} variant="amber" />
        <StatCard label={t("yearly.total_tana")} value={yearTotalTana.toLocaleString()} icon={<Ruler size={20} />} variant="green" />
        <StatCard label={t("yearly.total_days")} value={workingDays} icon={<CalendarIcon size={20} />} variant="purple" />
      </div>

      {/* Monthly Chart */}
      <div className="no-print glass-card p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-4">
          {t("yearly.chart_title")} — {selectedYear}
        </h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyBreakdown}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0d8ce" />
              <XAxis dataKey="name" tick={{ fill: "#8a8a9a", fontSize: 10 }} axisLine={{ stroke: "#e0d8ce" }} />
              <YAxis tick={{ fill: "#8a8a9a", fontSize: 11 }} axisLine={{ stroke: "#e0d8ce" }} />
              <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e0d8ce", borderRadius: "12px", fontSize: "12px", color: "#1a1a2e" }}
                formatter={(value: unknown) => [`${value} ${t("common.yards")}`, t("yearly.yards")]} />
              <Bar dataKey="yards" fill="url(#yearlyGradient)" radius={[6, 6, 0, 0]} maxBarSize={40} />
              <defs>
                <linearGradient id="yearlyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0d9488" /><stop offset="100%" stopColor="#2563eb" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Table */}
      <div className="glass-card overflow-hidden">
        <div className="px-5 py-3 border-b border-border-primary bg-bg-secondary/50">
          <h3 className="text-sm font-semibold text-text-primary">{t("yearly.monthly_breakdown")}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-primary">
                <th className="text-left py-2.5 px-4 text-xs font-medium text-text-muted uppercase">{t("yearly.month")}</th>
                <th className="text-right py-2.5 px-4 text-xs font-medium text-text-muted uppercase">{t("yearly.days")}</th>
                <th className="text-right py-2.5 px-4 text-xs font-medium text-text-muted uppercase">{t("yearly.yards")}</th>
                <th className="text-right py-2.5 px-4 text-xs font-medium text-text-muted uppercase">{t("yearly.tana")}</th>
                <th className="text-right py-2.5 px-4 text-xs font-medium text-text-muted uppercase">{t("yearly.wage")}</th>
              </tr>
            </thead>
            <tbody>
              {monthlyBreakdown.map((row) => (
                <tr key={row.month} className={`border-b border-border-primary/50 hover:bg-bg-card-hover/50 ${row.yards === 0 ? "opacity-50" : ""}`}>
                  <td className="py-2.5 px-4 text-text-primary font-medium">{row.name}</td>
                  <td className="py-2.5 px-4 text-right text-text-muted">{row.days}</td>
                  <td className="py-2.5 px-4 text-right font-mono text-accent-cyan">{row.yards.toLocaleString()}</td>
                  <td className="py-2.5 px-4 text-right text-text-muted">{row.tana}</td>
                  <td className="py-2.5 px-4 text-right font-mono font-semibold text-accent-amber">{formatBDT(row.wage)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-bg-secondary/50">
                <td className="py-2.5 px-4 text-sm font-semibold text-text-primary">{t("common.total")}</td>
                <td className="py-2.5 px-4 text-right font-semibold text-text-primary">{workingDays}</td>
                <td className="py-2.5 px-4 text-right font-mono font-bold text-accent-cyan">{yearTotalYards.toLocaleString()}</td>
                <td className="py-2.5 px-4 text-right font-semibold text-text-primary">{yearTotalTana}</td>
                <td className="py-2.5 px-4 text-right font-mono font-bold text-accent-amber">{formatBDT(yearTotalWage)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
