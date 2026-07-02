"use client";

import { useMemo, useEffect, useState } from "react";
import Link from "next/link";
import {
  Factory,
  Users,
  Ruler,
  DollarSign,
  ClipboardEdit,
  FileBarChart,
  Receipt,
  CheckCircle2,
  Clock,
  ArrowRight,
  Loader2,
} from "lucide-react";
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
import StatusBadge from "@/components/StatusBadge";
import {
  calculateMonthlyWage,
  formatBDT,
  getMonthName,
} from "@/lib/wage-calc";
import { getActiveMachines } from "@/app/actions/machines";
import { getActiveWorkers } from "@/app/actions/workers";
import { getWageRates } from "@/app/actions/wageRates";
import { getEntriesForDate, getEntriesForMonth } from "@/app/actions/production";
import { getSession } from "next-auth/react";
import { Skeleton, StatCardSkeleton } from "@/components/Skeleton";

function getTodayStr() {
  return new Date().toISOString().split("T")[0];
}

export default function DashboardPage() {
  const today = getTodayStr();
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const [activeMachines, setActiveMachines] = useState<any[]>([]);
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
      const [m, w, r, tEntries, mEntries] = await Promise.all([
        getActiveMachines(),
        getActiveWorkers(),
        getWageRates(),
        getEntriesForDate(today),
        getEntriesForMonth(monthStr),
      ]);
      setActiveMachines(m);
      setActiveWorkers(w);
      setWageRates(r);
      setTodayEntries(tEntries);
      setMonthEntries(mEntries);
      setIsLoading(false);
    }
    loadData();
  }, [today, currentMonth, currentYear]);

  // Which machines have been logged today
  const loggedMachineIds = new Set(todayEntries.map((e) => e.machineId));

  // Monthly totals
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

  // Daily output chart data for current month
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const chartData = [];
  for (let day = 1; day <= Math.min(daysInMonth, now.getDate()); day++) {
    const dateStr = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dayEntries = monthEntries.filter((e) => e.date === dateStr);
    const totalYards = dayEntries.reduce((sum, e) => sum + e.totalYards, 0);
    chartData.push({ day: `${day}`, yards: totalYards });
  }

  const todayTotalYards = todayEntries.reduce((sum, e) => sum + e.totalYards, 0);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 lg:col-span-1" />
          <Skeleton className="h-64 lg:col-span-2" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-accent-cyan/10 via-accent-blue/5 to-accent-purple/10 border border-accent-cyan/20 p-6">
        <div className="relative z-10">
          <h1 className="text-2xl font-bold text-text-primary">
            Good {now.getHours() < 12 ? "Morning" : now.getHours() < 17 ? "Afternoon" : "Evening"}, {user?.name || "Admin"}
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Here&apos;s your mill overview for {getMonthName(currentMonth)} {currentYear}
          </p>
        </div>
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-accent-cyan/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-8 -right-24 w-48 h-48 bg-accent-blue/5 rounded-full blur-3xl" />
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Today's Output"
          value={`${todayTotalYards.toLocaleString()} yds`}
          icon={<Ruler size={20} />}
          variant="cyan"
        />
        <StatCard
          label="Monthly Output"
          value={`${monthlyYards.toLocaleString()} yds`}
          icon={<Factory size={20} />}
          variant="green"
        />
        <StatCard
          label="Wage Liability"
          value={formatBDT(monthlyWage)}
          icon={<DollarSign size={20} />}
          variant="amber"
        />
        <StatCard
          label="Active Workers"
          value={activeWorkers.length}
          icon={<Users size={20} />}
          variant="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Machine Status Grid */}
        <div className="lg:col-span-1 glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-text-primary">
              Today&apos;s Entry Status
            </h3>
            <span className="text-xs text-text-muted">
              {loggedMachineIds.size}/{activeMachines.length} logged
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {activeMachines.map((machine) => {
              const isLogged = loggedMachineIds.has(machine.id);
              const isRepair = machine.status === "UNDER_REPAIR";

              return (
                <div
                  key={machine.id}
                  className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-all duration-200 ${
                    isRepair
                      ? "bg-accent-amber/5 border-accent-amber/20"
                      : isLogged
                      ? "bg-accent-green/5 border-accent-green/20"
                      : "bg-bg-card border-border-primary hover:border-accent-cyan/30"
                  }`}
                >
                  <div className="flex items-center gap-1">
                    {isRepair ? (
                      <Clock size={12} className="text-accent-amber" />
                    ) : isLogged ? (
                      <CheckCircle2 size={12} className="text-accent-green" />
                    ) : (
                      <Clock size={12} className="text-text-muted" />
                    )}
                    <span className="text-xs font-bold text-text-primary">
                      M{machine.machineNumber}
                    </span>
                  </div>
                  <StatusBadge
                    status={isRepair ? "UNDER_REPAIR" : isLogged ? "LOGGED" : "PENDING"}
                    size="sm"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Daily Output Chart */}
        <div className="lg:col-span-2 glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-text-primary">
              Daily Output — {getMonthName(currentMonth)} {currentYear}
            </h3>
            <Link
              href="/reports/monthly"
              className="text-xs text-accent-cyan hover:underline flex items-center gap-1"
            >
              View full report <ArrowRight size={12} />
            </Link>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="day"
                  tick={{ fill: "#64748b", fontSize: 11 }}
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
                  labelStyle={{ color: "#94a3b8" }}
                  formatter={(value: unknown) => [`${value} yards`, "Output"]}
                />
                <Bar
                  dataKey="yards"
                  fill="url(#barGradient)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={24}
                />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/entry"
          className="group flex items-center gap-4 p-5 rounded-xl bg-bg-card border border-border-primary hover:border-accent-cyan/30 hover:bg-bg-card-hover transition-all duration-200"
        >
          <div className="w-10 h-10 rounded-lg bg-accent-cyan/15 text-accent-cyan flex items-center justify-center group-hover:scale-110 transition-transform">
            <ClipboardEdit size={20} />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary">
              Enter Today&apos;s Data
            </p>
            <p className="text-xs text-text-muted">
              Log production for today
            </p>
          </div>
          <ArrowRight
            size={16}
            className="ml-auto text-text-muted group-hover:text-accent-cyan group-hover:translate-x-1 transition-all"
          />
        </Link>

        <Link
          href="/reports/monthly"
          className="group flex items-center gap-4 p-5 rounded-xl bg-bg-card border border-border-primary hover:border-accent-green/30 hover:bg-bg-card-hover transition-all duration-200"
        >
          <div className="w-10 h-10 rounded-lg bg-accent-green/15 text-accent-green flex items-center justify-center group-hover:scale-110 transition-transform">
            <FileBarChart size={20} />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary">
              Monthly Report
            </p>
            <p className="text-xs text-text-muted">
              View {getMonthName(currentMonth)} summary
            </p>
          </div>
          <ArrowRight
            size={16}
            className="ml-auto text-text-muted group-hover:text-accent-green group-hover:translate-x-1 transition-all"
          />
        </Link>

        <Link
          href="/reports/payslip"
          className="group flex items-center gap-4 p-5 rounded-xl bg-bg-card border border-border-primary hover:border-accent-amber/30 hover:bg-bg-card-hover transition-all duration-200"
        >
          <div className="w-10 h-10 rounded-lg bg-accent-amber/15 text-accent-amber flex items-center justify-center group-hover:scale-110 transition-transform">
            <Receipt size={20} />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary">
              Generate Payslip
            </p>
            <p className="text-xs text-text-muted">
              Worker wage slip & invoice
            </p>
          </div>
          <ArrowRight
            size={16}
            className="ml-auto text-text-muted group-hover:text-accent-amber group-hover:translate-x-1 transition-all"
          />
        </Link>
      </div>

      {/* Recent Entries Table */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-text-primary">
            Recent Production Entries
          </h3>
          <Link
            href="/reports/daily"
            className="text-xs text-accent-cyan hover:underline flex items-center gap-1"
          >
            View all <ArrowRight size={12} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-primary">
                <th className="text-left py-2.5 px-3 text-xs font-medium text-text-muted uppercase tracking-wider">
                  Date
                </th>
                <th className="text-left py-2.5 px-3 text-xs font-medium text-text-muted uppercase tracking-wider">
                  Machine
                </th>
                <th className="text-left py-2.5 px-3 text-xs font-medium text-text-muted uppercase tracking-wider">
                  Worker
                </th>
                <th className="text-left py-2.5 px-3 text-xs font-medium text-text-muted uppercase tracking-wider">
                  Segments
                </th>
                <th className="text-right py-2.5 px-3 text-xs font-medium text-text-muted uppercase tracking-wider">
                  Total Yards
                </th>
              </tr>
            </thead>
            <tbody>
              {monthEntries.slice(0, 8).map((entry) => {
                const machine = entry.machine;
                const worker = entry.worker;
                return (
                  <tr
                    key={entry.id}
                    className="border-b border-border-primary/50 hover:bg-bg-card-hover/50 transition-colors"
                  >
                    <td className="py-2.5 px-3 text-text-secondary">{entry.date}</td>
                    <td className="py-2.5 px-3">
                      <span className="text-text-primary font-medium">
                        M{machine?.machineNumber}
                      </span>
                      <span className="text-text-muted ml-1 text-xs">
                        {machine?.typeModel}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-text-primary">{worker?.name}</td>
                    <td className="py-2.5 px-3 text-text-muted">
                      {entry.segments.join(" + ")}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-accent-cyan">
                      {entry.totalYards}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
