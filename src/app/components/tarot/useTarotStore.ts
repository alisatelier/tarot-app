"use client";

import { create } from "zustand";
import type { SpreadDef } from "../../../lib/tarot/spreads";
import { spreads as BASE_SPREADS, horoscopeSpreadDef, pathAVsBSpreadDef } from "../../../lib/tarot/spreads";
import { CARDS_CATALOG } from "../../../lib/tarot/cards";
import { QUESTIONS } from "../../../lib/tarot/question";

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
  updateSpreadsForQuestion: (focusText: string) => void;
};

const buildAllSpreads = (focusText?: string): SpreadDef[] => {
  // Find the question based on focusText
  const selectedQuestion = focusText ? QUESTIONS.find(q => q.label === focusText) : null;
  
  // Create dynamic path-a-vs-b spread with current pathA/pathB
  const pathAVsBSpread = selectedQuestion 
    ? pathAVsBSpreadDef(selectedQuestion.pathA, selectedQuestion.pathB)
    : pathAVsBSpreadDef();
    
  return [...BASE_SPREADS, pathAVsBSpread, horoscopeSpreadDef()];
};


export const useTarotStore = create<TarotState>((set, get) => {
  const all = buildAllSpreads();
  const initial = all[0];

  return {
    spread: initial,
    allSpreads: all,
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
    
    updateSpreadsForQuestion: (focusText: string) => {
      const newSpreads = buildAllSpreads(focusText);
      const currentSpread = get().spread;
      
      // If current spread is path-a-vs-b, update it with new labels
      if (currentSpread.id === "path-a-vs-b") {
        const updatedSpread = newSpreads.find(s => s.id === "path-a-vs-b");
        if (updatedSpread) {
          set({ allSpreads: newSpreads, spread: updatedSpread });
          return;
        }
      }
      
      // Otherwise just update the spreads list
      set({ allSpreads: newSpreads });
    },
  };
});



export const ALL_CARD_IDS = CARDS_CATALOG.map((c) => c.id);
