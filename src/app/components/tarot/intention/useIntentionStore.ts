"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type IntentionMode = "custom" | "preset";

export type IntentionState = {
  mode: IntentionMode;
  customText: string;
  presetId?: string;
  presetLabel?: string;
};

type IntentionStore = IntentionState & {
  setMode: (mode: IntentionMode) => void;
  setCustomText: (v: string) => void;
  selectPreset: (id: string, label: string) => void;
  reset: () => void;
};

/**
 * Factory so you can scope persistence per spreadId:
 *   const useIntentionStore = makeIntentionStore(spreadId)
 */
export const makeIntentionStore = (spreadId: string) =>
  create<IntentionStore>()(
    persist(
      (set) => ({
        mode: "preset",
        customText: "",
        presetId: undefined,
        presetLabel: undefined,
        setMode: (mode) => set({ mode }),
        setCustomText: (v) => set({ customText: v }),
        selectPreset: (presetId, presetLabel) =>
          set({ mode: "preset", presetId, presetLabel }),
        reset: () =>
          set({
            mode: "preset",
            customText: "",
            presetId: undefined,
            presetLabel: undefined,
          }),
      }),
      {
        name: `intention:${spreadId}`, // localStorage key
        version: 1,
      }
    )
  );
