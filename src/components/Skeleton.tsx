import React from "react";

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-xl bg-gray-200 animate-pulse ${className}`}
    />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-gray-200 animate-pulse" />
      <div className="space-y-2 flex-1">
        <div className="h-3 bg-gray-200 rounded animate-pulse w-20" />
        <div className="h-6 bg-gray-200 rounded animate-pulse w-32" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4" />
        <div className="h-8 bg-gray-200 rounded animate-pulse w-24" />
      </div>
      <div className="p-5 space-y-4">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/5" />
          </div>
        ))}
      </div>
    </div>
  );
}
