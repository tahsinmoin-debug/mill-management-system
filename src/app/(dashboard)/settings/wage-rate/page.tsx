"use client";

import { useState, useEffect, useTransition } from "react";
import { DollarSign, AlertTriangle, History, Plus, Loader2 } from "lucide-react";
import Modal from "@/components/Modal";
import { formatDate, formatBDT } from "@/lib/wage-calc";
import { getWageRates, createWageRate } from "@/app/actions/wageRates";

export default function WageRateSettingsPage() {
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [rates, setRates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const [newRate, setNewRate] = useState("");
  const [newDate, setNewDate] = useState("");

  const fetchRates = async () => {
    setIsLoading(true);
    const data = await getWageRates();
    setRates(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchRates();
  }, []);

  const handleAddRate = () => {
    if (!newRate || !newDate) return;
    startTransition(async () => {
      await createWageRate({
        ratePerYard: parseFloat(newRate),
        effectiveFrom: newDate
      });
      setShowUpdateModal(false);
      setNewRate("");
      setNewDate("");
      fetchRates();
    });
  };

  if (isLoading && rates.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-accent-cyan" size={32} />
      </div>
    );
  }

  // Rates are ordered by desc, so current rate is rates[0]
  const currentRate = rates[0] || { ratePerYard: 0, effectiveFrom: "N/A" };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Current Rate Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-accent-amber/10 via-bg-card to-bg-card border border-accent-amber/20 p-8">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-accent-amber/15 text-accent-amber flex items-center justify-center">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wider">
                Current Rate Per Yard
              </p>
              <p className="text-4xl font-bold text-text-primary">
                {currentRate.ratePerYard}{" "}
                <span className="text-lg text-text-muted">BDT/yard</span>
              </p>
            </div>
          </div>
          <p className="text-sm text-text-secondary">
            Effective from{" "}
            <span className="font-semibold text-text-primary">
              {formatDate(currentRate.effectiveFrom)}
            </span>
          </p>
        </div>
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-accent-amber/5 rounded-full blur-3xl" />
      </div>

      {/* Warning */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-accent-amber/5 border border-accent-amber/20">
        <AlertTriangle size={18} className="text-accent-amber shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-accent-amber">Important</p>
          <p className="text-xs text-text-muted mt-1">
            Changing the rate will only affect entries created <strong>after</strong> the
            effective date. Historical payslips and calculations will continue to use the
            rate that was active on each entry&apos;s date. This ensures past records remain
            accurate.
          </p>
        </div>
      </div>

      {/* Update Button */}
      <button
        onClick={() => setShowUpdateModal(true)}
        className="no-print flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent-cyan to-accent-blue text-white font-medium rounded-lg text-sm hover:shadow-lg hover:shadow-accent-cyan/20 transition-all"
      >
        <Plus size={16} />
        Update Wage Rate
      </button>

      {/* Rate History */}
      <div className="glass-card overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3 border-b border-border-primary bg-bg-secondary/50">
          <History size={16} className="text-text-muted" />
          <h3 className="text-sm font-semibold text-text-primary">
            Rate History
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-primary">
                <th className="text-left py-2.5 px-5 text-xs font-medium text-text-muted uppercase">
                  Effective From
                </th>
                <th className="text-right py-2.5 px-5 text-xs font-medium text-text-muted uppercase">
                  Rate (BDT/yard)
                </th>
                <th className="text-right py-2.5 px-5 text-xs font-medium text-text-muted uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {rates.map((rate, idx) => (
                <tr
                  key={rate.id}
                  className="border-b border-border-primary/50 hover:bg-bg-card-hover/50"
                >
                  <td className="py-3 px-5 text-text-primary">
                    {formatDate(rate.effectiveFrom)}
                  </td>
                  <td className="py-3 px-5 text-right font-mono font-semibold text-accent-amber">
                    {formatBDT(rate.ratePerYard)}
                  </td>
                  <td className="py-3 px-5 text-right">
                    {idx === 0 ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-accent-green/10 text-accent-green">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
                        Current
                      </span>
                    ) : (
                      <span className="text-xs text-text-muted">Archived</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Update Modal */}
      <Modal
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        title="Update Wage Rate"
      >
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-accent-amber/5 border border-accent-amber/20">
            <p className="text-xs text-accent-amber">
              This will create a new rate entry. Entries on or after the effective date
              will use this new rate.
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              New Rate (BDT per yard)
            </label>
            <input
              type="number"
              step="0.01"
              value={newRate}
              onChange={(e) => setNewRate(e.target.value)}
              placeholder="e.g. 3.00"
              className="w-full px-4 py-2.5 bg-bg-input border border-border-primary rounded-lg text-sm text-text-primary focus:border-accent-cyan outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Effective From
            </label>
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-bg-input border border-border-primary rounded-lg text-sm text-text-primary focus:border-accent-cyan outline-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleAddRate}
              disabled={isPending || !newRate || !newDate}
              className="flex-1 flex justify-center items-center py-2.5 bg-gradient-to-r from-accent-cyan to-accent-blue text-white font-medium rounded-lg text-sm hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isPending ? <Loader2 size={16} className="animate-spin" /> : "Save New Rate"}
            </button>
            <button
              onClick={() => setShowUpdateModal(false)}
              disabled={isPending}
              className="px-6 py-2.5 bg-bg-secondary border border-border-primary text-text-primary rounded-lg text-sm hover:bg-bg-card-hover transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
