

import { SPREADS } from "./questionDropDown";

// Re-export SPREADS so other files can import it from this module
export { SPREADS };

// src/app/components/tarot/spreads.ts
export type IntentionKind = "simple" | "binary"; // binary = "This or That"

export type IntentionBase = {
  id: string; // stable key (e.g., "ppf:rel:heading")
  label: string; // may include ${relationshipName}
  requiresName?: boolean; // true when label needs ${relationshipName}
};

export type IntentionSimple = IntentionBase & {
  kind: "simple";
};

export type IntentionBinary = IntentionBase & {
  kind: "binary";
  pathA: string; // "Moving", "Staying", "Fling", etc.
  pathB: string; // "Renting", "Buying", etc.
};

export type Intention = IntentionSimple | IntentionBinary;

export type Category = {
  id: string; // "relationships", "home", ...
  title: string; // "💞 Relationships"
  intentions: Intention[];
};

export type Spread = {
  id: string; // "ppf", "fml", "pphao", "gsbbl", "this-or-that", "horoscope"
  title: string;
  slots: { 
    idKey: string; 
    cardLabel: string; 
    xPerc: number; 
    yPerc: number;
    angle?: number; // Optional rotation angle for cards
    profile?: "mobile" | "tablet" | "desktop"; // Optional profile-specific formatting
  }[]; // "Past • Present • Future"
  categories: Category[]; // includes a "custom" category with "Write My Own Intention"
};

// ---------- utilities ----------
export const substituteVars = (label: string, vars: Record<string, string>) =>
  label.replace(/\$\{(\w+)\}/g, (_, k) => vars[k] ?? "_____");

export const needsRelationshipName = (i: Intention) =>
  i.requiresName || /\$\{relationshipName\}/.test(i.label);

// Filter slots for a specific profile, falling back to non-profile-specific slots
export const getSlotsForProfile = (spread: Spread, profileId: "mobile" | "tablet" | "desktop") => {
  // First, get all slots that match the current profile
  const profileSlots = spread.slots.filter(slot => slot.profile === profileId);
  
  // Get all slots without profile specification as fallbacks
  const genericSlots = spread.slots.filter(slot => !slot.profile);
  
  // If we have profile-specific slots, use those; otherwise use generic slots
  if (profileSlots.length > 0) {
    // For each unique idKey, prefer profile-specific over generic
    const slotMap = new Map();
    
    // Add generic slots first
    genericSlots.forEach(slot => {
      slotMap.set(slot.idKey, slot);
    });
    
    // Override with profile-specific slots
    profileSlots.forEach(slot => {
      slotMap.set(slot.idKey, slot);
    });
    
    return Array.from(slotMap.values());
  }
  
  // If no profile-specific slots exist, return all generic slots
  return genericSlots;
};

// You'll use this to render select options grouped by <optgroup>.
export const getSpreadById = (id: string, spreads = SPREADS) =>
  spreads.find((s) => s.id === id);

export const getIntentionById = (spread: Spread, intentionId: string) => {
  for (const cat of spread.categories) {
    const found = cat.intentions.find((i) => i.id === intentionId);
    if (found) return found;
  }
  return undefined;
};



// Zodiac wheel for horoscope spread
export const ZODIAC = [
  "Aries","Taurus","Gemini","Cancer","Leo","Virgo",
  "Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"
];

// Tropical date ranges (approx)
const RANGES: { sign: string; start: [number, number]; end: [number, number] }[] = [
  { sign: "Aries",      start: [3,21],  end: [4,19]  },
  { sign: "Taurus",     start: [4,20],  end: [5,20]  },
  { sign: "Gemini",     start: [5,21],  end: [6,20]  },
  { sign: "Cancer",     start: [6,21],  end: [7,22]  },
  { sign: "Leo",        start: [7,23],  end: [8,22]  },
  { sign: "Virgo",      start: [8,23],  end: [9,22]  },
  { sign: "Libra",      start: [9,23],  end: [10,22] },
  { sign: "Scorpio",    start: [10,23], end: [11,21] },
  { sign: "Sagittarius",start: [11,22], end: [12,21] },
  { sign: "Capricorn",  start: [12,22], end: [1,19]  },
  { sign: "Aquarius",   start: [1,20],  end: [2,18]  },
  { sign: "Pisces",     start: [2,19],  end: [3,20]  },
];

function isOnOrAfter(m: number, d: number, sm: number, sd: number) {
  if (m === sm) return d >= sd;
  return m > sm;
}
function isOnOrBefore(m: number, d: number, em: number, ed: number) {
  if (m === em) return d <= ed;
  return m < em;
}

