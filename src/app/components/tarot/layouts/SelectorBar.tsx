"use client";

import { useMemo, useState } from "react";
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

  const [customIntentionText, setCustomIntentionText] = useState("");

  // Get the current spread and intention
  const spread = useMemo(() => getSpreadById(spreadId, SPREADS), [spreadId]);
  const intention = useMemo(() => {
    if (!selectedIntentionId || !spread) return undefined;
    return getIntentionById(spread, selectedIntentionId);
  }, [spread, selectedIntentionId]);

  // Render the resolved intention text (includes custom intentions)
  const renderedIntention = useMemo(() => {
    // For custom intentions, show the custom text if available
    if (selectedIntentionId?.endsWith(":custom:own")) {
      return customIntentionText.trim() || "";
    }
    // For preset intentions, show the resolved label
    if (!intention) return "";
    return substituteVars(intention.label, { relationshipName });
  }, [intention, relationshipName, selectedIntentionId, customIntentionText]);

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
            setCustomIntentionText(""); // Clear custom text when changing spreads
          }}
          onIntentionChange={(id: string) => setSelectedIntentionId(id)}
          onRelationshipNameChange={setRelationshipName}
          onCustomIntentionChange={setCustomIntentionText}
        />

        {renderedIntention && (
          <div className="text-sm text-neutral-700 mt-2 p-2 bg-neutral-50 rounded">
            <span className="font-medium">
              {selectedIntentionId?.endsWith(":custom:own") ? "My Own Intention:" : "Selected Intention:"}
            </span> {renderedIntention}
          </div>
        )}
      </div>
    </div>
  );
}
