// src/app/components/tarot/IntentionPicker.tsx
"use client";

import { useMemo } from "react";
import {
  SPREADS,
  getSpreadById,
  needsRelationshipName,
  substituteVars,
  type Spread,
  type Intention,
} from "../lib/spreads";

type Props = {
  spreadId: string;
  selectedIntentionId: string | null;
  relationshipName: string;
  onSpreadChange: (id: string) => void;
  onIntentionChange: (id: string) => void;
  onRelationshipNameChange: (name: string) => void;
};

export default function IntentionPicker({
  spreadId,
  selectedIntentionId,
  relationshipName,
  onSpreadChange,
  onIntentionChange,
  onRelationshipNameChange,
}: Props) {
  const spread = useMemo(() => getSpreadById(spreadId, SPREADS), [spreadId]);

  return (
    <div className="flex flex-col gap-3">
      {/* Spread select */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-neutral-600">Spread</span>
        <select
          className="px-3 py-2 rounded-xl border"
          value={spreadId}
          onChange={(e) => onSpreadChange(e.target.value)}
        >
          {SPREADS.map((s: Spread) => (
            <option key={s.id} value={s.id}>
              {s.title}
            </option>
          ))}
        </select>
      </div>

      {/* Intention select with category subheadings */}
      {spread && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-600">Intention</span>
          <select
            className="px-3 py-2 rounded-xl border min-w-[320px]"
            value={selectedIntentionId ?? ""}
            onChange={(e) => onIntentionChange(e.target.value)}
          >
            <option value="" disabled>
              Select an intention…
            </option>

            {spread.categories.map((cat) => (
              <optgroup key={cat.id} label={cat.title}>
                {cat.intentions.map((intent: Intention) => (
                  <option key={intent.id} value={intent.id}>
                    {substituteVars(intent.label, { relationshipName: "________" })}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      )}

      {/* Relationship name field if needed */}
      {spread &&
        selectedIntentionId &&
        (() => {
          const intention = spread.categories
            .flatMap((c) => c.intentions)
            .find((i: Intention) => i.id === selectedIntentionId);
          if (!intention) return null;
          if (!needsRelationshipName(intention)) return null;
          return (
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-600">Name</span>
              <input
                className="px-3 py-2 rounded-xl border"
                type="text"
                placeholder="Enter their name"
                value={relationshipName}
                onChange={(e) => onRelationshipNameChange(e.target.value)}
              />
            </div>
          );
        })()}
    </div>
  );
}
