"use client";

import { useState, useMemo, useEffect } from "react";
import { Printer, Ruler, DollarSign, Users, Factory, Loader2 } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import StatCard from "@/components/StatCard";
import {
  calculateMonthlyTotal, calculateMonthlyWage, formatBDT,
} from "@/lib/wage-calc";
import { getActiveWorkers } from "@/app/actions/workers";
import { getActiveMachines } from "@/app/actions/machines";
import { getWageRates } from "@/app/actions/wageRates";
import { getEntriesForMonth } from "@/app/actions/production";
import { Skeleton, StatCardSkeleton } from "@/components/Skeleton";
import { useLang } from "@/lib/i18n";

export default function MonthlyReportPage() {
  const now = new Date();
  const { t, monthName } = useLang();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const [activeWorkers, setActiveWorkers] = useState<any[]>([]);
  const [activeMachines, setActiveMachines] = useState<any[]>([]);
  const [wageRates, setWageRates] = useState<any[]>([]);
  const [monthEntries, setMonthEntries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadInitial() {
      const [w, m, r] = await Promise.all([getActiveWorkers(), getActiveMachines(), getWageRates()]);
      setActiveWorkers(w); setActiveMachines(m); setWageRates(r);
    }
    loadInitial();
  }, []);

  useEffect(() => {
    async function loadEntries() {
      setIsLoading(true);
      const monthStr = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}`;
      const entries = await getEntriesForMonth(monthStr);
      setMonthEntries(entries);
      setIsLoading(false);
    }
    loadEntries();
  }, [selectedMonth, selectedYear]);

  const millTotalYards = monthEntries.reduce((sum, e) => sum + e.totalYards, 0);
  const millTotalTana = monthEntries.reduce((sum, e) => sum + (e.tanaCount || 0), 0);
  const millTotalWage = useMemo(() => {
    return activeWorkers.reduce((total, w) => {
      return total + calculateMonthlyWage(monthEntries.filter((e) => e.workerId === w.id), wageRates, selectedMonth, selectedYear);
    }, 0);
  }, [activeWorkers, monthEntries, wageRates, selectedMonth, selectedYear]);

  const machineData = useMemo(() => {
    return activeMachines.map((machine) => {
      const entries = monthEntries.filter((e) => e.machineId === machine.id);
      const totalYards = entries.reduce((sum, e) => sum + e.totalYards, 0);
      const totalTana = entries.reduce((sum, e) => sum + (e.tanaCount || 0), 0);
      return { machine, totalYards, totalTana };
    }).sort((a, b) => b.totalYards - a.totalYards);
  }, [activeMachines, monthEntries]);

  const workerData = useMemo(() => {
    return activeWorkers.map((worker) => {
      const workerEntries = monthEntries.filter((e) => e.workerId === worker.id);
      const totalYards = calculateMonthlyTotal(workerEntries, selectedMonth, selectedYear);
      const totalWage = calculateMonthlyWage(workerEntries, wageRates, selectedMonth, selectedYear);
      const daysWorked = new Set(workerEntries.map((e) => e.date)).size;
      return { worker, totalYards, totalWage, daysWorked };
    }).sort((a, b) => b.totalYards - a.totalYards);
  }, [activeWorkers, monthEntries, wageRates, selectedMonth, selectedYear]);

  const chartData = useMemo(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const data = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const dayEntries = monthEntries.filter((e) => e.date === dateStr);
      const totalYards = dayEntries.reduce((sum, e) => sum + e.totalYards, 0);
      data.push({ day: String(day), yards: totalYards });
    }
    return data;
  }, [monthEntries, selectedMonth, selectedYear]);

  if (isLoading && activeWorkers.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-16 w-full max-w-sm" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton />
        </div>
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="px-4 py-2 bg-bg-card border border-border-primary rounded-xl text-sm text-text-primary focus:border-accent-cyan outline-none">
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>{monthName(i + 1)}</option>
            ))}
          </select>
          <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-4 py-2 bg-bg-card border border-border-primary rounded-xl text-sm text-text-primary focus:border-accent-cyan outline-none">
            {[2024, 2025, 2026].map((y) => (<option key={y} value={y}>{y}</option>))}
          </select>
        </div>
        <button onClick={() => window.print()}
          className="no-print flex items-center gap-2 px-4 py-2 bg-bg-card border border-border-primary text-text-primary text-sm rounded-xl hover:bg-bg-card-hover transition-all">
          <Printer size={16} />{t("monthly.print")}
        </button>
      </div>

      {/* Print-only Header */}
      <div className="print-only text-center mb-8 border-b-2 border-black/10 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{t("nav.reports.monthly")}</h1>
        <p className="text-gray-500 mt-1">{monthName(selectedMonth)} {selectedYear}</p>
      </div>

      <div className="no-print grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label={t("monthly.total_output")} value={`${millTotalYards.toLocaleString()} ${t("common.yards")}`} icon={<Ruler size={20} />} variant="cyan" />
        <StatCard label={t("monthly.total_wage")} value={formatBDT(millTotalWage)} icon={<DollarSign size={20} />} variant="amber" />
        <StatCard label={t("monthly.active_machines")} value={activeMachines.length} icon={<Factory size={20} />} variant="green" />
        <StatCard label={t("monthly.active_workers")} value={activeWorkers.length} icon={<Users size={20} />} variant="purple" />
      </div>

      {/* Chart */}
      <div className="no-print glass-card p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-4">
          {t("monthly.daily_trend")} — {monthName(selectedMonth)} {selectedYear}
        </h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0d8ce" />
              <XAxis dataKey="day" tick={{ fill: "#8a8a9a", fontSize: 10 }} axisLine={{ stroke: "#e0d8ce" }} />
              <YAxis tick={{ fill: "#8a8a9a", fontSize: 11 }} axisLine={{ stroke: "#e0d8ce" }} />
              <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e0d8ce", borderRadius: "12px", fontSize: "12px", color: "#1a1a2e" }}
                formatter={(value: unknown) => [`${value} ${t("common.yards")}`, t("monthly.total_output")]} />
              <Bar dataKey="yards" fill="url(#monthlyGradient)" radius={[4, 4, 0, 0]} maxBarSize={20} />
              <defs>
                <linearGradient id="monthlyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0d9488" /><stop offset="100%" stopColor="#2563eb" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Machine Table */}
        <div className="glass-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border-primary bg-bg-secondary/50">
            <h3 className="text-sm font-semibold text-text-primary">{t("monthly.machine_output")}</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-primary">
                <th className="text-left py-2.5 px-4 text-xs font-medium text-text-muted uppercase">{t("monthly.machine")}</th>
                <th className="text-left py-2.5 px-4 text-xs font-medium text-text-muted uppercase">{t("monthly.model")}</th>
                <th className="text-right py-2.5 px-4 text-xs font-medium text-text-muted uppercase">{t("monthly.tana")}</th>
                <th className="text-right py-2.5 px-4 text-xs font-medium text-text-muted uppercase">{t("monthly.total_yards")}</th>
              </tr>
            </thead>
            <tbody>
              {machineData.length === 0 ? (
                <tr><td colSpan={4} className="py-8 text-center text-text-muted text-xs">{t("common.no_data")}</td></tr>
              ) : machineData.map((row) => (
                <tr key={row.machine.id} className="border-b border-border-primary/50 hover:bg-bg-card-hover/50">
                  <td className="py-2.5 px-4 font-medium text-text-primary">M{row.machine.machineNumber}</td>
                  <td className="py-2.5 px-4 text-text-muted text-xs">{row.machine.typeModel}</td>
                  <td className="py-2.5 px-4 text-right text-text-muted">{row.totalTana}</td>
                  <td className="py-2.5 px-4 text-right font-mono font-semibold text-accent-cyan">{row.totalYards.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-bg-secondary/50">
                <td colSpan={2} className="py-2.5 px-4 text-sm font-semibold text-text-primary">{t("monthly.total")}</td>
                <td className="py-2.5 px-4 text-right font-semibold text-text-primary">{millTotalTana}</td>
                <td className="py-2.5 px-4 text-right font-mono font-bold text-accent-cyan">{millTotalYards.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Worker Table */}
        <div className="glass-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border-primary bg-bg-secondary/50">
            <h3 className="text-sm font-semibold text-text-primary">{t("monthly.worker_output")}</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-primary">
                <th className="text-left py-2.5 px-4 text-xs font-medium text-text-muted uppercase">{t("monthly.worker")}</th>
                <th className="text-right py-2.5 px-4 text-xs font-medium text-text-muted uppercase">{t("monthly.days")}</th>
                <th className="text-right py-2.5 px-4 text-xs font-medium text-text-muted uppercase">{t("monthly.yards")}</th>
                <th className="text-right py-2.5 px-4 text-xs font-medium text-text-muted uppercase">{t("monthly.wage")}</th>
              </tr>
            </thead>
            <tbody>
              {workerData.length === 0 ? (
                <tr><td colSpan={4} className="py-8 text-center text-text-muted text-xs">{t("common.no_data")}</td></tr>
              ) : workerData.map((row) => (
                <tr key={row.worker.id} className="border-b border-border-primary/50 hover:bg-bg-card-hover/50">
                  <td className="py-2.5 px-4 text-text-primary font-medium">{row.worker.name}</td>
                  <td className="py-2.5 px-4 text-right text-text-muted">{row.daysWorked}</td>
                  <td className="py-2.5 px-4 text-right font-mono text-accent-cyan">{row.totalYards.toLocaleString()}</td>
                  <td className="py-2.5 px-4 text-right font-mono font-semibold text-accent-amber">{formatBDT(row.totalWage)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-bg-secondary/50">
                <td className="py-2.5 px-4 text-sm font-semibold text-text-primary">{t("monthly.total")}</td>
                <td className="py-2.5 px-4"></td>
                <td className="py-2.5 px-4 text-right font-mono font-bold text-accent-cyan">{millTotalYards.toLocaleString()}</td>
                <td className="py-2.5 px-4 text-right font-mono font-bold text-accent-amber">{formatBDT(millTotalWage)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
