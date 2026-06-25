// ============================================================
// Mock Data — Realistic sample data for all entities
// ============================================================

import type {
  Machine,
  Worker,
  WageRate,
  ProductionEntry,
  User,
} from "./types";

// ---- Users ----
export const mockUsers: User[] = [
  {
    id: "u1",
    username: "admin",
    name: "Rahim Uddin",
    role: "ADMIN",
    createdAt: "2025-01-01",
  },
  {
    id: "u2",
    username: "manager",
    name: "Kamal Hossain",
    role: "MANAGER",
    createdAt: "2025-01-01",
  },
];

// ---- Machines ----
export const mockMachines: Machine[] = [
  { id: "m1", machineNumber: 1, typeModel: "Sulzer TW11", status: "ACTIVE", createdAt: "2025-01-01" },
  { id: "m2", machineNumber: 2, typeModel: "Sulzer TW11", status: "ACTIVE", createdAt: "2025-01-01" },
  { id: "m3", machineNumber: 3, typeModel: "Toyota JAT810", status: "ACTIVE", createdAt: "2025-01-01" },
  { id: "m4", machineNumber: 4, typeModel: "Toyota JAT810", status: "ACTIVE", createdAt: "2025-01-01" },
  { id: "m5", machineNumber: 5, typeModel: "Picanol GTM-AS", status: "ACTIVE", createdAt: "2025-01-15" },
  { id: "m6", machineNumber: 6, typeModel: "Picanol GTM-AS", status: "ACTIVE", createdAt: "2025-01-15" },
  { id: "m7", machineNumber: 7, typeModel: "Sulzer TW11", status: "UNDER_REPAIR", createdAt: "2025-02-01" },
  { id: "m8", machineNumber: 8, typeModel: "Toyota JAT810", status: "ACTIVE", createdAt: "2025-02-01" },
  { id: "m9", machineNumber: 9, typeModel: "Picanol GTM-AS", status: "ACTIVE", createdAt: "2025-03-01" },
  { id: "m10", machineNumber: 10, typeModel: "Sulzer TW11", status: "ACTIVE", createdAt: "2025-03-01" },
];

// ---- Workers ----
export const mockWorkers: Worker[] = [
  { id: "w1", name: "Abdul Karim", workerId: "W-001", joiningDate: "2024-06-15", status: "ACTIVE" },
  { id: "w2", name: "Mohammad Rafiq", workerId: "W-002", joiningDate: "2024-06-15", status: "ACTIVE" },
  { id: "w3", name: "Jamal Uddin", workerId: "W-003", joiningDate: "2024-07-01", status: "ACTIVE" },
  { id: "w4", name: "Nurul Islam", workerId: "W-004", joiningDate: "2024-07-01", status: "ACTIVE" },
  { id: "w5", name: "Shahin Alam", workerId: "W-005", joiningDate: "2024-08-10", status: "ACTIVE" },
  { id: "w6", name: "Bellal Hossain", workerId: "W-006", joiningDate: "2024-08-10", status: "ACTIVE" },
  { id: "w7", name: "Faruk Ahmed", workerId: "W-007", joiningDate: "2024-09-01", status: "ACTIVE" },
  { id: "w8", name: "Rashed Khan", workerId: "W-008", joiningDate: "2024-09-15", status: "ACTIVE" },
  { id: "w9", name: "Habibur Rahman", workerId: "W-009", joiningDate: "2024-10-01", status: "ACTIVE" },
  { id: "w10", name: "Mizanur Rahman", workerId: "W-010", joiningDate: "2024-10-01", status: "ACTIVE" },
  { id: "w11", name: "Sohel Rana", workerId: "W-011", joiningDate: "2024-11-01", status: "ACTIVE" },
  { id: "w12", name: "Alamgir Kabir", workerId: "W-012", joiningDate: "2024-11-15", status: "ACTIVE" },
  { id: "w13", name: "Dulal Mia", workerId: "W-013", joiningDate: "2025-01-01", status: "INACTIVE" },
  { id: "w14", name: "Anisur Rahman", workerId: "W-014", joiningDate: "2025-01-10", status: "ACTIVE" },
  { id: "w15", name: "Babul Haque", workerId: "W-015", joiningDate: "2025-02-01", status: "ACTIVE" },
];

// ---- Wage Rates ----
export const mockWageRates: WageRate[] = [
  { id: "wr1", ratePerYard: 2.50, effectiveFrom: "2024-06-01", createdAt: "2024-06-01" },
  { id: "wr2", ratePerYard: 2.69, effectiveFrom: "2025-01-01", createdAt: "2025-01-01" },
];

// ---- Production Entries ----
// Generate realistic entries for the current month
function generateEntries(): ProductionEntry[] {
  const entries: ProductionEntry[] = [];
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // 0-indexed

  // Active workers and machines
  const activeWorkers = mockWorkers.filter((w) => w.status === "ACTIVE");
  const activeMachines = mockMachines.filter((m) => m.status === "ACTIVE");

  let entryId = 1;

  // Generate entries for the first 25 days of the current month (or up to today)
  const daysToGenerate = Math.min(today.getDate(), 25);

  for (let day = 1; day <= daysToGenerate; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    // Each active machine gets 1-2 workers per day
    activeMachines.forEach((machine, mIdx) => {
      // Assign 1-2 workers to this machine
      const workerCount = day % 3 === 0 ? 2 : 1;
      for (let wi = 0; wi < workerCount; wi++) {
        const workerIdx = (mIdx + wi + day) % activeWorkers.length;
        const worker = activeWorkers[workerIdx];

        // Generate 2-4 segments (thread changes)
        const segmentCount = 2 + (entryId % 3);
        const segments = [];
        for (let s = 0; s < segmentCount; s++) {
          // Realistic yard values: 15-35 per segment
          const yards = 15 + ((entryId * 7 + s * 13 + day * 3) % 21);
          segments.push({ yards });
        }

        const totalYards = segments.reduce((sum, seg) => sum + seg.yards, 0);

        entries.push({
          id: `pe${entryId}`,
          date: dateStr,
          machineId: machine.id,
          workerId: worker.id,
          segments,
          totalYards,
          createdAt: dateStr,
        });

        entryId++;
      }
    });
  }

  return entries;
}

export const mockProductionEntries: ProductionEntry[] = generateEntries();

// ---- Helper: Get current month/year ----
export function getCurrentMonth(): { month: number; year: number } {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}

// ---- Helper: Get machine by ID ----
export function getMachineById(id: string): Machine | undefined {
  return mockMachines.find((m) => m.id === id);
}

// ---- Helper: Get worker by ID ----
export function getWorkerById(id: string): Worker | undefined {
  return mockWorkers.find((w) => w.id === id);
}

// ---- Helper: Get today's date string ----
export function getTodayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// ---- Helper: Get entries for a specific date ----
export function getEntriesForDate(date: string): ProductionEntry[] {
  return mockProductionEntries.filter((e) => e.date === date);
}

// ---- Helper: Get entries for a specific worker in a month ----
export function getWorkerMonthEntries(
  workerId: string,
  month: number,
  year: number
): ProductionEntry[] {
  return mockProductionEntries.filter((e) => {
    const d = new Date(e.date);
    return (
      e.workerId === workerId &&
      d.getMonth() + 1 === month &&
      d.getFullYear() === year
    );
  });
}
