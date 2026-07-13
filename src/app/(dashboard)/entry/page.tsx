"use client";

import { useState, useMemo, useEffect, useTransition } from "react";
import { Plus, Trash2, Save, ArrowRight, CheckCircle2, Loader2, Calendar, ClipboardEdit } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import { getApplicableRate, formatBDT } from "@/lib/wage-calc";
import { getActiveMachines } from "@/app/actions/machines";
import { getActiveWorkers } from "@/app/actions/workers";
import { getWageRates } from "@/app/actions/wageRates";
import { getEntriesForDate, createProductionEntries } from "@/app/actions/production";
import { Skeleton } from "@/components/Skeleton";
import { useLang } from "@/lib/i18n";

function getTodayStr() {
  return new Date().toISOString().split("T")[0];
}

interface MachineEntryState {
  id: string;
  machineId: string;
  segments: number[]; // 7 elements
}

export default function ProductionEntryPage() {
  const { t } = useLang();
  const [selectedDate, setSelectedDate] = useState(getTodayStr());
  const [selectedWorker, setSelectedWorker] = useState("");
  const [machineEntries, setMachineEntries] = useState<MachineEntryState[]>([
    { id: crypto.randomUUID(), machineId: "", segments: [0, 0, 0, 0, 0, 0, 0] }
  ]);

  const [savedEntries, setSavedEntries] = useState<{ worker: string; count: number; totalYards: number }[]>([]);

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
  }, [selectedDate, savedEntries]);

  const totalYards = machineEntries.reduce((sum, entry) => {
    return sum + entry.segments.reduce((acc, val) => acc + (val || 0), 0);
  }, 0);

  const applicableRate = useMemo(
    () => getApplicableRate(wageRates, selectedDate)?.ratePerYard || 0,
    [selectedDate, wageRates]
  );
  const liveWage = totalYards * applicableRate;

  const addMachine = () => {
    setMachineEntries([...machineEntries, { id: crypto.randomUUID(), machineId: "", segments: [0, 0, 0, 0, 0, 0, 0] }]);
  };

  const removeMachine = (id: string) => {
    if (machineEntries.length > 1) {
      setMachineEntries(machineEntries.filter(m => m.id !== id));
    }
  };

  const updateMachineSelection = (id: string, machineId: string) => {
    setMachineEntries(machineEntries.map(m => m.id === id ? { ...m, machineId } : m));
  };

  const updateSegment = (machineId: string, dayIdx: number, value: string) => {
    const num = parseInt(value) || 0;
    setMachineEntries(machineEntries.map(m => {
      if (m.id === machineId) {
        const newSegments = [...m.segments];
        newSegments[dayIdx] = num;
        return { ...m, segments: newSegments };
      }
      return m;
    }));
  };

  const handleSave = () => {
    if (!selectedWorker || totalYards === 0) return;
    
    // Ensure all entries have a machine selected
    if (machineEntries.some(m => !m.machineId)) {
      alert("Please select a machine for all entries.");
      return;
    }

    startTransition(async () => {
      const entriesToSave = machineEntries.map(m => {
        const tYards = m.segments.reduce((acc, val) => acc + (val || 0), 0);
        return {
          date: selectedDate,
          workerId: selectedWorker,
          machineId: m.machineId,
          segments: m.segments,
          totalYards: tYards,
        };
      }).filter(e => e.totalYards > 0);

      if (entriesToSave.length > 0) {
        await createProductionEntries(entriesToSave);
        
        const workerName = activeWorkers.find((w) => w.id === selectedWorker)?.name || "";
        setSavedEntries([
          ...savedEntries,
          { worker: workerName, count: entriesToSave.length, totalYards: totalYards }
        ]);
      }

      setSelectedWorker("");
      setMachineEntries([{ id: crypto.randomUUID(), machineId: "", segments: [0, 0, 0, 0, 0, 0, 0] }]);
    });
  };

  if (isLoadingData && activeMachines.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-[400px] w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Entry Form */}
        <div className="lg:col-span-3 glass-card p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-5 flex items-center gap-2">
            <ClipboardEdit className="text-accent-cyan" size={20} />
            {t("entry.title")}
          </h3>

          <div className="space-y-6">
            {/* Worker & Date Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">
                  {t("entry.worker")}
                </label>
                <select
                  value={selectedWorker}
                  onChange={(e) => setSelectedWorker(e.target.value)}
                  className="w-full px-4 py-3 bg-bg-input border border-border-primary rounded-xl text-sm text-text-primary focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan/30 transition-all outline-none"
                >
                  <option value="">{t("entry.select_worker")}</option>
                  {activeWorkers.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.workerId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">
                  {t("entry.date")}
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-3 bg-bg-input border border-border-primary rounded-xl text-sm text-text-primary focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan/30 transition-all outline-none"
                />
              </div>
            </div>

            {/* Machine Entries */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between border-b border-border-primary pb-2">
                <label className="text-sm font-semibold text-text-primary">
                  {t("entry.machine")} ও উৎপাদন
                </label>
                <button
                  onClick={addMachine}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-cyan/10 text-accent-cyan hover:bg-accent-cyan/20 text-xs font-medium transition-colors"
                >
                  <Plus size={14} />
                  {t("entry.add_machine")}
                </button>
              </div>

              {machineEntries.map((machineEntry, mIdx) => (
                <div key={machineEntry.id} className="p-4 rounded-xl border border-border-primary bg-bg-secondary/30 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent-blue/10 text-accent-blue flex items-center justify-center text-xs font-bold">
                      {mIdx + 1}
                    </span>
                    <select
                      value={machineEntry.machineId}
                      onChange={(e) => updateMachineSelection(machineEntry.id, e.target.value)}
                      className="flex-1 px-4 py-2 bg-bg-input border border-border-primary rounded-xl text-sm text-text-primary focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan/30 transition-all outline-none"
                    >
                      <option value="">{t("entry.select_machine")}</option>
                      {activeMachines.map((m) => (
                        <option key={m.id} value={m.id}>
                          Machine {m.machineNumber} — {m.typeModel}
                        </option>
                      ))}
                    </select>
                    {machineEntries.length > 1 && (
                      <button
                        onClick={() => removeMachine(machineEntry.id)}
                        className="p-2 text-text-muted hover:text-accent-pink hover:bg-accent-pink/10 rounded-lg transition-colors"
                        title={t("entry.remove_machine")}
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-2">
                      {t("entry.segments")}
                    </label>
                    <div className="grid grid-cols-7 gap-2">
                      {machineEntry.segments.map((val, dIdx) => (
                        <div key={dIdx} className="text-center space-y-1">
                          <span className="text-[10px] text-text-muted font-medium block">D{dIdx + 1}</span>
                          <input
                            type="number"
                            min="0"
                            value={val || ""}
                            onChange={(e) => updateSegment(machineEntry.id, dIdx, e.target.value)}
                            className="w-full px-2 py-2 text-center bg-white border border-border-primary rounded-lg text-sm text-text-primary focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan/30 outline-none placeholder:text-gray-300"
                            placeholder="0"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Preview */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-accent-cyan/5 to-accent-blue/5 border border-accent-cyan/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs text-text-muted mb-0.5">{t("entry.total_yards")}</p>
                <p className="text-2xl font-bold text-text-primary">
                  {totalYards.toLocaleString()} <span className="text-sm font-normal text-text-muted">{t("entry.yards")}</span>
                </p>
              </div>

              {!applicableRate ? (
                <div className="text-accent-pink text-xs bg-accent-pink/10 px-3 py-2 rounded-lg flex-1">
                  {t("entry.no_rate_warning")}
                </div>
              ) : (
                <div className="sm:text-right">
                  <p className="text-xs text-text-muted mb-0.5">{t("entry.live_wage")} ({applicableRate} {t("common.bdt_per_yard")})</p>
                  <p className="text-2xl font-bold text-accent-amber">
                    {formatBDT(liveWage)}
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={handleSave}
              disabled={isPending || !selectedWorker || totalYards === 0 || machineEntries.some(m => !m.machineId)}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-accent-cyan hover:bg-accent-cyan/90 text-white rounded-xl font-medium transition-all shadow-md shadow-accent-cyan/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              {t("common.save")}
            </button>
          </div>
        </div>

        {/* Sidebar info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-5">
            <h4 className="text-sm font-semibold text-text-primary mb-3">
              {t("entry.session_entries")}
            </h4>
            <div className="space-y-3">
              {savedEntries.length === 0 ? (
                <p className="text-sm text-text-muted text-center py-6">
                  {t("entry.no_entries")}<br />{t("entry.fill_form")}
                </p>
              ) : (
                savedEntries.map((e, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-bg-secondary/50 border border-border-primary/50 animate-fade-in">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 size={18} className="text-accent-green" />
                      <div>
                        <p className="text-sm font-medium text-text-primary">{e.worker}</p>
                        <p className="text-xs text-text-muted">{e.count} machines</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-text-primary">{e.totalYards}</p>
                      <p className="text-[10px] text-text-muted">{t("entry.yards")}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="glass-card p-5">
            <h4 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
              <Calendar size={16} />
              {t("entry.existing_entries")}
            </h4>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
              {existingEntries.length === 0 ? (
                <p className="text-sm text-text-muted text-center py-4">
                  {t("entry.no_existing")}
                </p>
              ) : (
                existingEntries.map((e) => (
                  <div key={e.id} className="p-3 rounded-lg bg-white border border-border-primary flex justify-between items-center group hover:border-accent-cyan/30 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-text-primary">{e.worker?.name}</p>
                      <p className="text-xs text-text-muted">Machine {e.machine?.machineNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-text-primary">{e.totalYards.toLocaleString()}</p>
                      <p className="text-[10px] text-text-muted text-right">
                        {e.segments.join(" + ")}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
