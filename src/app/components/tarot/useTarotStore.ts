"use client";

import { create } from "zustand";
import { CARDS_CATALOG } from "../../../lib/tarot/cards";

type TarotState = {
  // existing fields…
  spreadId: string;
  selectedIntentionId: string | null;
  relationshipName: string;

  setSpreadId: (id: string) => void;
  setSelectedIntentionId: (id: string | null) => void;
  setRelationshipName: (name: string) => void;
};

export const useTarotStore = create<TarotState>((set) => ({
  // existing defaults…
  spreadId: "ppf",
  selectedIntentionId: null,
  relationshipName: "",

  setSpreadId: (id) => set({ spreadId: id, selectedIntentionId: null }),
  setSelectedIntentionId: (id) => set({ selectedIntentionId: id }),
  setRelationshipName: (name) => set({ relationshipName: name }),
}));


export const ALL_CARD_IDS = CARDS_CATALOG.map((c) => c.id);
