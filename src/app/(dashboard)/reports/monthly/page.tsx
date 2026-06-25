"use client";

import { useState, useMemo } from "react";
import { Printer, Ruler, DollarSign, Users, Factory } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import StatCard from "@/components/StatCard";
import {
  mockMachines,
  mockWorkers,
  mockProductionEntries,
  mockWageRates,
} from "@/lib/mock-data";
import {
  calculateMonthlyTotal,
  calculateMonthlyWage,
  formatBDT,
  getMonthName,
} from "@/lib/wage-calc";

export default function MonthlyReportPage() {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const activeWorkers = mockWorkers.filter((w) => w.status === "ACTIVE");
  const activeMachines = mockMachines.filter((m) => m.status === "ACTIVE");

  // Monthly data
  const monthEntries = useMemo(
    () =>
      mockProductionEntries.filter((e) => {
        const d = new Date(e.date);
        return d.getMonth() + 1 === selectedMonth && d.getFullYear() === selectedYear;
      }),
    [selectedMonth, selectedYear]
  );

  const millTotalYards = monthEntries.reduce((sum, e) => sum + e.totalYards, 0);

  const millTotalWage = useMemo(() => {
    return activeWorkers.reduce((total, w) => {
      return (
        total +
        calculateMonthlyWage(
          mockProductionEntries.filter((e) => e.workerId === w.id),
          mockWageRates,
          selectedMonth,
          selectedYear
        )
      );
    }, 0);
  }, [activeWorkers, selectedMonth, selectedYear]);

  // Per-machine data
  const machineData = useMemo(() => {
    return activeMachines
      .map((machine) => {
        const entries = monthEntries.filter((e) => e.machineId === machine.id);
        const totalYards = entries.reduce((sum, e) => sum + e.totalYards, 0);
        return { machine, totalYards };
      })
      .sort((a, b) => b.totalYards - a.totalYards);
  }, [activeMachines, monthEntries]);

  // Per-worker data
  const workerData = useMemo(() => {
    return activeWorkers
      .map((worker) => {
        const totalYards = calculateMonthlyTotal(
          mockProductionEntries.filter((e) => e.workerId === worker.id),
          selectedMonth,
          selectedYear
        );
        const totalWage = calculateMonthlyWage(
          mockProductionEntries.filter((e) => e.workerId === worker.id),
          mockWageRates,
          selectedMonth,
          selectedYear
        );
        const daysWorked = new Set(
          monthEntries
            .filter((e) => e.workerId === worker.id)
            .map((e) => e.date)
        ).size;
        return { worker, totalYards, totalWage, daysWorked };
      })
      .sort((a, b) => b.totalYards - a.totalYards);
  }, [activeWorkers, selectedMonth, selectedYear, monthEntries]);

  // Daily chart data
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="px-4 py-2 bg-bg-card border border-border-primary rounded-lg text-sm text-text-primary focus:border-accent-cyan outline-none"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {getMonthName(i + 1)}
              </option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-4 py-2 bg-bg-card border border-border-primary rounded-lg text-sm text-text-primary focus:border-accent-cyan outline-none"
          >
            {[2024, 2025, 2026].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => window.print()}
          className="no-print flex items-center gap-2 px-4 py-2 bg-bg-card border border-border-primary text-text-primary text-sm rounded-lg hover:bg-bg-card-hover transition-all"
        >
          <Printer size={16} />
          Print Report
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Output"
          value={`${millTotalYards.toLocaleString()} yds`}
          icon={<Ruler size={20} />}
          variant="cyan"
        />
        <StatCard
          label="Total Wage Payout"
          value={formatBDT(millTotalWage)}
          icon={<DollarSign size={20} />}
          variant="amber"
        />
        <StatCard
          label="Active Machines"
          value={activeMachines.length}
          icon={<Factory size={20} />}
          variant="green"
        />
        <StatCard
          label="Active Workers"
          value={activeWorkers.length}
          icon={<Users size={20} />}
          variant="purple"
        />
      </div>

      {/* Daily Output Chart */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-4">
          Daily Output Trend — {getMonthName(selectedMonth)} {selectedYear}
        </h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="day"
                tick={{ fill: "#64748b", fontSize: 10 }}
                axisLine={{ stroke: "#1e293b" }}
              />
              <YAxis
                tick={{ fill: "#64748b", fontSize: 11 }}
                axisLine={{ stroke: "#1e293b" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1a2235",
                  border: "1px solid #1e293b",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "#f1f5f9",
                }}
                formatter={(value: unknown) => [`${value} yards`, "Output"]}
              />
              <Bar dataKey="yards" fill="url(#monthlyGradient)" radius={[3, 3, 0, 0]} maxBarSize={20} />
              <defs>
                <linearGradient id="monthlyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Per-Machine Table */}
        <div className="glass-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border-primary bg-bg-secondary/50">
            <h3 className="text-sm font-semibold text-text-primary">
              Output per Machine
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-primary">
                  <th className="text-left py-2.5 px-4 text-xs font-medium text-text-muted uppercase">
                    Machine
                  </th>
                  <th className="text-left py-2.5 px-4 text-xs font-medium text-text-muted uppercase">
                    Model
                  </th>
                  <th className="text-right py-2.5 px-4 text-xs font-medium text-text-muted uppercase">
                    Total Yards
                  </th>
                </tr>
              </thead>
              <tbody>
                {machineData.map((row) => (
                  <tr key={row.machine.id} className="border-b border-border-primary/50 hover:bg-bg-card-hover/50">
                    <td className="py-2.5 px-4 font-medium text-text-primary">
                      M{row.machine.machineNumber}
                    </td>
                    <td className="py-2.5 px-4 text-text-muted text-xs">
                      {row.machine.typeModel}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-semibold text-accent-cyan">
                      {row.totalYards.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-bg-secondary/50">
                  <td colSpan={2} className="py-2.5 px-4 text-sm font-semibold text-text-primary">
                    Total
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold text-accent-cyan">
                    {millTotalYards.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Per-Worker Table */}
        <div className="glass-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border-primary bg-bg-secondary/50">
            <h3 className="text-sm font-semibold text-text-primary">
              Output & Wage per Worker
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-primary">
                  <th className="text-left py-2.5 px-4 text-xs font-medium text-text-muted uppercase">
                    Worker
                  </th>
                  <th className="text-right py-2.5 px-4 text-xs font-medium text-text-muted uppercase">
                    Days
                  </th>
                  <th className="text-right py-2.5 px-4 text-xs font-medium text-text-muted uppercase">
                    Yards
                  </th>
                  <th className="text-right py-2.5 px-4 text-xs font-medium text-text-muted uppercase">
                    Wage
                  </th>
                </tr>
              </thead>
              <tbody>
                {workerData.map((row) => (
                  <tr key={row.worker.id} className="border-b border-border-primary/50 hover:bg-bg-card-hover/50">
                    <td className="py-2.5 px-4 text-text-primary font-medium">
                      {row.worker.name}
                    </td>
                    <td className="py-2.5 px-4 text-right text-text-muted">
                      {row.daysWorked}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-accent-cyan">
                      {row.totalYards.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-semibold text-accent-amber">
                      {formatBDT(row.totalWage)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-bg-secondary/50">
                  <td className="py-2.5 px-4 text-sm font-semibold text-text-primary">
                    Total
                  </td>
                  <td className="py-2.5 px-4"></td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold text-accent-cyan">
                    {millTotalYards.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold text-accent-amber">
                    {formatBDT(millTotalWage)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
