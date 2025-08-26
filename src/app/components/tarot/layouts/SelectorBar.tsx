"use client";

import { useMemo } from "react";
import { useTarotStore } from "../useTarotStore";
import DropDownIntention from "../intention/dropDownIntention";
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

  // Render the resolved intention text (but not for custom intentions)
  const renderedIntention = useMemo(() => {
    if (!intention || selectedIntentionId?.endsWith(":custom:own")) return "";
    return substituteVars(intention.label, { relationshipName });
  }, [intention, relationshipName, selectedIntentionId]);

  return (
    <div className="grid gap-4">
      {/* Unified Dropdown with Free-Text Option */}
      <div className="flex flex-col">
        <label className="text-sm font-medium mb-2">Select Spread & Intention</label>
        <DropDownIntention
          spreadId={spreadId}
          selectedIntentionId={selectedIntentionId}
          relationshipName={relationshipName}
          onSpreadChange={(id: string) => {
            setSpreadId(id);
            setSelectedIntentionId(null);
          }}
          onIntentionChange={(id: string) => setSelectedIntentionId(id)}
          onRelationshipNameChange={setRelationshipName}
        />

        {renderedIntention && (
          <div className="text-sm text-neutral-700 mt-2 p-2 bg-neutral-50 rounded">
            <span className="font-medium">Selected Intention:</span> {renderedIntention}
          </div>
        )}
      </div>
    </div>
  );
}
