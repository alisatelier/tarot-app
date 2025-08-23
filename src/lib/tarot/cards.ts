export type CardMeta = {
  id: string;
  name: string;
  suit?: string;
  number?: number;
};

export const CARDS_CATALOG: CardMeta[] = [
  { id: "0.TheOne", name: "The One", number: 0 },
  { id: "1.TheEnchanter", name: "The Enchanter", number: 1 },
  { id: "2.TheEnchantress", name: "The Enchantress", number: 2 },
  { id: "3.TheGreatMother", name: "The Great Mother", number: 3 },
  { id: "4.TheGreatFather", name: "The Great Father", number: 4 },
  { id: "5.TheSage", name: "The Sage", number: 5 },
  { id: "6.TheBeloved", name: "The Beloved", number: 6 },
  { id: "7.TheMarionette", name: "The Marionette", number: 7 },
  { id: "8.LadyLeo", name: "Lady Leo", number: 8 },
  { id: "9.ThePearl", name: "The Pearl", number: 9 },
  { id: "10.TheFates", name: "The Fates", number: 10 },
  { id: "11.TheScales", name: "The Scales", number: 11 },
  { id: "12.TheMime", name: "The Mime", number: 12 },
  { id: "13.Birth", name: "Birth", number: 13 },
  { id: "14.Spellcasting", name: "Spellcasting", number: 14 },
  { id: "15.Vices", name: "Vices", number: 15 },
  { id: "16.TheFortress", name: "The Fortress", number: 16 },
  { id: "17.Healing", name: "Healing", number: 17 },
  { id: "18.Illusion", name: "Illusion", number: 18 },
  { id: "19.Soul", name: "Soul", number: 19 },
  { id: "20.Awakening", name: "Awakening", number: 20 },
  { id: "21.TheUniverse", name: "The Universe", number: 21 },
];

// UPDATE: colorway names
export type Colorway = "pink" | "grey";

export function frontSrcFor(id: string, colorway: Colorway) {
  return `/cards/fronts/${colorway}/${id}.png`;
}
export function backSrcFor(colorway: Colorway) {
  return `/cards/backs/${colorway}.png`;
}
