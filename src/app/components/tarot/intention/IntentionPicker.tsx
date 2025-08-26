"use client";

import { useEffect, useRef } from "react";
import type { IntentionMode } from "./useIntentionStore";

type SimpleIntention = { id: string; label: string };

type Props = {
  // Store instance created by makeIntentionStore(spreadId)
  useIntentionStore: ReturnType<typeof import("./useIntentionStore").makeIntentionStore>;
  intentions: SimpleIntention[]; // flat list for the current spread
  className?: string;
  ariaLabel?: string;
};

const CUSTOM_ID = "custom";

export default function IntentionPicker({
  useIntentionStore,
  intentions,
  className,
  ariaLabel = "Choose an intention",
}: Props) {
  const {
    mode,
    customText,
    presetId,
    presetLabel,
    setMode,
    setCustomText,
    selectPreset,
  } = useIntentionStore();

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (mode === "custom") textareaRef.current?.focus();
  }, [mode]);

  function handleSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = e.target.value;
    if (id === CUSTOM_ID) {
      setMode("custom" as IntentionMode);
      return;
    }
    const found = intentions.find((i) => i.id === id);
    selectPreset(id, found?.label ?? "");
  }

  const selectedValue = mode === "custom" ? CUSTOM_ID : (presetId ?? "");

  return (
    <div className={className ?? "space-y-3"}>
      <label className="text-sm text-neutral-600">
        Intention <span className="text-neutral-400">(In case you need inspiration)</span>
      </label>
      <select
        className="px-3 py-2 rounded-xl border w-full"
        value={selectedValue}
        onChange={handleSelect}
        aria-label={ariaLabel}
      >
        <option value={CUSTOM_ID}>✍️ Write Your Own Intention</option>
        {intentions.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.label}
          </option>
        ))}
      </select>

      {mode === "custom" ? (
        <div>
          <label htmlFor="custom-intention" className="sr-only">
            Write your intention
          </label>
          <textarea
            id="custom-intention"
            ref={textareaRef}
            className="w-full min-h-[96px] max-h-[240px] rounded-xl border p-3 resize-y"
            maxLength={240}
            placeholder="Write your intention…"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            aria-describedby="intention-help"
          />
          <div id="intention-help" className="mt-1 text-xs text-neutral-500" aria-live="polite">
            {customText.length}/240
          </div>
        </div>
      ) : presetLabel ? (
        <div className="text-xs text-neutral-500" aria-live="polite">
          Using preset: <span className="font-medium">{presetLabel}</span>
        </div>
      ) : null}
    </div>
  );
}
