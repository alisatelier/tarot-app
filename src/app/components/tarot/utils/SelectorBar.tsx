"use client";

import { useEffect, useMemo } from "react";
import {
  SPREADS,
  CATEGORY_OPTIONS,
  QUESTIONS,
  intentionsForCategory,
  spreadAllowsIntentions,
  getPathsForIntention,
  type SpreadId,
} from "../../../../lib/tarot/question"; // adjust path
// Update the import path if the file is located elsewhere, for example:
import { useTarotStore } from "../useTarotStore"; // adjust path

export default function SelectorBar() {
  const {
    spreadId,
    category,
    intentionId,
    setSpreadId,
    setCategory,
    setIntentionId,
  } = useTarotStore();

  const allowsIntentions = spreadAllowsIntentions(spreadId);
  const intentionOptions = useMemo(() => {
    if (spreadId === "pathab") {
      // For pathab spread, use QUESTIONS instead of INTENTIONS
      return QUESTIONS.filter(q => q.category === category) || [];
    } else {
      // For other spreads, use INTENTIONS
      return intentionsForCategory(category) || [];
    }
  }, [spreadId, category]);

  // If user switches to a spread that disallows intentions, clear it.
  useEffect(() => {
    if (!allowsIntentions && intentionId) setIntentionId(null);
  }, [allowsIntentions, intentionId, setIntentionId]);

  // If user switches category and current intention isn't in that category, clear it.
  useEffect(() => {
    if (intentionId && intentionOptions?.length > 0 && !intentionOptions.some((i) => i?.id === intentionId)) {
      setIntentionId(null);
    }
  }, [category, intentionId, intentionOptions, setIntentionId]);

  return (
    <div className="grid gap-3 md:grid-cols-3">
      {/* Spread */}
      <div className="flex flex-col">
        <label className="text-sm font-medium mb-1">Spread</label>
        <select
          className="rounded-lg border px-3 py-2"
          value={spreadId}
          onChange={(e) => setSpreadId(e.target.value as SpreadId)}
        >
          {SPREADS?.filter(s => s?.id).map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
        {!allowsIntentions && (
          <p className="mt-1 text-xs text-gray-500">
            This spread ignores the Intention. Choose your category, then proceed.
          </p>
        )}
      </div>

      {/* Category (always enabled) */}
      <div className="flex flex-col">
        <label className="text-sm font-medium mb-1">Category</label>
        <select
          className="rounded-lg border px-3 py-2"
          value={category}
          onChange={(e) => setCategory(e.target.value as any)}
        >
          {CATEGORY_OPTIONS?.filter(c => c?.id).map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* Intention (disabled when not allowed) */}
      <div className="flex flex-col">
        <label className="text-sm font-medium mb-1">
          {spreadId === "pathab" ? "Question" : "Intention"} {allowsIntentions ? "" : "(not used by this spread)"}
        </label>
        <select
          className="rounded-lg border px-3 py-2 disabled:opacity-60"
          disabled={!allowsIntentions}
          value={intentionId ?? ""}
          onChange={(e) => setIntentionId(e.target.value || null)}
        >
          <option value="">{spreadId === "pathab" ? "— Select question —" : "— Select intention —"}</option>
          {intentionOptions?.filter(i => i?.id).map((i) => (
            <option key={i.id} value={i.id}>
              {i.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
