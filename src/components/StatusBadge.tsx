interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md";
}

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  ACTIVE: {
    bg: "bg-accent-green/10",
    text: "text-accent-green",
    dot: "bg-accent-green",
  },
  INACTIVE: {
    bg: "bg-accent-red/10",
    text: "text-accent-red",
    dot: "bg-accent-red",
  },
  UNDER_REPAIR: {
    bg: "bg-accent-amber/10",
    text: "text-accent-amber",
    dot: "bg-accent-amber",
  },
  ADMIN: {
    bg: "bg-accent-purple/10",
    text: "text-accent-purple",
    dot: "bg-accent-purple",
  },
  MANAGER: {
    bg: "bg-accent-blue/10",
    text: "text-accent-blue",
    dot: "bg-accent-blue",
  },
  PENDING: {
    bg: "bg-accent-amber/10",
    text: "text-accent-amber",
    dot: "bg-accent-amber",
  },
  LOGGED: {
    bg: "bg-accent-green/10",
    text: "text-accent-green",
    dot: "bg-accent-green",
  },
};

export default function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const config = statusConfig[status] || {
    bg: "bg-text-muted/10",
    text: "text-text-muted",
    dot: "bg-text-muted",
  };

  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold uppercase tracking-wider ${config.bg} ${config.text} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse`} />
      {status.replace(/_/g, " ")}
    </span>
  );
}
