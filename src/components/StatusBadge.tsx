import { useLang, TranslationKey } from "@/lib/i18n";

export default function StatusBadge({ status }: { status: string }) {
  const { t } = useLang();
  
  const getBadgeStyle = () => {
    switch (status) {
      case "ACTIVE":
        return {
          bg: "bg-accent-green/15",
          text: "text-accent-green",
          border: "border-accent-green/30",
          dot: "bg-accent-green",
          labelKey: "status.active" as TranslationKey,
        };
      case "INACTIVE":
        return {
          bg: "bg-accent-red/15",
          text: "text-accent-red",
          border: "border-accent-red/30",
          dot: "bg-accent-red",
          labelKey: "status.inactive" as TranslationKey,
        };
      case "UNDER_REPAIR":
        return {
          bg: "bg-accent-amber/15",
          text: "text-accent-amber",
          border: "border-accent-amber/30",
          dot: "bg-accent-amber",
          labelKey: "status.under_repair" as TranslationKey,
        };
      case "LOGGED":
        return {
          bg: "bg-accent-blue/15",
          text: "text-accent-blue",
          border: "border-accent-blue/30",
          dot: "bg-accent-blue",
          labelKey: "status.logged" as TranslationKey,
        };
      case "PENDING":
        return {
          bg: "bg-accent-orange/15",
          text: "text-accent-orange",
          border: "border-accent-orange/30",
          dot: "bg-accent-orange",
          labelKey: "status.pending" as TranslationKey,
        };
      default:
        return {
          bg: "bg-bg-secondary",
          text: "text-text-muted",
          border: "border-border-primary",
          dot: "bg-text-muted",
          labelKey: status as any,
        };
    }
  };

  const style = getBadgeStyle();
  const label = t(style.labelKey) || status;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide border ${style.bg} ${style.text} ${style.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot} animate-pulse`}></span>
      {label}
    </span>
  );
}
