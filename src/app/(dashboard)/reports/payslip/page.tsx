"use client";

import { useState, useMemo, useEffect } from "react";
import { Printer, Factory, Loader2 } from "lucide-react";
import {
  calculateMonthlyTotal,
  calculateMonthlyWage,
  formatBDT,
  formatDate,
  getMonthName,
  getApplicableRate,
} from "@/lib/wage-calc";
import { getActiveWorkers } from "@/app/actions/workers";
import { getWageRates } from "@/app/actions/wageRates";
import { getEntriesForMonth } from "@/app/actions/production";
import { getActiveMachines } from "@/app/actions/machines";

export default function PayslipPage() {
  const now = new Date();
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
    if (!selectedWorker) return [];
    return monthEntries.filter((e) => e.workerId === selectedWorker);
  }, [selectedWorker, monthEntries]);

  const totalYards = useMemo(
    () => calculateMonthlyTotal(workerEntries, selectedMonth, selectedYear),
    [workerEntries, selectedMonth, selectedYear]
  );

  const totalWage = useMemo(() => {
    if (!selectedWorker) return 0;
    return calculateMonthlyWage(workerEntries, wageRates, selectedMonth, selectedYear);
  }, [selectedWorker, workerEntries, wageRates, selectedMonth, selectedYear]);

  // Get the primary rate used
  const primaryRate = useMemo(() => {
    if (wageRates.length === 0) return { ratePerYard: 0 };
    if (workerEntries.length === 0) return wageRates[wageRates.length - 1];
    return getApplicableRate(wageRates, workerEntries[0].date) || wageRates[wageRates.length - 1];
  }, [workerEntries, wageRates]);

  // Group entries by date for display
  const dailyEntries = useMemo(() => {
    const grouped: Record<string, typeof workerEntries> = {};
    workerEntries.forEach((e) => {
      if (!grouped[e.date]) grouped[e.date] = [];
      grouped[e.date].push(e);
    });
    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, entries]) => ({
        date,
        entries,
        totalYards: entries.reduce((sum, e) => sum + e.totalYards, 0),
        machines: entries.map((e) => {
          const m = activeMachines.find((m) => m.id === e.machineId);
          return `M${m?.machineNumber || "?"}`;
        }),
        segments: entries.flatMap((e) => e.segments),
      }));
  }, [workerEntries, activeMachines]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Selection Controls */}
      <div className="no-print flex flex-col sm:flex-row items-start sm:items-end gap-4">
        <div className="flex-1 w-full sm:w-auto">
          <label className="block text-xs font-medium text-text-secondary mb-1.5">
            Worker
          </label>
          <select
            value={selectedWorker}
            onChange={(e) => setSelectedWorker(e.target.value)}
            className="w-full px-4 py-2.5 bg-bg-card border border-border-primary rounded-lg text-sm text-text-primary focus:border-accent-cyan outline-none"
          >
            <option value="">Select Worker</option>
            {activeWorkers.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} ({w.workerId})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">
            Month
          </label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="px-4 py-2.5 bg-bg-card border border-border-primary rounded-lg text-sm text-text-primary focus:border-accent-cyan outline-none"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {getMonthName(i + 1)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">
            Year
          </label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-4 py-2.5 bg-bg-card border border-border-primary rounded-lg text-sm text-text-primary focus:border-accent-cyan outline-none"
          >
            {[2024, 2025, 2026].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <button
          onClick={() => window.print()}
          disabled={!selectedWorker}
          className="flex items-center gap-2 px-4 py-2.5 bg-bg-card border border-border-primary text-text-primary text-sm rounded-lg hover:bg-bg-card-hover transition-all disabled:opacity-40"
        >
          <Printer size={16} />
          Print Payslip
        </button>
      </div>

      {/* Payslip */}
      {isLoading && !selectedWorker ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-accent-cyan" size={32} />
        </div>
      ) : !selectedWorker ? (
        <div className="glass-card p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-bg-card border border-border-primary mx-auto mb-4 flex items-center justify-center">
            <Factory size={28} className="text-text-muted" />
          </div>
          <p className="text-lg font-semibold text-text-primary mb-1">
            Select a Worker
          </p>
          <p className="text-sm text-text-muted">
            Choose a worker and period to generate their wage slip.
          </p>
        </div>
      ) : (
        <div className="bg-bg-card border border-border-primary rounded-2xl overflow-hidden print:bg-white print:border-black print:rounded-none print:text-black">
          {/* Payslip Header */}
          <div className="bg-gradient-to-r from-accent-cyan/10 to-accent-blue/10 border-b border-border-primary px-8 py-6 print:bg-white print:border-b print:border-black">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-cyan to-accent-blue flex items-center justify-center print:hidden">
                    <Factory size={20} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-text-primary print:text-black">
                      MillTrack
                    </h2>
                    <p className="text-xs text-text-muted print:text-gray-600">
                      Clothing Mill Production & Wage Management
                    </p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <h3 className="text-lg font-bold gradient-text print:text-black">
                  WAGE SLIP
                </h3>
                <p className="text-xs text-text-muted print:text-gray-600">
                  {getMonthName(selectedMonth)} {selectedYear}
                </p>
              </div>
            </div>
          </div>

          {/* Worker Info */}
          <div className="px-8 py-4 border-b border-border-primary grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-text-muted print:text-gray-500">Worker Name</p>
              <p className="font-semibold text-text-primary print:text-black">
                {worker?.name}
              </p>
            </div>
            <div>
              <p className="text-xs text-text-muted print:text-gray-500">Worker ID</p>
              <p className="font-semibold text-text-primary print:text-black">
                {worker?.workerId}
              </p>
            </div>
            <div>
              <p className="text-xs text-text-muted print:text-gray-500">Period</p>
              <p className="font-semibold text-text-primary print:text-black">
                {getMonthName(selectedMonth)} {selectedYear}
              </p>
            </div>
            <div>
              <p className="text-xs text-text-muted print:text-gray-500">Generated</p>
              <p className="font-semibold text-text-primary print:text-black">
                {formatDate(new Date().toISOString())}
              </p>
            </div>
          </div>

          {/* Day-by-Day Table */}
          <div className="px-8 py-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-border-primary print:border-black">
                  <th className="text-left py-2 text-xs font-semibold text-text-muted uppercase print:text-gray-600">
                    Date
                  </th>
                  <th className="text-left py-2 text-xs font-semibold text-text-muted uppercase print:text-gray-600">
                    Machine
                  </th>
                  <th className="text-left py-2 text-xs font-semibold text-text-muted uppercase print:text-gray-600">
                    Segments
                  </th>
                  <th className="text-right py-2 text-xs font-semibold text-text-muted uppercase print:text-gray-600">
                    Yards
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="py-4 text-center">
                      <Loader2 className="animate-spin text-accent-cyan mx-auto" size={20} />
                    </td>
                  </tr>
                ) : dailyEntries.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-text-muted">
                      No production entries for this period.
                    </td>
                  </tr>
                ) : (
                  dailyEntries.map((day) => (
                    <tr key={day.date} className="border-b border-border-primary/50 print:border-gray-200">
                      <td className="py-2 text-text-primary print:text-black">
                        {formatDate(day.date)}
                      </td>
                      <td className="py-2 text-text-secondary print:text-gray-700">
                        {day.machines.join(", ")}
                      </td>
                      <td className="py-2 text-text-muted font-mono text-xs print:text-gray-600">
                        {day.segments.join(" + ")}
                      </td>
                      <td className="py-2 text-right font-mono font-semibold text-accent-cyan print:text-black">
                        {day.totalYards}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="px-8 py-5 bg-bg-secondary/50 border-t border-border-primary space-y-2 print:bg-gray-50 print:border-black">
            <div className="flex justify-between text-sm">
              <span className="text-text-muted print:text-gray-600">Days Worked</span>
              <span className="font-semibold text-text-primary print:text-black">
                {dailyEntries.length}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted print:text-gray-600">Total Yards</span>
              <span className="font-mono font-semibold text-text-primary print:text-black">
                {totalYards.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted print:text-gray-600">Rate Applied</span>
              <span className="font-mono text-text-primary print:text-black">
                {primaryRate.ratePerYard} BDT/yard
              </span>
            </div>
            <div className="flex justify-between text-lg pt-2 border-t border-border-primary print:border-black">
              <span className="font-bold text-text-primary print:text-black">
                Total Wage
              </span>
              <span className="font-mono font-bold text-accent-amber print:text-black">
                {formatBDT(totalWage)}
              </span>
            </div>
          </div>

          {/* Signature Line */}
          <div className="px-8 py-8 grid grid-cols-2 gap-16">
            <div className="text-center">
              <div className="border-t border-border-primary pt-2 print:border-black">
                <p className="text-xs text-text-muted print:text-gray-600">
                  Worker Signature
                </p>
              </div>
            </div>
            <div className="text-center">
              <div className="border-t border-border-primary pt-2 print:border-black">
                <p className="text-xs text-text-muted print:text-gray-600">
                  Authorized Signature
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
