"use client";

import { create } from "zustand";
import type { SpreadDef } from "@/lib/tarot/spreads";
import { spreads, horoscopeSpreadDef } from "@/lib/tarot/spreads";
import { CARDS_CATALOG, type Colorway } from "@/lib/tarot/cards";

export type SlotAssignment = {
  slotKey: string;
  cardId: string;
  reversed: boolean;
};

type TarotState = {
  // core spread state
  spread: SpreadDef;
  allSpreads: SpreadDef[];
  assignments: SlotAssignment[];
  dealing: boolean;

  // user text inputs
  question: string;
  focusText: string;
  choice1Text: string;
  choice2Text: string;

  // deck colorway
  colorway: Colorway; // "pink" | "grey"

  // setters
  setSpread: (s: SpreadDef) => void;
  setAssignments: (a: SlotAssignment[]) => void;
  setDealing: (v: boolean) => void;

  setQuestion: (q: string) => void;
  setFocusText: (v: string) => void;
  setChoice1Text: (v: string) => void;
  setChoice2Text: (v: string) => void;

  setColorway: (c: Colorway) => void;

  resetTexts: () => void;
};

export const useTarotStore = create<TarotState>((set) => ({
  // defaults
  spread: spreads[0],
  allSpreads: [...spreads, horoscopeSpreadDef()],
  assignments: [],
  dealing: false,

  question: "",
  focusText: "",
  choice1Text: "",
  choice2Text: "",

  colorway: "pink",

  // setters
  setSpread: (s) => set({ spread: s, assignments: [] }),
  setAssignments: (a) => set({ assignments: a }),
  setDealing: (v) => set({ dealing: v }),

  setQuestion: (q) => set({ question: q }),
  setFocusText: (v) => set({ focusText: v }),
  setChoice1Text: (v) => set({ choice1Text: v }),
  setChoice2Text: (v) => set({ choice2Text: v }),

  setColorway: (c) => set({ colorway: c }),

  resetTexts: () =>
    set({ question: "", focusText: "", choice1Text: "", choice2Text: "" }),
}));

// Derive all card IDs from your catalog
export const ALL_CARD_IDS = CARDS_CATALOG.map((c) => c.id);