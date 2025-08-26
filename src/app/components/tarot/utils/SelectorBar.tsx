"use client";

import { useMemo } from "react";
import { useTarotStore } from "../useTarotStore";
import IntentionPicker from "./IntentionPicker";
import { 
  getSpreadById, 
  getIntentionById, 
  substituteVars, 
  SPREADS 
} from "../../../../lib/tarot/spreads";

export default function SelectorBar() {
  const {
    spreadId,
    selectedIntentionId,
    relationshipName,
    setSpreadId,
    setSelectedIntentionId,
    setRelationshipName,
  } = useTarotStore();

  // Get the current spread and intention
  const spread = useMemo(() => getSpreadById(spreadId, SPREADS), [spreadId]);
  const intention = useMemo(() => {
    if (!selectedIntentionId || !spread) return undefined;
    return getIntentionById(spread, selectedIntentionId);
  }, [spread, selectedIntentionId]);

  // Render the resolved intention text
  const renderedIntention = useMemo(() => {
    if (!intention) return "";
    return substituteVars(intention.label, { relationshipName });
  }, [intention, relationshipName]);

  return (
    <div className="grid gap-3">
      {/* Spread & Intention Picker */}
      <div className="flex flex-col">
        <label className="text-sm font-medium mb-1">Reading Setup</label>
        <IntentionPicker
          spreadId={spreadId}
          selectedIntentionId={selectedIntentionId}
          relationshipName={relationshipName}
          onSpreadChange={(id) => {
            setSpreadId(id);
            setSelectedIntentionId(null);
          }}
          onIntentionChange={(id) => setSelectedIntentionId(id)}
          onRelationshipNameChange={setRelationshipName}
        />

        {renderedIntention && (
          <div className="text-sm text-neutral-700 mt-2 p-2 bg-neutral-50 rounded">
            <span className="font-medium">Intention:</span> {renderedIntention}
          </div>
        )}
      </div>
    </div>
  );
}
