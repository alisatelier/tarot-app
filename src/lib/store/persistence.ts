export type SavedReading = {
  when: string;                 // ISO date
  spreadId: string;
  seed: string;
  question?: string;            // NEW
  meta?: {                      // NEW: for spread-specific inputs
    focus?: string;
    choice1?: string;
    choice2?: string;
  };
  cards: { id: string; reversed: boolean; slotKey: string }[];
};

const KEY = "tarot_readings_v1";

export function saveReading(r: SavedReading) {
  const list = loadAllReadings();
  list.unshift(r);
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, 50)));
}

export function loadAllReadings(): SavedReading[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}
