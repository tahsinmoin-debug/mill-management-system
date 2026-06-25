// ============================================================
// Domain Types — Clothing Mill Production & Wage Management
// ============================================================

export type UserRole = "ADMIN" | "MANAGER";

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export type MachineStatus = "ACTIVE" | "UNDER_REPAIR";

export interface Machine {
  id: string;
  machineNumber: number;
  typeModel: string;
  status: MachineStatus;
  createdAt: string;
}

export type WorkerStatus = "ACTIVE" | "INACTIVE";

export interface Worker {
  id: string;
  name: string;
  workerId: string; // Human-readable ID like "W-001"
  joiningDate: string;
  status: WorkerStatus;
}

export interface WageRate {
  id: string;
  ratePerYard: number; // BDT per yard
  effectiveFrom: string; // ISO date string
  createdAt: string;
}

/**
 * A production segment represents yards produced before a thread change.
 * E.g., a worker produces 25, then 29, then 12 yards => 3 segments.
 */
export interface ProductionSegment {
  yards: number;
}

/**
 * A single production entry: one worker on one machine on one day.
 * Segments capture thread-change boundaries.
 */
export interface ProductionEntry {
  id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  machineId: string;
  workerId: string;
  segments: ProductionSegment[];
  totalYards: number; // Sum of all segment yards
  createdAt: string;
}

// ============================================================
// Derived / Report Types
// ============================================================

export interface DailyMachineReport {
  machine: Machine;
  entries: (ProductionEntry & { worker: Worker })[];
  totalYards: number;
}

export interface DailyReport {
  date: string;
  machines: DailyMachineReport[];
  millTotalYards: number;
}

export interface MonthlyWorkerReport {
  worker: Worker;
  totalYards: number;
  totalWage: number;
  daysWorked: number;
}

export interface MonthlyMachineReport {
  machine: Machine;
  totalYards: number;
}

export interface MonthlyReport {
  month: number; // 1-12
  year: number;
  millTotalYards: number;
  millTotalWage: number;
  workers: MonthlyWorkerReport[];
  machines: MonthlyMachineReport[];
  dailyTotals: { date: string; totalYards: number }[];
}

export interface PayslipEntry {
  date: string;
  machineName: string;
  yards: number;
  segments: number[];
}

export interface Payslip {
  worker: Worker;
  month: number;
  year: number;
  entries: PayslipEntry[];
  totalYards: number;
  rateApplied: number;
  totalWage: number;
  generatedDate: string;
}

// ============================================================
// Navigation
// ============================================================

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  adminOnly?: boolean;
  children?: NavItem[];
}
