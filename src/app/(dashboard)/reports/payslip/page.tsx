"use client";

import { useState, useMemo, useEffect } from "react";
import { Printer, Factory, Loader2 } from "lucide-react";
import {
  calculateMonthlyTotal,
  calculateMonthlyWage,
  formatBDT,
  formatDate,
  getApplicableRate,
} from "@/lib/wage-calc";
import { getActiveWorkers } from "@/app/actions/workers";
import { getWageRates } from "@/app/actions/wageRates";
import { getEntriesForMonth } from "@/app/actions/production";
import { getActiveMachines } from "@/app/actions/machines";
import { Skeleton } from "@/components/Skeleton";
import { useLang } from "@/lib/i18n";

export default function PayslipPage() {
  const now = new Date();
  const { t, monthName } = useLang();
  const [selectedWorker, setSelectedWorker] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const [activeWorkers, setActiveWorkers] = useState<any[]>([]);
  const [wageRates, setWageRates] = useState<any[]>([]);
  const [activeMachines, setActiveMachines] = useState<any[]>([]);
  const [monthEntries, setMonthEntries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadInitial() {
      const [w, r, m] = await Promise.all([
        getActiveWorkers(),
        getWageRates(),
        getActiveMachines()
      ]);
      setActiveWorkers(w);
      setWageRates(r);
      setActiveMachines(m);
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

  const worker = activeWorkers.find((w) => w.id === selectedWorker);
  
  const workerEntries = useMemo(() => {
    return monthEntries
      .filter((e) => e.workerId === selectedWorker)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [monthEntries, selectedWorker]);

  const totalYards = calculateMonthlyTotal(workerEntries, selectedMonth, selectedYear);
  const totalTana = workerEntries.reduce((sum, e) => sum + (e.tanaCount || 0), 0);
  const totalWage = calculateMonthlyWage(workerEntries, wageRates, selectedMonth, selectedYear);
  const daysWorked = new Set(workerEntries.map((e) => e.date)).size;

  if (isLoading && activeWorkers.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Controls (Hidden in Print) */}
      <div className="no-print glass-card p-5 flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="block text-xs font-medium text-text-secondary mb-1.5">
            {t("payslip.worker")}
          </label>
          <select
            value={selectedWorker}
            onChange={(e) => setSelectedWorker(e.target.value)}
            className="w-full px-4 py-2 bg-bg-card border border-border-primary rounded-xl text-sm text-text-primary focus:border-accent-cyan outline-none"
          >
            <option value="">{t("payslip.select_worker")}</option>
            {activeWorkers.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} ({w.workerId})
              </option>
            ))}
          </select>
        </div>
        <div className="w-full sm:w-48">
          <label className="block text-xs font-medium text-text-secondary mb-1.5">
            {t("payslip.month")}
          </label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="w-full px-4 py-2 bg-bg-card border border-border-primary rounded-xl text-sm text-text-primary focus:border-accent-cyan outline-none"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>{monthName(i + 1)}</option>
            ))}
          </select>
        </div>
        <div className="w-full sm:w-32">
          <label className="block text-xs font-medium text-text-secondary mb-1.5">
            {t("payslip.year")}
          </label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="w-full px-4 py-2 bg-bg-card border border-border-primary rounded-xl text-sm text-text-primary focus:border-accent-cyan outline-none"
          >
            {[2024, 2025, 2026].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <button
          onClick={() => window.print()}
          disabled={!selectedWorker || workerEntries.length === 0}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2 bg-gradient-to-r from-accent-cyan to-accent-blue text-white font-medium rounded-xl text-sm hover:shadow-lg hover:shadow-accent-cyan/20 transition-all disabled:opacity-50"
        >
          <Printer size={16} />
          {t("payslip.print")}
        </button>
      </div>

      {/* Empty State */}
      {!selectedWorker ? (
        <div className="no-print glass-card p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-bg-secondary flex items-center justify-center mx-auto mb-4 border border-border-primary">
            <Factory size={28} className="text-text-muted" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            {t("payslip.select_prompt")}
          </h3>
          <p className="text-sm text-text-muted max-w-sm mx-auto">
            {t("payslip.select_desc")}
          </p>
        </div>
      ) : (
        /* Printable Payslip Container */
        <div className="print-only bg-white text-black max-w-[800px] mx-auto p-8 border border-border-primary rounded-xl sm:block shadow-sm">
          {/* Header */}
          <div className="text-center mb-8 pb-6 border-b-2 border-black/10">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Factory size={28} className="text-accent-cyan" />
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">{t("payslip.company")}</h1>
            </div>
            <p className="text-gray-500 text-sm">{t("payslip.company_desc")}</p>
            <h2 className="text-xl font-bold mt-4 tracking-widest text-gray-800 border-2 border-gray-800 inline-block px-4 py-1 rounded-md">
              {t("payslip.wage_slip")}
            </h2>
          </div>

          {/* Worker Info */}
          <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
            <div className="space-y-2">
              <div className="grid grid-cols-3">
                <span className="text-gray-500 font-medium">{t("payslip.worker_name")}:</span>
                <span className="col-span-2 font-bold text-gray-900 text-base">{worker?.name}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-gray-500 font-medium">{t("payslip.worker_id")}:</span>
                <span className="col-span-2 font-mono font-medium text-gray-900">{worker?.workerId}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="grid grid-cols-3">
                <span className="text-gray-500 font-medium">{t("payslip.period")}:</span>
                <span className="col-span-2 font-medium text-gray-900">
                  {monthName(selectedMonth)} {selectedYear}
                </span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-gray-500 font-medium">{t("payslip.generated")}:</span>
                <span className="col-span-2 text-gray-900">{formatDate(now.toISOString().split("T")[0])}</span>
              </div>
            </div>
          </div>

          {/* Detailed Entries Table */}
          <div className="mb-8">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100 border-y-2 border-gray-300">
                  <th className="py-2.5 px-3 text-left font-bold text-gray-700">{t("payslip.date")}</th>
                  <th className="py-2.5 px-3 text-left font-bold text-gray-700">{t("payslip.machine")}</th>
                  <th className="py-2.5 px-3 text-left font-bold text-gray-700">{t("payslip.segments")}</th>
                  <th className="py-2.5 px-3 text-right font-bold text-gray-700">{t("payslip.tana")}</th>
                  <th className="py-2.5 px-3 text-right font-bold text-gray-700">{t("payslip.yards")}</th>
                </tr>
              </thead>
              <tbody>
                {workerEntries.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500 italic">
                      {t("payslip.no_entries")}
                    </td>
                  </tr>
                ) : (
                  workerEntries.map((entry, idx) => {
                    const m = activeMachines.find((x) => x.id === entry.machineId);
                    return (
                      <tr key={entry.id} className={`border-b border-gray-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                        <td className="py-2 px-3 text-gray-800">{formatDate(entry.date)}</td>
                        <td className="py-2 px-3 text-gray-800">
                          M{m?.machineNumber} <span className="text-xs text-gray-500">({m?.typeModel})</span>
                        </td>
                        <td className="py-2 px-3 text-gray-600 font-mono text-xs">
                          {entry.segments.join(" + ")}
                        </td>
                        <td className="py-2 px-3 text-right text-gray-800">{entry.tanaCount || 0}</td>
                        <td className="py-2 px-3 text-right font-mono font-medium text-gray-900">
                          {entry.totalYards}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Summary Totals */}
          <div className="flex justify-end mb-16">
            <div className="w-72 rounded-xl border-2 border-gray-800 overflow-hidden">
              <div className="bg-gray-100 px-4 py-2 border-b-2 border-gray-800">
                <h4 className="font-bold text-gray-900 text-center uppercase tracking-wider">{t("common.total")}</h4>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t("payslip.days_worked")}</span>
                  <span className="font-medium text-gray-900">{daysWorked}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t("payslip.total_tana")}</span>
                  <span className="font-medium text-gray-900">{totalTana}</span>
                </div>
                <div className="flex justify-between text-sm border-b border-gray-200 pb-2">
                  <span className="text-gray-600">{t("payslip.total_yards")}</span>
                  <span className="font-mono font-medium text-gray-900">{totalYards.toLocaleString()}</span>
                </div>
                {wageRates.length > 0 && (
                  <div className="flex justify-between text-xs text-gray-500 pb-2 border-b border-gray-200">
                    <span>{t("payslip.rate")}</span>
                    <span>
                      {getApplicableRate(wageRates, workerEntries[workerEntries.length - 1]?.date || now.toISOString().split("T")[0])?.ratePerYard || 0} {t("common.bdt_per_yard")}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-1">
                  <span className="font-bold text-gray-900">{t("payslip.total_wage")}</span>
                  <span className="text-xl font-bold font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">
                    {formatBDT(totalWage)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="flex justify-between items-end mt-16 pt-8">
            <div className="w-48 text-center">
              <div className="border-b border-gray-400 mb-2"></div>
              <p className="text-sm font-medium text-gray-600">{t("payslip.worker_sig")}</p>
            </div>
            <div className="w-48 text-center">
              <div className="border-b border-gray-400 mb-2"></div>
              <p className="text-sm font-medium text-gray-600">{t("payslip.auth_sig")}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
