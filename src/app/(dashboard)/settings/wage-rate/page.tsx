"use client";

import { useState, useEffect, useTransition } from "react";
import { Plus, History, DollarSign, Loader2, AlertCircle } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import Modal from "@/components/Modal";
import { formatDate } from "@/lib/wage-calc";
import { getWageRates, createWageRate } from "@/app/actions/wageRates";
import { Skeleton } from "@/components/Skeleton";
import { useLang } from "@/lib/i18n";

export default function WageRatePage() {
  const { t } = useLang();
  const [showAddModal, setShowAddModal] = useState(false);
  const [rates, setRates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const todayStr = new Date().toISOString().split("T")[0];
  const [newRate, setNewRate] = useState("");
  const [newEffectiveDate, setNewEffectiveDate] = useState(todayStr);

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
    if (!newRate || !newEffectiveDate) return;
    startTransition(async () => {
      await createWageRate({
        ratePerYard: parseFloat(newRate),
        effectiveFrom: newEffectiveDate,
      });
      setShowAddModal(false);
      setNewRate("");
      fetchRates();
    });
  };

  const currentRate = rates[0];

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Current Rate Card */}
      <div className="glass-card p-6 border-2 border-accent-amber/30 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-accent-amber/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div>
            <h3 className="text-sm font-semibold text-text-secondary mb-1">
              {t("wage.current")}
            </h3>
            {currentRate ? (
              <div className="flex items-end gap-3">
                <span className="text-4xl font-bold font-mono text-accent-amber">
                  ৳{currentRate.ratePerYard.toFixed(2)}
                </span>
                <span className="text-sm text-text-muted mb-1 pb-0.5">
                  {t("wage.effective")}: {formatDate(currentRate.effectiveFrom)}
                </span>
              </div>
            ) : (
              <p className="text-text-muted">{t("wage.warning_text")}</p>
            )}
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-accent-amber to-accent-orange text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-accent-amber/20 transition-all shrink-0"
          >
            <Plus size={16} />
            {t("wage.update")}
          </button>
        </div>

        <div className="mt-6 flex items-start gap-3 p-4 rounded-xl bg-accent-amber/5 border border-accent-amber/10">
          <AlertCircle size={18} className="text-accent-amber shrink-0 mt-0.5" />
          <div className="text-sm text-text-secondary">
            <span className="font-semibold text-accent-amber">{t("wage.warning_title")}:</span> {t("wage.warning_text")}
          </div>
        </div>
      </div>

      {/* History */}
      <div className="glass-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border-primary bg-bg-secondary/50 flex items-center gap-2">
          <History size={18} className="text-text-muted" />
          <h3 className="text-sm font-semibold text-text-primary">
            {t("wage.history")}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-primary">
                <th className="text-left py-3 px-5 text-xs font-medium text-text-muted uppercase">
                  {t("wage.effective_from")}
                </th>
                <th className="text-left py-3 px-5 text-xs font-medium text-text-muted uppercase">
                  {t("wage.rate")}
                </th>
                <th className="text-right py-3 px-5 text-xs font-medium text-text-muted uppercase">
                  {t("wage.status")}
                </th>
              </tr>
            </thead>
            <tbody>
              {rates.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-text-muted text-sm">
                    {t("common.no_data")}
                  </td>
                </tr>
              ) : (
                rates.map((rate, idx) => (
                  <tr
                    key={rate.id}
                    className="border-b border-border-primary/50 hover:bg-bg-card-hover/50 transition-colors"
                  >
                    <td className="py-3 px-5 text-text-primary font-medium">
                      {formatDate(rate.effectiveFrom)}
                    </td>
                    <td className="py-3 px-5 font-mono text-text-secondary">
                      ৳{rate.ratePerYard.toFixed(2)}
                    </td>
                    <td className="py-3 px-5 text-right">
                      {idx === 0 ? (
                        <span className="px-2.5 py-1 text-[10px] font-semibold rounded-full bg-accent-amber/15 text-accent-amber border border-accent-amber/30">
                          {t("wage.current_label")}
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 text-[10px] font-medium rounded-full bg-bg-secondary text-text-muted border border-border-primary">
                          {t("wage.archived")}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={t("wage.update_title")}
      >
        <div className="space-y-4">
          <p className="text-xs text-text-muted">
            {t("wage.update_note")}
          </p>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              {t("wage.new_rate")}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
                ৳
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={newRate}
                onChange={(e) => setNewRate(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-2.5 bg-bg-input border border-border-primary rounded-xl text-sm text-text-primary font-mono focus:border-accent-cyan outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              {t("wage.effective_from")}
            </label>
            <input
              type="date"
              value={newEffectiveDate}
              onChange={(e) => setNewEffectiveDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-bg-input border border-border-primary rounded-xl text-sm text-text-primary focus:border-accent-cyan outline-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleAddRate}
              disabled={isPending || !newRate || !newEffectiveDate}
              className="flex-1 flex justify-center items-center py-2.5 bg-gradient-to-r from-accent-amber to-accent-orange text-white font-medium rounded-xl text-sm hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isPending ? <Loader2 size={16} className="animate-spin" /> : t("wage.save")}
            </button>
            <button
              onClick={() => setShowAddModal(false)}
              disabled={isPending}
              className="px-6 py-2.5 bg-bg-secondary border border-border-primary text-text-primary rounded-xl text-sm hover:bg-bg-card-hover transition-all"
            >
              {t("wage.cancel")}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
