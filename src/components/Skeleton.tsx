export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-bg-card border border-border-primary rounded-xl ${className}`}
    />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="p-5 rounded-xl border border-border-primary bg-bg-card animate-pulse">
      <div className="flex items-center gap-4 mb-3">
        <div className="w-10 h-10 rounded-lg bg-bg-secondary" />
        <div className="flex-1">
          <div className="h-4 w-24 bg-bg-secondary rounded mb-2" />
          <div className="h-6 w-16 bg-bg-secondary rounded" />
        </div>
      </div>
    </div>
  );
}
