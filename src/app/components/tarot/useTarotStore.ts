"use client";

import { create } from "zustand";
import type { SpreadDef } from "../../../lib/tarot/spreads";
import { spreads as BASE_SPREADS, horoscopeSpreadDef, pathAVsBSpreadDef } from "../../../lib/tarot/spreads";
import { CARDS_CATALOG } from "../../../lib/tarot/cards";
import { spreadAllowsIntentions, type SpreadId, type CategoryId, QUESTIONS } from "../../../lib/tarot/question";




type TarotState = {
  spreadId: SpreadId;
  category: CategoryId;
  intentionId: string | null;
  setSpreadId: (s: SpreadId) => void;
  setCategory: (c: CategoryId) => void;
  setIntentionId: (id: string | null) => void;
};

const buildAllSpreads = (focusText?: string): SpreadDef[] => {
  // Find the question based on focusText
  const selectedQuestion = focusText ? QUESTIONS.find(q => q.label === focusText) : null;
  
  // Create dynamic path-a-vs-b spread with current pathA/pathB
  const pathAVsBSpread = selectedQuestion 
    ? pathAVsBSpreadDef(
        typeof selectedQuestion.pathA === "function" ? selectedQuestion.pathA() : selectedQuestion.pathA,
        typeof selectedQuestion.pathB === "function" ? selectedQuestion.pathB() : selectedQuestion.pathB
      )
    : pathAVsBSpreadDef();
    
  return [...BASE_SPREADS, pathAVsBSpread, horoscopeSpreadDef()];
};


export const useTarotStore = create<TarotState>((set, get) => ({
  spreadId: "ppf",
  category: "relationships",
  intentionId: null,
  setSpreadId: (s) =>
    set((state) => ({
      spreadId: s,
      intentionId: spreadAllowsIntentions(s) ? state.intentionId : null,
    })),
  setCategory: (c) => set({ category: c }),
  setIntentionId: (id) => {
    const { spreadId } = get();
    set({ intentionId: spreadAllowsIntentions(spreadId) ? id : null });
  },
}));



export const ALL_CARD_IDS = CARDS_CATALOG.map((c) => c.id);
