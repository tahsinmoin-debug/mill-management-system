"use client";

import { useState, useEffect, useMemo } from "react";
import { Printer, ChevronDown, ChevronRight, Ruler } from "lucide-react";
import { getEntriesForDate } from "@/app/actions/production";
import { Skeleton, StatCardSkeleton } from "@/components/Skeleton";
import { useLang } from "@/lib/i18n";

function getTodayStr() {
  return new Date().toISOString().split("T")[0];
}

export default function WeeklyReportPage() {
  const { t } = useLang();
  const [selectedDate, setSelectedDate] = useState(getTodayStr());
  const [expandedMachines, setExpandedMachines] = useState<Set<string>>(new Set());
  const [weekEntries, setWeekEntries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadEntries() {
      setIsLoading(true);
      const data = await getEntriesForDate(selectedDate);
      setWeekEntries(data);
      setIsLoading(false);
    }
    loadEntries();
  }, [selectedDate]);

  const millTotalYards = weekEntries.reduce((sum, e) => sum + e.totalYards, 0);

  const machineGroups = useMemo(() => {
    const groups: Record<string, { machine: any; entries: typeof weekEntries; total: number }> = {};
    weekEntries.forEach((entry) => {
      if (!groups[entry.machineId]) {
        groups[entry.machineId] = { machine: entry.machine, entries: [], total: 0 };
      }
      groups[entry.machineId].entries.push(entry);
      groups[entry.machineId].total += entry.totalYards;
    });
    return Object.values(groups).sort((a, b) => a.machine.machineNumber - b.machine.machineNumber);
  }, [weekEntries]);

  const toggleMachine = (id: string) => {
    setExpandedMachines((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-16 w-full max-w-sm" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-sm text-text-secondary">{t("weekly.date")}:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 bg-bg-card border border-border-primary rounded-xl text-sm text-text-primary focus:border-accent-cyan outline-none"
          />
        </div>
        <button
          onClick={() => window.print()}
          className="no-print flex items-center gap-2 px-4 py-2 bg-bg-card border border-border-primary text-text-primary text-sm rounded-xl hover:bg-bg-card-hover transition-all"
        >
          <Printer size={16} />
          {t("weekly.print")}
        </button>
      </div>

      {/* Summary */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent-cyan/15 text-accent-cyan flex items-center justify-center">
            <Ruler size={24} />
          </div>
          <div className="flex-1">
            <p className="text-xs text-text-muted uppercase tracking-wider">
              {t("weekly.mill_total")} — {selectedDate}
            </p>
            <p className="text-3xl font-bold gradient-text">
              {millTotalYards.toLocaleString()} {t("common.yards")}
            </p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-sm text-text-muted">
              {machineGroups.length} {t("weekly.machines_entries").split("·")[0]}· {weekEntries.length} {t("weekly.machines_entries").split("·")[1]}
            </p>
          </div>
        </div>
      </div>

      {/* Machine Breakdown */}
      <div className="glass-card overflow-hidden">
        <div className="px-5 py-3 border-b border-border-primary bg-bg-secondary/50">
          <h3 className="text-sm font-semibold text-text-primary">
            {t("weekly.breakdown")}
          </h3>
        </div>

        {machineGroups.length === 0 ? (
          <div className="py-12 text-center text-sm text-text-muted">
            {t("weekly.no_entries")}
          </div>
        ) : (
          <div className="divide-y divide-border-primary/50">
            {machineGroups.map((group) => {
              const isExpanded = expandedMachines.has(group.machine.id);
              return (
                <div key={group.machine.id}>
                  <button
                    onClick={() => toggleMachine(group.machine.id)}
                    className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-bg-card-hover/50 transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronDown size={16} className="text-accent-cyan" />
                    ) : (
                      <ChevronRight size={16} className="text-text-muted" />
                    )}
                    <div className="w-8 h-8 rounded-lg bg-accent-cyan/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-accent-cyan">
                        M{group.machine.machineNumber}
                      </span>
                    </div>
                    <div className="flex-1 text-left">
                      <span className="text-sm font-medium text-text-primary">
                        Machine {group.machine.machineNumber}
                      </span>
                      <span className="text-xs text-text-muted ml-2">
                        {group.machine.typeModel}
                      </span>
                    </div>
                    <span className="text-xs text-text-muted">
                      {group.entries.length} {t("weekly.workers_count")}
                    </span>
                    <span className="font-mono font-semibold text-accent-cyan text-sm ml-4">
                      {group.total} {t("common.yards")}
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="bg-bg-secondary/30 border-t border-border-primary/30">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border-primary/30">
                            <th className="text-left py-2 px-8 text-xs font-medium text-text-muted">
                              {t("weekly.worker")}
                            </th>
                            <th className="text-left py-2 px-4 text-xs font-medium text-text-muted">
                              {t("weekly.days")}
                            </th>
                            <th className="text-right py-2 px-5 text-xs font-medium text-text-muted">
                              {t("weekly.total")}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.entries.map((entry) => (
                            <tr key={entry.id} className="border-b border-border-primary/20 animate-slide-in">
                              <td className="py-2 px-8 text-text-primary">
                                {entry.worker?.name}{" "}
                                <span className="text-xs text-text-muted">({entry.worker?.workerId})</span>
                              </td>
                              <td className="py-2 px-4 text-text-muted font-mono text-xs">
                                [{entry.segments.map((s: number) => s || 0).join(", ")}]
                              </td>
                              <td className="py-2 px-5 text-right font-mono font-semibold text-accent-cyan">
                                {entry.totalYards}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {machineGroups.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3 bg-bg-secondary/50 border-t border-border-primary">
            <span className="text-sm font-medium text-text-secondary">
              {t("weekly.grand_total")}
            </span>
            <span className="text-lg font-bold font-mono gradient-text">
              {millTotalYards.toLocaleString()} {t("common.yards")}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
