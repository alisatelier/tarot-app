"use client";

import { create } from "zustand";
import type { SpreadDef } from "../../../lib/tarot/spreads";
import { spreads, horoscopeSpreadDef } from "../../../lib/tarot/spreads";
import { CARDS_CATALOG } from "../../../lib/tarot/cards";

type SlotAssignment = { slotKey: string; cardId: string; reversed: boolean };

type Colorway = "pink" | "grey";

type TarotState = {
  spread: SpreadDef;
  allSpreads: SpreadDef[];
  assignments: SlotAssignment[];

  // NEW: user-provided text
  question: string;
  focusText: string;
  choice1Text: string;
  choice2Text: string;

  // Colorway selection
  colorway: Colorway;

  dealing: boolean;

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
  spread: spreads[0],
  allSpreads: [...spreads, horoscopeSpreadDef()],
  assignments: [],

  question: "",
  focusText: "",
  choice1Text: "",
  choice2Text: "",

  colorway: "pink",

  dealing: false,

  setSpread: (s) => set({ spread: s, assignments: [] }),
  setAssignments: (a) => set({ assignments: a }),
  setDealing: (v) => set({ dealing: v }),

  setQuestion: (q) => set({ question: q }),
  setFocusText: (v) => set({ focusText: v }),
  setChoice1Text: (v) => set({ choice1Text: v }),
  setChoice2Text: (v) => set({ choice2Text: v }),
  setColorway: (c) => set({ colorway: c }),

  resetTexts: () => set({ question: "", focusText: "", choice1Text: "", choice2Text: "" }),
}));

export const ALL_CARD_IDS = CARDS_CATALOG.map((c) => c.id);
