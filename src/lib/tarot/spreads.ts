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
  {
    id: "ppf",
    label: "Past • Present • Future",
    slots: row(50, ["past", "present", "future"]),
  },
  {
    id: "focus-let-go-forward",
    label: "Focus • Let Go • Moving Forward",
    slots: row(50, ["focus", "let_go", "forward"]),
  },
  {
    id: "focus-choice1-choice2",
    label: "Focus • Choice #1 • Choice #2",
    slots: row(50, ["focus", "choice_1", "choice_2"]),
  },
  {
    id: "pros-cons-pref-action-goal",
    label: "Pros • Cons • Preference • Action • End Goal",
    slots: row(40, ["pros", "cons", "preference"]).concat(
      row(62, ["action", "end_goal"])
    ),
  },
  {
    id: "past-present-hidden-advice-outcome",
    label: "Past • Present • Hidden • Advice • Outcome",
    slots: row(40, ["past", "present", "hidden"]).concat(
      row(62, ["advice", "outcome"])
    ),
  },
  // 12-card Horoscope (Aries→Pisces), starts at current season
];

const ZODIAC = [
  "Aries","Taurus","Gemini","Cancer","Leo","Virgo",
  "Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"
];

const makeRing = (keys: string[]) => {
  // 12 around an ellipse
  const slots: SpreadSlot[] = [];
  for (let i = 0; i < keys.length; i++) {
    const t = (i / keys.length) * Math.PI * 2;
    const x = 50 + Math.cos(t) * 32; // %
    const y = 50 + Math.sin(t) * 22; // %
    slots.push({ key: keys[i], xPerc: x, yPerc: y, angle: 0 });
  }
  return slots;
};

export function currentSeasonIndex(d: Date = new Date()) {
  // Rough boundaries (tropical). Adjust if you want exact UTC cutoffs.
  // Month/day thresholds:
  // Aries ~ Mar 21, Taurus ~ Apr 20, Gemini ~ May 21, Cancer ~ Jun 21,
  // Leo ~ Jul 23, Virgo ~ Aug 23, Libra ~ Sep 23, Scorpio ~ Oct 23,
  // Sag ~ Nov 22, Cap ~ Dec 22, Aquarius ~ Jan 20, Pisces ~ Feb 19.
  const m = d.getMonth() + 1; // 1-12
  const day = d.getDate();
  const idx = (() => {
    if (m === 3 && day >= 21 || (m > 3 && m < 4)) return 0;
    if (m === 4 && day >= 20 || (m > 4 && m < 5)) return 1;
    if (m === 5 && day >= 21 || (m > 5 && m < 6)) return 2;
    if (m === 6 && day >= 21 || (m > 6 && m < 7)) return 3;
    if (m === 7 && day >= 23 || (m > 7 && m < 8)) return 4;
    if (m === 8 && day >= 23 || (m > 8 && m < 9)) return 5;
    if (m === 9 && day >= 23 || (m > 9 && m < 10)) return 6;
    if (m === 10 && day >= 23 || (m > 10 && m < 11)) return 7;
    if (m === 11 && day >= 22 || (m > 11 && m < 12)) return 8;
    if (m === 12 && day >= 22 || (m === 1 && day < 20)) return 9;
    if (m === 1 && day >= 20 || (m > 1 && m < 2)) return 10;
    // Pisces default
    return 11;
  })();
  return idx;
}

export function horoscopeSpreadDef(startFromSeason = currentSeasonIndex()) {
  // Rotate Aries→Pisces so the first slot is "current season"
  const rotated = [...ZODIAC.slice(startFromSeason), ...ZODIAC.slice(0, startFromSeason)];
  return {
    id: "horoscope-12",
    label: "Horoscope (Current Season Start)",
    slots: makeRing(rotated.map((z) => z.toLowerCase())),
  } as SpreadDef;
}
