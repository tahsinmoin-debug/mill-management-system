"use client";

import { useState, useEffect, useTransition } from "react";
import { DollarSign, Loader2, AlertCircle } from "lucide-react";
import { getWageRates, createWageRate } from "@/app/actions/wageRates";
import { Skeleton } from "@/components/Skeleton";
import { useLang } from "@/lib/i18n";

export default function WageRatePage() {
  const { t } = useLang();
  const [rates, setRates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const todayStr = new Date().toISOString().split("T")[0];
  const [newRate, setNewRate] = useState("");

  const fetchRates = async () => {
    setIsLoading(true);
    try {
      const data = await getWageRates();
      setRates(data || []);
    } catch (err) {
      console.error("Failed to fetch rates:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  const handleAddRate = () => {
    if (!newRate) return;
    startTransition(async () => {
      await createWageRate({
        ratePerYard: parseFloat(newRate),
        effectiveFrom: todayStr,
      });
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
        <div className="flex flex-col gap-6 relative z-10">
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
                  (Global Rate applied to all calculations)
                </span>
              </div>
            ) : (
              <p className="text-text-muted text-sm">{t("common.no_data")}</p>
            )}
          </div>
          
          <div className="pt-6 border-t border-border-primary/50">
            <h3 className="text-sm font-semibold text-text-primary mb-4">
              Update Per Yard Value
            </h3>
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
              <div className="w-full sm:w-64">
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
              <button
                onClick={handleAddRate}
                disabled={isPending || !newRate}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-accent-amber to-accent-orange text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-accent-amber/20 transition-all disabled:opacity-50 shrink-0"
              >
                {isPending ? <Loader2 size={16} className="animate-spin" /> : <DollarSign size={16} />}
                Update Global Rate
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-start gap-3 p-4 rounded-xl bg-accent-amber/5 border border-accent-amber/10">
          <AlertCircle size={18} className="text-accent-amber shrink-0 mt-0.5" />
          <div className="text-sm text-text-secondary">
            <span className="font-semibold text-accent-amber">{t("wage.warning_title")}:</span> This will update the rate globally and apply to the whole calculation across all existing and future entries.
          </div>
        </div>
      </div>
    </div>
  );
}
