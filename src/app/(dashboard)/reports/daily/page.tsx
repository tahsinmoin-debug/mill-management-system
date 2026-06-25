"use client";

import { useState, useMemo } from "react";
import { Printer, ChevronDown, ChevronRight, Ruler } from "lucide-react";
import {
  mockMachines,
  mockWorkers,
  mockProductionEntries,
  getTodayStr,
} from "@/lib/mock-data";

export default function DailyReportPage() {
  const [selectedDate, setSelectedDate] = useState(getTodayStr());
  const [expandedMachines, setExpandedMachines] = useState<Set<string>>(new Set());

  const dayEntries = useMemo(
    () => mockProductionEntries.filter((e) => e.date === selectedDate),
    [selectedDate]
  );

  const millTotalYards = dayEntries.reduce((sum, e) => sum + e.totalYards, 0);

  // Group by machine
  const machineGroups = useMemo(() => {
    const groups: Record<
      string,
      { machine: (typeof mockMachines)[0]; entries: typeof dayEntries; total: number }
    > = {};

    dayEntries.forEach((entry) => {
      if (!groups[entry.machineId]) {
        const machine = mockMachines.find((m) => m.id === entry.machineId);
        if (!machine) return;
        groups[entry.machineId] = { machine, entries: [], total: 0 };
      }
      groups[entry.machineId].entries.push(entry);
      groups[entry.machineId].total += entry.totalYards;
    });

    return Object.values(groups).sort(
      (a, b) => a.machine.machineNumber - b.machine.machineNumber
    );
  }, [dayEntries]);

  const toggleMachine = (id: string) => {
    setExpandedMachines((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-sm text-text-secondary">Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 bg-bg-card border border-border-primary rounded-lg text-sm text-text-primary focus:border-accent-cyan outline-none"
          />
        </div>
        <button
          onClick={() => window.print()}
          className="no-print flex items-center gap-2 px-4 py-2 bg-bg-card border border-border-primary text-text-primary text-sm rounded-lg hover:bg-bg-card-hover transition-all"
        >
          <Printer size={16} />
          Print Report
        </button>
      </div>

      {/* Summary Card */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent-cyan/15 text-accent-cyan flex items-center justify-center">
            <Ruler size={24} />
          </div>
          <div>
            <p className="text-xs text-text-muted uppercase tracking-wider">
              Mill-Wide Total for {selectedDate}
            </p>
            <p className="text-3xl font-bold gradient-text">
              {millTotalYards.toLocaleString()} yards
            </p>
          </div>
          <div className="ml-auto text-right hidden sm:block">
            <p className="text-sm text-text-muted">
              {machineGroups.length} machines · {dayEntries.length} entries
            </p>
          </div>
        </div>
      </div>

      {/* Machine Breakdown */}
      <div className="glass-card overflow-hidden">
        <div className="px-5 py-3 border-b border-border-primary bg-bg-secondary/50">
          <h3 className="text-sm font-semibold text-text-primary">
            Per-Machine Breakdown
          </h3>
        </div>

        {machineGroups.length === 0 ? (
          <div className="py-12 text-center text-sm text-text-muted">
            No entries found for this date.
          </div>
        ) : (
          <div className="divide-y divide-border-primary/50">
            {machineGroups.map((group) => {
              const isExpanded = expandedMachines.has(group.machine.id);
              return (
                <div key={group.machine.id}>
                  {/* Machine Row */}
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
                      {group.entries.length} worker{group.entries.length !== 1 ? "s" : ""}
                    </span>
                    <span className="font-mono font-semibold text-accent-cyan text-sm ml-4">
                      {group.total} yds
                    </span>
                  </button>

                  {/* Worker Detail */}
                  {isExpanded && (
                    <div className="bg-bg-secondary/30 border-t border-border-primary/30">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border-primary/30">
                            <th className="text-left py-2 px-8 text-xs font-medium text-text-muted">
                              Worker
                            </th>
                            <th className="text-left py-2 px-4 text-xs font-medium text-text-muted">
                              Segments
                            </th>
                            <th className="text-right py-2 px-5 text-xs font-medium text-text-muted">
                              Total
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.entries.map((entry) => {
                            const worker = mockWorkers.find(
                              (w) => w.id === entry.workerId
                            );
                            return (
                              <tr
                                key={entry.id}
                                className="border-b border-border-primary/20 animate-slide-in"
                              >
                                <td className="py-2 px-8 text-text-primary">
                                  {worker?.name}{" "}
                                  <span className="text-xs text-text-muted">
                                    ({worker?.workerId})
                                  </span>
                                </td>
                                <td className="py-2 px-4 text-text-muted font-mono text-xs">
                                  {entry.segments.map((s) => s.yards).join(" + ")}
                                </td>
                                <td className="py-2 px-5 text-right font-mono font-semibold text-accent-cyan">
                                  {entry.totalYards}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Footer Total */}
        {machineGroups.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3 bg-bg-secondary/50 border-t border-border-primary">
            <span className="text-sm font-medium text-text-secondary">
              Grand Total
            </span>
            <span className="text-lg font-bold font-mono gradient-text">
              {millTotalYards.toLocaleString()} yards
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
