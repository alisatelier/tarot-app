// src/app/components/tarot/IntentionPicker.tsx
"use client";

import { useMemo, useState } from "react";
import {
  SPREADS,
  getSpreadById,
  needsRelationshipName,
  substituteVars,
  type Spread,
  type Intention,
} from "../../../../lib/tarot/spreads";

type Props = {
  spreadId: string;
  selectedIntentionId: string | null;
  relationshipName: string;
  onSpreadChange: (id: string) => void;
  onIntentionChange: (id: string) => void;
  onRelationshipNameChange: (name: string) => void;
  onCustomIntentionChange?: (text: string) => void;
};

export default function DropDownIntention({
  spreadId,
  selectedIntentionId,
  relationshipName,
  onSpreadChange,
  onIntentionChange,
  onRelationshipNameChange,
  onCustomIntentionChange,
}: Props) {
  const spread = useMemo(() => getSpreadById(spreadId, SPREADS), [spreadId]);
  const [customIntentionText, setCustomIntentionText] = useState("");

  // Check if the selected intention is a custom "Write My Own" intention
  const isCustomIntention = useMemo(() => {
    return selectedIntentionId?.endsWith(":custom:own") || false;
  }, [selectedIntentionId]);

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
            onChange={(e) => {
              onIntentionChange(e.target.value);
              // Clear custom text when switching away from custom intention
              if (!e.target.value.endsWith(":custom:own")) {
                setCustomIntentionText("");
                onCustomIntentionChange?.("");
              }
            }}
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

      {/* Custom intention text field when "Write My Own Intention" is selected */}
      {isCustomIntention && (
        <div className="flex flex-col gap-2">
          <label htmlFor="custom-intention-text" className="text-sm text-neutral-600">
           My Own Intention
          </label>
          <textarea
            id="custom-intention-text"
            className="w-full min-h-[96px] max-h-[240px] rounded-xl border p-3 resize-y"
            maxLength={150}
            placeholder=" ✍️ Write your intention here..."
            value={customIntentionText}
            onChange={(e) => {
              setCustomIntentionText(e.target.value);
              onCustomIntentionChange?.(e.target.value);
            }}
          />
          <div className="text-xs text-neutral-500">
            {customIntentionText.length}/150 characters
          </div>
        </div>
      )}

      {/* Relationship name field if needed (but not for custom intentions) */}
      {spread &&
        selectedIntentionId &&
        !isCustomIntention &&
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