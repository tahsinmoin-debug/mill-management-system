// ============================================================
// Wage Calculation Engine
// Single source of truth for all wage/yard math.
// ============================================================

import type { ProductionEntry, ProductionSegment, WageRate } from "./types";

/**
 * Sum segment yards for a single entry.
 */
export function calculateEntryTotal(segments: ProductionSegment[]): number {
  return segments.reduce((sum, seg) => sum + seg.yards, 0);
}

/**
 * Sum all yards for a worker on a given day (may have multiple entries
 * if they worked on more than one machine).
 */
export function calculateDailyTotal(entries: ProductionEntry[]): number {
  return entries.reduce((sum, entry) => sum + entry.totalYards, 0);
}

/**
 * Sum all yards for a worker in a given month.
 */
export function calculateMonthlyTotal(
  entries: ProductionEntry[],
  month: number,
  year: number
): number {
  return entries
    .filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() + 1 === month && d.getFullYear() === year;
    })
    .reduce((sum, entry) => sum + entry.totalYards, 0);
}

/**
 * Find the applicable wage rate for a given date.
 * Rates are date-stamped; we pick the most recent rate whose
 * effectiveFrom <= the entry date.
 */
export function getApplicableRate(
  rates: WageRate[],
  date: string
): WageRate | null {
  const targetDate = new Date(date);
  const sorted = [...rates]
    .filter((r) => new Date(r.effectiveFrom) <= targetDate)
    .sort(
      (a, b) =>
        new Date(b.effectiveFrom).getTime() -
        new Date(a.effectiveFrom).getTime()
    );
  return sorted[0] || null;
}

/**
 * Calculate wage for a set of yards at a given rate.
 * Rounds to nearest taka (whole BDT).
 */
export function calculateWage(totalYards: number, ratePerYard: number): number {
  return Math.round(totalYards * ratePerYard);
}

/**
 * Calculate monthly wage for a worker, correctly handling mid-month rate changes.
 * Each entry's wage uses the rate that was active on that entry's date.
 */
export function calculateMonthlyWage(
  entries: ProductionEntry[],
  rates: WageRate[],
  month: number,
  year: number
): number {
  const monthEntries = entries.filter((e) => {
    const d = new Date(e.date);
    return d.getMonth() + 1 === month && d.getFullYear() === year;
  });

  return monthEntries.reduce((totalWage, entry) => {
    const rate = getApplicableRate(rates, entry.date);
    if (!rate) return totalWage;
    return totalWage + calculateWage(entry.totalYards, rate.ratePerYard);
  }, 0);
}

/**
 * Format a number as BDT currency string.
 */
export function formatBDT(amount: number): string {
  return `৳${amount.toLocaleString("en-BD")}`;
}

/**
 * Format a date string to a readable format.
 */
export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Get month name from month number (1-indexed).
 */
export function getMonthName(month: number): string {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  return months[month - 1] || "";
}
