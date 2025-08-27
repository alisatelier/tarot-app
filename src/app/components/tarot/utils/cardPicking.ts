import { mulberry32, hashSeed } from "../../../../lib/tarot/rng";
import { ALL_CARD_IDS } from "../useTarotStore";

export interface CardPick {
  id: string;
  reversed: boolean;
}

/**
 * Deterministically picks and shuffles cards based on a seed
 * @param seedStr The seed string for reproducible randomness
 * @param n Number of cards to pick
 * @returns Array of card picks with IDs and reversed state
 */
export function pickCardsDeterministic(seedStr: string, n: number): CardPick[] {
  const rnd = mulberry32(hashSeed(seedStr));
  const ids = [...ALL_CARD_IDS];
  
  // Fisher-Yates shuffle
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  
  return ids.slice(0, n).map((id) => ({ 
    id, 
    reversed: rnd() < 0.5 
  }));
}

/**
 * Gets the seed from URL parameters or generates a new one
 * @returns Seed string for card selection
 */
export function getSeedFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  const url = new URL(window.location.href);
  return url.searchParams.get("seed");
}
