"use client";

import { useState, useMemo, useEffect, useTransition } from "react";
import { Plus, Trash2, Save, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import { getApplicableRate, formatBDT } from "@/lib/wage-calc";
import { getActiveMachines } from "@/app/actions/machines";
import { getActiveWorkers } from "@/app/actions/workers";
import { getWageRates } from "@/app/actions/wageRates";
import { getEntriesForDate, createProductionEntry } from "@/app/actions/production";

function getTodayStr() {
  return new Date().toISOString().split("T")[0];
}

export default function ProductionEntryPage() {
  const [selectedDate, setSelectedDate] = useState(getTodayStr());
  const [selectedMachine, setSelectedMachine] = useState("");
  const [selectedWorker, setSelectedWorker] = useState("");
  const [segments, setSegments] = useState<number[]>([0]);
  const [savedEntries, setSavedEntries] = useState<
    { machine: string; worker: string; segments: number[]; total: number }[]
  >([]);

  const [activeMachines, setActiveMachines] = useState<any[]>([]);
  const [activeWorkers, setActiveWorkers] = useState<any[]>([]);
  const [wageRates, setWageRates] = useState<any[]>([]);
  const [existingEntries, setExistingEntries] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    async function loadInitialData() {
      const [m, w, r] = await Promise.all([
        getActiveMachines(),
        getActiveWorkers(),
        getWageRates()
      ]);
      setActiveMachines(m);
      setActiveWorkers(w);
      setWageRates(r);
      setIsLoadingData(false);
    }
    loadInitialData();
  }, []);

  useEffect(() => {
    async function loadEntries() {
      const entries = await getEntriesForDate(selectedDate);
      setExistingEntries(entries);
    }
    loadEntries();
  }, [selectedDate, savedEntries]); // reload when new entries are saved

  const totalYards = segments.reduce((sum, s) => sum + (s || 0), 0);

  const applicableRate = useMemo(
    () => getApplicableRate(wageRates, selectedDate)?.ratePerYard || 0,
    [selectedDate, wageRates]
  );
  const liveWage = totalYards * applicableRate;

  const addSegment = () => setSegments([...segments, 0]);

  const removeSegment = (idx: number) => {
    if (segments.length > 1) {
      setSegments(segments.filter((_, i) => i !== idx));
    }
  };

  const updateSegment = (idx: number, value: string) => {
    const num = parseInt(value) || 0;
    const updated = [...segments];
    updated[idx] = num;
    setSegments(updated);
  };

  const handleSave = () => {
    if (!selectedMachine || !selectedWorker || totalYards === 0) return;

    startTransition(async () => {
      await createProductionEntry({
        date: selectedDate,
        machineId: selectedMachine,
        workerId: selectedWorker,
        segments: segments.filter((s) => s > 0),
        totalYards: totalYards
      });

      const machineName = activeMachines.find((m) => m.id === selectedMachine)?.machineNumber || "";
      const workerName = activeWorkers.find((w) => w.id === selectedWorker)?.name || "";

      setSavedEntries([
        ...savedEntries,
        {
          machine: `M${machineName}`,
          worker: workerName,
          segments: segments.filter((s) => s > 0),
          total: totalYards,
        },
      ]);

      // Reset form for next worker
      setSelectedWorker("");
      setSegments([0]);
    });
  };

  const handleSaveAndNext = () => {
    handleSave();
  };

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-accent-cyan" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Entry Form */}
        <div className="lg:col-span-3 glass-card p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-5">
            New Production Entry
          </h3>

          <div className="space-y-5">
            {/* Date & Machine Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">
                  Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-bg-input border border-border-primary rounded-lg text-sm text-text-primary focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan/30 transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">
                  Machine
                </label>
                <select
                  value={selectedMachine}
                  onChange={(e) => setSelectedMachine(e.target.value)}
                  className="w-full px-4 py-2.5 bg-bg-input border border-border-primary rounded-lg text-sm text-text-primary focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan/30 transition-all outline-none"
                >
                  <option value="">Select Machine</option>
                  {activeMachines.map((m) => (
                    <option key={m.id} value={m.id}>
                      Machine {m.machineNumber} — {m.typeModel}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Worker */}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">
                Worker
              </label>
              <select
                value={selectedWorker}
                onChange={(e) => setSelectedWorker(e.target.value)}
                className="w-full px-4 py-2.5 bg-bg-input border border-border-primary rounded-lg text-sm text-text-primary focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan/30 transition-all outline-none"
              >
                <option value="">Select Worker</option>
                {activeWorkers.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.workerId})
                  </option>
                ))}
              </select>
            </div>

            {/* Segments */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-text-secondary">
                  Segment Yards (thread changes)
                </label>
                <button
                  onClick={addSegment}
                  className="flex items-center gap-1 text-xs text-accent-cyan hover:text-accent-cyan/80 transition-colors"
                >
                  <Plus size={14} />
                  Add Segment
                </button>
              </div>
              <div className="space-y-2">
                {segments.map((seg, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-xs text-text-muted w-6 text-right shrink-0">
                      {idx + 1}.
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={seg || ""}
                      onChange={(e) => updateSegment(idx, e.target.value)}
                      placeholder="Yards"
                      className="flex-1 px-4 py-3 bg-bg-input border border-border-primary rounded-lg text-base text-text-primary font-mono focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan/30 transition-all outline-none"
                      style={{ fontSize: "18px" }}
                    />
                    {segments.length > 1 && (
                      <button
                        onClick={() => removeSegment(idx)}
                        className="p-2 rounded-lg hover:bg-accent-red/10 text-text-muted hover:text-accent-red transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-bg-secondary border border-border-primary">
              <span className="text-sm font-medium text-text-secondary">
                Total Yards
              </span>
              <span className="text-2xl font-bold font-mono gradient-text">
                {totalYards}
              </span>
            </div>

            {/* Live Wage Preview */}
            <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-accent-amber/5 border border-accent-amber/20">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-accent-amber">
                  Live Wage Preview
                </span>
                <span className="text-xs text-text-muted">
                  Rate applied: {applicableRate} BDT/yard
                </span>
              </div>
              <span className="text-xl font-bold font-mono text-accent-amber">
                {formatBDT(liveWage)}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleSaveAndNext}
                disabled={isPending || !selectedMachine || !selectedWorker || totalYards === 0}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-accent-cyan to-accent-blue text-white font-medium rounded-lg text-sm
                  hover:shadow-lg hover:shadow-accent-cyan/20 active:scale-[0.98] transition-all duration-200
                  disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Save & Add Next Worker
                {!isPending && <ArrowRight size={14} />}
              </button>
              <button
                onClick={handleSave}
                disabled={isPending || !selectedMachine || !selectedWorker || totalYards === 0}
                className="px-6 py-3 bg-bg-card border border-border-primary text-text-primary font-medium rounded-lg text-sm
                  hover:bg-bg-card-hover transition-all
                  disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Save Only
              </button>
            </div>
          </div>
        </div>

        {/* Session Entries */}
        <div className="lg:col-span-2 glass-card p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-4">
            Entries This Session
          </h3>

          {savedEntries.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-12 h-12 rounded-xl bg-bg-card border border-border-primary mx-auto mb-3 flex items-center justify-center">
                <CheckCircle2 size={24} className="text-text-muted" />
              </div>
              <p className="text-sm text-text-muted">No entries yet.</p>
              <p className="text-xs text-text-muted mt-1">
                Fill the form and save to add entries.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {savedEntries.map((entry, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-bg-secondary border border-border-primary animate-slide-in"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-text-primary">
                      {entry.worker}
                    </span>
                    <StatusBadge status="LOGGED" />
                  </div>
                  <div className="flex items-center justify-between text-xs text-text-muted">
                    <span>{entry.machine}</span>
                    <span>
                      {entry.segments.join(" + ")} ={" "}
                      <span className="font-mono font-semibold text-accent-cyan">
                        {entry.total} yds
                      </span>
                    </span>
                  </div>
                </div>
              ))}

              <div className="pt-3 border-t border-border-primary flex items-center justify-between">
                <span className="text-xs text-text-muted">
                  {savedEntries.length} entries
                </span>
                <span className="text-sm font-semibold text-text-primary">
                  Total:{" "}
                  <span className="font-mono text-accent-cyan">
                    {savedEntries.reduce((s, e) => s + e.total, 0)} yds
                  </span>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Existing entries for selected date */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-4">
          Existing Entries for {selectedDate}
        </h3>
        {existingEntries.length === 0 ? (
          <p className="text-sm text-text-muted py-4 text-center">
            No entries recorded for this date yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-primary">
                  <th className="text-left py-2 px-3 text-xs font-medium text-text-muted uppercase tracking-wider">
                    Machine
                  </th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-text-muted uppercase tracking-wider">
                    Worker
                  </th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-text-muted uppercase tracking-wider">
                    Segments
                  </th>
                  <th className="text-right py-2 px-3 text-xs font-medium text-text-muted uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {existingEntries.slice(0, 15).map((entry) => {
                  return (
                    <tr
                      key={entry.id}
                      className="border-b border-border-primary/50 hover:bg-bg-card-hover/50"
                    >
                      <td className="py-2 px-3 text-text-primary font-medium">
                        M{entry.machine?.machineNumber}
                      </td>
                      <td className="py-2 px-3 text-text-secondary">
                        {entry.worker?.name}
                      </td>
                      <td className="py-2 px-3 text-text-muted font-mono text-xs">
                        {entry.segments.join(" + ")}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-semibold text-accent-cyan">
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
    </div>
  );
}
