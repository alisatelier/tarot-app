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
  { id: "22.OneOfSparks", name: "One of Sparks", number: 22 },
  { id: "23.TwoOfSparks", name: "Two of Sparks", number: 23 },
  { id: "24.ThreeOfSparks", name: "Three of Sparks", number: 24 },
  { id: "25.FourOfSparks", name: "Four of Sparks", number: 25 },
  { id: "26.FiveOfSparks", name: "Five of Sparks", number: 26 },
  { id: "27.SixOfSparks", name: "Six of Sparks", number: 27 },
  { id: "28.SevenOfSparks", name: "Seven of Sparks", number: 28 },
  { id: "29.EightOfSparks", name: "Eight of Sparks", number: 29 },
  { id: "30.NineOfSparks", name: "Nine of Sparks", number: 30 },
  { id: "31.TenOfSparks", name: "Ten of Sparks", number: 31 },
  { id: "32.OneOfTears", name: "One of Tears", number: 32 },
  { id: "33.TwoOfTears", name: "Two of Tears", number: 33 },
  { id: "34.ThreeOfTears", name: "Three of Tears", number: 34 },
  { id: "35.FourOfTears", name: "Four of Tears", number: 35 },
  { id: "36.FiveOfTears", name: "Five of Tears", number: 36 },
  { id: "37.SixOfTears", name: "Six of Tears", number: 37 },
  { id: "38.SevenOfTears", name: "Seven of Tears", number: 38 },
  { id: "39.EightOfTears", name: "Eight of Tears", number: 39 },
  { id: "40.NineOfTears", name: "Nine of Tears", number: 40 },
  { id: "41.TenOfTears", name: "Ten of Tears", number: 41 },
  { id: "42.OneOfSoil", name: "One of Soil", number: 42 },
  { id: "43.TwoOfSoil", name: "Two of Soil", number: 43 },
  { id: "44.ThreeOfSoil", name: "Three of Soil", number: 44 },
  { id: "45.FourOfSoil", name: "Four of Soil", number: 45 },
  { id: "46.FiveOfSoil", name: "Five of Soil", number: 46 },
  { id: "47.SixOfSoil", name: "Six of Soil", number: 47 },
  { id: "48.SevenOfSoil", name: "Seven of Soil", number: 48 },
  { id: "49.EightOfSoil", name: "Eight of Soil", number: 49 },
  { id: "50.NineOfSoil", name: "Nine of Soil", number: 50 },
  { id: "51.TenOfSoil", name: "Ten of Soil", number: 51 },
  { id: "52.OneOfWhispers", name: "One of Whispers", number: 52 },
  { id: "53.TwoOfWhispers", name: "Two of Whispers", number: 53 },
  { id: "54.ThreeOfWhispers", name: "Three of Whispers", number: 54 },
  { id: "55.FourOfWhispers", name: "Four of Whispers", number: 55 },
  { id: "56.FiveOfWhispers", name: "Five of Whispers", number: 56 },
  { id: "57.SixOfWhispers", name: "Six of Whispers", number: 57 },
  { id: "58.SevenOfWhispers", name: "Seven of Whispers", number: 58 },
  { id: "59.EightOfWhispers", name: "Eight of Whispers", number: 59 },
  { id: "60.NineOfWhispers", name: "Nine of Whispers", number: 60 },
  { id: "61.TenOfWhispers", name: "Ten of Whispers", number: 61 },

];

// UPDATE: colorway names
export type Colorway = "pink" | "grey";

// Keep your fronts as-is, or update similarly if they use caps/dashes.
export function frontSrcFor(id: string, colorway: Colorway) {
  // Example if your fronts are still lowercase:
  return `/cards/fronts/${colorway}/${id}.png`;
  // If your fronts also use caps/dashes, change accordingly.
}

export function backSrcFor(colorway: Colorway) {
  // Map to your actual filenames
  const name = colorway === "pink" ? "Pink-Back" : "Grey-Back";
  return `/cards/backs/${name}.png`;
}

