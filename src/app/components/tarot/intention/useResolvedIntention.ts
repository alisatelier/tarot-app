import { useStore } from "zustand";
import type { makeIntentionStore } from "./useIntentionStore";

/** Returns the exact string to send to the LLM / save with the reading. */
export function useResolvedIntention<Store extends ReturnType<typeof makeIntentionStore>>(
  useIntentionStore: Store
) {
  return useStore(useIntentionStore, (s) =>
    s.mode === "custom" ? s.customText.trim() : (s.presetLabel ?? "")
  );
}
