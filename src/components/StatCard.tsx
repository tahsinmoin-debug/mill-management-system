import React from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  variant?: "cyan" | "blue" | "amber" | "green" | "purple";
}

export default function StatCard({
  label,
  value,
  icon,
  variant = "cyan",
}: StatCardProps) {
  const variants = {
    cyan: "bg-accent-cyan/10 text-accent-cyan border-accent-cyan/20",
    blue: "bg-accent-blue/10 text-accent-blue border-accent-blue/20",
    amber: "bg-accent-amber/10 text-accent-amber border-accent-amber/20",
    green: "bg-accent-green/10 text-accent-green border-accent-green/20",
    purple: "bg-accent-purple/10 text-accent-purple border-accent-purple/20",
  };

  const textVariants = {
    cyan: "text-accent-cyan",
    blue: "text-accent-blue",
    amber: "text-accent-amber",
    green: "text-accent-green",
    purple: "text-accent-purple",
  };

  return (
    <div className="p-5 rounded-2xl bg-white border border-border-primary shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${variants[variant]}`}>
          {icon}
        </div>
        <div>
          <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">
            {label}
          </p>
          <p className={`text-2xl font-bold font-mono ${textVariants[variant]}`}>
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
