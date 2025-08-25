export type SpreadSlot = { xPerc: number; yPerc: number; angle?: number; key: string };
export type SpreadDef = { id: string; label: string; slots: SpreadSlot[]; columns?: number };

const row = (yPerc: number, keys: string[], angle = 0) =>
  keys.map((key, i) => ({
    key,
    xPerc: ((i + 1) / (keys.length + 1)) * 100,
    yPerc,
    angle,
  }));

export const spreads: SpreadDef[] = [
  // 3-card
  {
    id: "past-present-future",
    label: "Past • Present • Future",
    slots: [
      { key: "past", xPerc: 30, yPerc: 50 },
      { key: "present", xPerc: 50, yPerc: 50 },
      { key: "future", xPerc: 70, yPerc: 50 },
    ],
  },
  {
    id: "focus-forward-letgo",
    label: "Focus • Moving Forward • Letting Go",
    slots: [
      { key: "focus", xPerc: 50, yPerc: 35 },
      { key: "forward", xPerc: 30, yPerc: 65 },
      { key: "letgo", xPerc: 70, yPerc: 65 },
    ],
  },
  {
    id: "know-dont-need",
    label: "What I Know • What I Don't • What I Need To ",
    slots: [
      { key: "know", xPerc: 50, yPerc: 35 },
      { key: "dontknow", xPerc: 30, yPerc: 65 },
      { key: "need", xPerc: 70, yPerc: 65 },
    ],
  },

  // 5-card
  {
    id: "pp-issues-advice-outcome",
    label: "Past • Present • Hidden Issues • Advice • Outcome",
    slots: 
    [
      { key: "past", xPerc: 16, yPerc: 50 },
      { key: "present", xPerc: 33, yPerc: 50 },
      { key: "hidden", xPerc: 50, yPerc: 50 },
      { key: "advice", xPerc: 67, yPerc: 50 },
      { key: "outcome", xPerc: 84, yPerc: 50 },
    ]

  },
  {
    id: "goal-pos-block-bridge-lesson",
    label: "Goal • Current Status • Block • Bridge • Lesson",
    slots: [
      { key: "goal", xPerc: 16, yPerc: 50 },
      { key: "current", xPerc: 33, yPerc: 50 },
      { key: "block", xPerc: 50, yPerc: 50 },
      { key: "bridge", xPerc: 67, yPerc: 50 },
      { key: "lesson", xPerc: 84, yPerc: 50 },
    ]
  },
  {
    id: "path-a-vs-b",
    label: "Pros & Cons of Two Choices",
    // Desktop/Tablet default: focus top, A cluster bottom-left, B cluster bottom-right
    slots: [
      { key: "focus", xPerc: 50, yPerc: 30 },
      { key: "prosA", xPerc: 20, yPerc: 65 },
      { key: "consA", xPerc: 35, yPerc: 65 },
      { key: "prosB", xPerc: 65, yPerc: 65 },
      { key: "consB", xPerc: 80, yPerc: 65 },
    ],
  },
];


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

export function horoscopeSpreadDef(startFromSeason = currentSeasonIndex()): SpreadDef {
  const rotated = [...ZODIAC.slice(startFromSeason), ...ZODIAC.slice(0, startFromSeason)];
  const topKeys = rotated.slice(0,6).map(s => s.toLowerCase());
  const botKeys = rotated.slice(6).map(s => s.toLowerCase());
  return {
    id: "horoscope-12",
    label: "Horoscope (starts at current season)",
    // Desktop/Tablet: 6 cards top row, 6 cards bottom row
    slots: [
      ...row(35, topKeys),
      ...row(65, botKeys),
    ],
    columns: 6,
  };
}
