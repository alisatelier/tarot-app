const KEY = "tarot_readings_v1";

export type SavedReading = {
  when: string;
  spreadId: string;
  seed: string;
  colorway?: "pink" | "grey";
  question?: string;
  meta?: { focus?: string; choice1?: string; choice2?: string };
  cards: { id: string; reversed: boolean; slotKey: string }[];
};

export function saveReading(r: SavedReading) {
  const existing = loadAllReadings();
  existing.unshift(r);
  try {
    localStorage.setItem(KEY, JSON.stringify(existing.slice(0, 50)));
  } catch {
    // ignore quota errors
  }
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
