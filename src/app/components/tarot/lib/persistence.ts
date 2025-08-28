// Removed invalid import of SavedReading; type is defined below.

export type SavedReading = {
  when: string;
  spreadId: string;
  seed: string;
  colorway?: "pink" | "grey";
  question?: string;
  meta?: { focus?: string; choice1?: string; choice2?: string };
  cards: { id: string; reversed: boolean; slotKey: string }[];
};

// Example local-storage fallback; swap with API/DB as needed.
const STORAGE_KEY = "tarot.readings.v2";

export async function saveReading(reading: SavedReading): Promise<void> {
  const raw = (typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY)) || "[]";
  const list: SavedReading[] = JSON.parse(raw);
  list.unshift(reading); // newest first
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }
}
