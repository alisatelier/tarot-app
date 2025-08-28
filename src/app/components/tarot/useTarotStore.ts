"use client";

import { create } from "zustand";
import { CARDS_CATALOG } from "./lib/cards";
import { SPREADS } from "./lib/questionDropDown";

type TarotState = {
  spreadId: string;
  selectedIntentionId: string | null;
  relationshipName: string;
  customIntentionText: string;

  setSpreadId: (id: string) => void;
  setSelectedIntentionId: (id: string | null) => void;
  setRelationshipName: (name: string) => void;
  setCustomIntentionText: (text: string) => void;
};

export const useTarotStore = create<TarotState>((set) => ({
  spreadId: "ppf",
  selectedIntentionId: null,
  relationshipName: "",
  customIntentionText: "",

  setSpreadId: (id) => set({ spreadId: id, selectedIntentionId: null }),
  setSelectedIntentionId: (id) => set({ selectedIntentionId: id }),
  setRelationshipName: (name) => set({ relationshipName: name }),
  setCustomIntentionText: (text) => set({ customIntentionText: text }),
}));

// Helper function to get rendered intention
export const getRenderedIntention = (
  selectedIntentionId: string | null,
  relationshipName: string,
  customIntentionText: string
): string => {
  if (!selectedIntentionId) return "";
  
  // If it's a custom intention, return the custom text
  if (selectedIntentionId.includes(":custom:own")) {
    return customIntentionText;
  }
  
  // Find the intention in the spreads data
  const intention = SPREADS
    .flatMap(spread => spread.categories)
    .flatMap(category => category.intentions)
    .find(int => int.id === selectedIntentionId);
  
  if (!intention) return "";
  
  // Replace ${relationshipName} placeholder if needed
  if (intention.requiresName && relationshipName) {
    return intention.label.replace("${relationshipName}", relationshipName);
  }
  
  return intention.label;
};

export const ALL_CARD_IDS = CARDS_CATALOG.map((c) => c.id);