export function currentSeasonIndex(d = new Date()): number {
  const m = d.getMonth() + 1, day = d.getDate();
  for (let i = 0; i < RANGES.length; i++) {
    const { start: [sm, sd], end: [em, ed] } = RANGES[i];
    const wraps = em < sm; // Capricorn crosses year boundary
    const inRange = wraps
      ? (isOnOrAfter(m, day, sm, sd) || isOnOrBefore(m, day, em, ed))
      : (isOnOrAfter(m, day, sm, sd) && isOnOrBefore(m, day, em, ed));
    if (inRange) return i;
  }
  return 0;
}

// Helper function to create a row of cards
function row(yPerc: number, keys: string[]) {
  return keys.map((key, i) => ({
    idKey: key,
    cardLabel: ZODIAC[ZODIAC.findIndex(sign => sign.toLowerCase() === key)] || key,
    xPerc: ((i + 1) * 100) / (keys.length + 1), // Evenly distribute across width
    yPerc: yPerc,
  }));
}

export function horoscopeSpreadDef(startFromSeason = currentSeasonIndex()): Spread {
  const rotated = [...ZODIAC.slice(startFromSeason), ...ZODIAC.slice(0, startFromSeason)];
  const topKeys = rotated.slice(0,6).map(s => s.toLowerCase());
  const botKeys = rotated.slice(6).map(s => s.toLowerCase());
  
  // Create desktop/tablet layout (2 rows of 6)
  const desktopTabletSlots = [
    ...row(25, topKeys),
    ...row(65, botKeys),
  ];
  
  // Create mobile layout (3 columns of 4 rows)
  const mobileSlots = rotated.map((sign, index) => {
    const col = index % 3; // 0, 1, 2 for columns
    const row = Math.floor(index / 3); // 0, 1, 2, 3 for rows
    const xPerc = 25 + (col * 25); // 25%, 50%, 75%
    const yPerc = 10 + (row * 25); // 10%, 35%, 60%, 85% - increased spacing
    
    return {
      profile: "mobile" as const,
      idKey: sign.toLowerCase(),
      cardLabel: sign,
      xPerc,
      yPerc,
    };
  });
  
  // Add profile tags to desktop/tablet slots
  const profiledSlots = [
    ...desktopTabletSlots.map(slot => ({ ...slot, profile: "desktop" as const })),
    ...desktopTabletSlots.map(slot => ({ ...slot, profile: "tablet" as const })),
    ...mobileSlots,
  ];
  
  return {
    id: "horoscope",
    title: "Horoscope (starts at current season)",
    slots: profiledSlots,
    categories: [], // Will use the static categories from SPREADS
  };
}

export const pathAVsBSpreadDef = (
  pathA = "Path A",
  pathB = "Path B"
): Spread => ({
  id: "pathab",
  title: `${pathA} vs ${pathB}`,
  slots: [
    { idKey: "focus-5", cardLabel: "Focus", xPerc: 50, yPerc: 30 },
    { idKey: "prosA-5", cardLabel: `Pros:\n${pathA}`, xPerc: 20, yPerc: 65 },
    { idKey: "consA-5", cardLabel: `Cons:\n${pathA}`, xPerc: 35, yPerc: 65 },
    { idKey: "prosB-5", cardLabel: `Pros:\n${pathB}`, xPerc: 65, yPerc: 65 },
    { idKey: "consB-5", cardLabel: `Cons:\n${pathB}`, xPerc: 80, yPerc: 65 },
  ],
  categories: [], // Will use the static categories from SPREADS
});

// Helper function to create dynamic This or That spread based on intention paths
export const thisOrThatSpreadDef = (
  pathA = "Option A",
  pathB = "Option B"
): Spread => ({
  id: "this-or-that",
  title: `${pathA} vs ${pathB} (Pros & Cons)`,
  slots: [
    { idKey: "focus-5", cardLabel: "Focus", xPerc: 50, yPerc: 30 },
    { idKey: "prosA-5", cardLabel: `Pros:\n${pathA}`, xPerc: 20, yPerc: 65 },
    { idKey: "consA-5", cardLabel: `Cons:\n${pathA}`, xPerc: 35, yPerc: 65 },
    { idKey: "prosB-5", cardLabel: `Pros:\n${pathB}`, xPerc: 65, yPerc: 65 },
    { idKey: "consB-5", cardLabel: `Cons:\n${pathB}`, xPerc: 80, yPerc: 65 },
  ],
  categories: [], // Will use the static categories from SPREADS
});

// Helper to get paths for path A/B intentions
export const getPathsForIntention = (intentionId: string) => {
  // Find the intention in SPREADS and return its pathA/pathB
  for (const spread of SPREADS) {
    for (const category of spread.categories) {
      const intention = category.intentions.find((i) => i.id === intentionId);
      if (intention && intention.kind === "binary") {
        return { pathA: intention.pathA, pathB: intention.pathB };
      }
    }
  }
  // For now, return defaults
  return { pathA: "Path A", pathB: "Path B" };
};
