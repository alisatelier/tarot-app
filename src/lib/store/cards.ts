export type CardMeta = {
  id: string;              // unique id, e.g. "00-fool", "cups-ace"
  name: string;
  suit?: string;           // majors can omit
  number?: number;
  frontSrc: string;        // /cards/fronts/<file>.png
};

export const CARD_BACK = "/cards/back.png";

// TODO: Replace with your real list + filenames
export const CARDS: CardMeta[] = [
  { id: "00-fool", name: "The Fool", frontSrc: "/cards/fronts/00-fool.png" },
  { id: "01-magician", name: "The Magician", frontSrc: "/cards/fronts/01-magician.png" },
  // ...
];

export type CardMeaning = {
  upright: string;
  reversed: string;
};

// You can fill these as you go (static); later we can plug your own AI to generate/augment:
export const CARD_MEANINGS: Record<string, CardMeaning> = {
  "00-fool": { upright: "Beginnings, trust, leap of faith.", reversed: "Hesitation, naiveté, risk without plan." },
  "01-magician": { upright: "Manifestation, will, tools at hand.", reversed: "Scattered energy, manipulation, delay." },
  // ...
};
