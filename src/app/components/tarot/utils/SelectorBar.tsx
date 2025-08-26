"use client";

import { useMemo } from "react";
import { useTarotStore } from "../useTarotStore";
import IntentionPicker from "./IntentionPicker";
import FreeTextIntentionPicker from "../intention/IntentionPicker";
import { makeIntentionStore } from "../intention/useIntentionStore";
import { useResolvedIntention } from "../intention/useResolvedIntention";
import { flattenIntentions } from "../intention/flattenIntentions";
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

  // Free-text intention picker setup
  const useIntentionStore = useMemo(() => makeIntentionStore(spread?.id || spreadId), [spread?.id, spreadId]);
  
  const intentions = useMemo(() => {
    if (!spread) return [];
    // Convert the complex spread to simplified format for flattenIntentions
    const simpleSpread = {
      id: spread.id,
      title: spread.title,
      slots: spread.slots,
      categories: spread.categories.map(cat => ({
        id: cat.id,
        title: cat.title,
        intentions: cat.intentions.map(intention => ({
          id: intention.id,
          kind: "simple" as const,
          label: intention.label,
          requiresName: intention.requiresName
        }))
      }))
    };
    return flattenIntentions(simpleSpread, { relationshipName });
  }, [spread, relationshipName]);

  return (
    <div className="grid gap-4">
      {/* Original Dropdown Functionality */}
      <div className="flex flex-col">
        <label className="text-sm font-medium mb-2">Select Spread & Intention</label>
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
            <span className="font-medium">Selected Intention:</span> {renderedIntention}
          </div>
        )}
      </div>

      {/* New Free-Text Intention Input */}
      <div className="flex flex-col">
        <label className="text-sm font-medium mb-2">Or Write Your Own Intention</label>
        <FreeTextIntentionPicker 
          useIntentionStore={useIntentionStore} 
          intentions={intentions}
          className="border rounded-lg p-2"
        />
      </div>
    </div>
  );
}
