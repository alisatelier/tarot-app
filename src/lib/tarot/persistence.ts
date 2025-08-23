
const KEY = "tarot_readings_v1";

export type savedReading = {
  when: string;
  spreadId: string;
  seed: string;
  colorway?: "pink" | "grey";   // <— update names here
  question?: string;
  meta?: { focus?: string; choice1?: string; choice2?: string };
  cards: { id: string; reversed: boolean; slotKey: string }[];
};

export function loadAllReadings(): SavedReading[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}
