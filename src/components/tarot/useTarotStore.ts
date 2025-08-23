"use client";

import { create } from "zustand";
import type { SpreadDef } from "../../lib/store/spreads";
import { spreads, horoscopeSpreadDef } from "../../lib/store/spreads";
import { CARDS } from "../../lib/store/cards";

type SlotAssignment = { slotKey: string; cardId: string; reversed: boolean };

type TarotState = {
  spread: SpreadDef;
  allSpreads: SpreadDef[];
  assignments: SlotAssignment[];

  // NEW: user-provided text
  question: string;
  focusText: string;
  choice1Text: string;
  choice2Text: string;

  dealing: boolean;

  setSpread: (s: SpreadDef) => void;
  setAssignments: (a: SlotAssignment[]) => void;
  setDealing: (v: boolean) => void;

  setQuestion: (q: string) => void;
  setFocusText: (v: string) => void;
  setChoice1Text: (v: string) => void;
  setChoice2Text: (v: string) => void;

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

  dealing: false,

  setSpread: (s) => set({ spread: s, assignments: [] }),
  setAssignments: (a) => set({ assignments: a }),
  setDealing: (v) => set({ dealing: v }),

  setQuestion: (q) => set({ question: q }),
  setFocusText: (v) => set({ focusText: v }),
  setChoice1Text: (v) => set({ choice1Text: v }),
  setChoice2Text: (v) => set({ choice2Text: v }),

  resetTexts: () => set({ question: "", focusText: "", choice1Text: "", choice2Text: "" }),
}));

export const ALL_CARD_IDS = CARDS.map((c) => c.id);
