import type { ReactNode } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  trend?: { value: number; label: string };
  variant?: "default" | "cyan" | "green" | "amber" | "red" | "purple";
}

const variantStyles = {
  default: "from-accent-blue/10 to-transparent border-accent-blue/20",
  cyan: "from-accent-cyan/10 to-transparent border-accent-cyan/20",
  green: "from-accent-green/10 to-transparent border-accent-green/20",
  amber: "from-accent-amber/10 to-transparent border-accent-amber/20",
  red: "from-accent-red/10 to-transparent border-accent-red/20",
  purple: "from-accent-purple/10 to-transparent border-accent-purple/20",
};

const iconVariantStyles = {
  default: "bg-accent-blue/15 text-accent-blue",
  cyan: "bg-accent-cyan/15 text-accent-cyan",
  green: "bg-accent-green/15 text-accent-green",
  amber: "bg-accent-amber/15 text-accent-amber",
  red: "bg-accent-red/15 text-accent-red",
  purple: "bg-accent-purple/15 text-accent-purple",
};

export default function StatCard({
  label,
  value,
  icon,
  trend,
  variant = "default",
}: StatCardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl border bg-gradient-to-br p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${variantStyles[variant]}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wider">
            {label}
          </p>
          <p className="text-2xl font-bold text-text-primary">{value}</p>
          {trend && (
            <div className="flex items-center gap-1 mt-1">
              {trend.value > 0 ? (
                <TrendingUp size={12} className="text-accent-green" />
              ) : trend.value < 0 ? (
                <TrendingDown size={12} className="text-accent-red" />
              ) : (
                <Minus size={12} className="text-text-muted" />
              )}
              <span
                className={`text-xs font-medium ${
                  trend.value > 0
                    ? "text-accent-green"
                    : trend.value < 0
                    ? "text-accent-red"
                    : "text-text-muted"
                }`}
              >
                {trend.value > 0 ? "+" : ""}
                {trend.value}%
              </span>
              <span className="text-xs text-text-muted">{trend.label}</span>
            </div>
          )}
        </div>
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconVariantStyles[variant]}`}
        >
          {icon}
        </div>
      </div>

      {/* Decorative gradient orb */}
      <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-gradient-to-br from-white/[0.03] to-transparent" />
    </div>
  );
}
