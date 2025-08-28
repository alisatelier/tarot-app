"use client";

import { useTarotStore } from "../useTarotStore";
import { SPREADS } from "../lib/questionDropDown";

interface DropDownIntentionProps {
  spreadOnly?: boolean;
}

export function DropDownIntention({ spreadOnly = false }: DropDownIntentionProps) {
  const {
    spreadId,
    selectedIntentionId,
    customIntentionText,
    relationshipName,
    setSpreadId,
    setSelectedIntentionId,
    setCustomIntentionText,
    setRelationshipName,
  } = useTarotStore();

  // If spreadOnly is true, only render the spread selection
  if (spreadOnly) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Spread:
        </label>
        <select
          value={spreadId}
          onChange={(e) => setSpreadId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select a spread...</option>
          {SPREADS.map((spread) => (
            <option key={spread.id} value={spread.id}>
              {spread.title}
            </option>
          ))}
        </select>
      </div>
    );
  }

  // Original full component logic (kept for backward compatibility)
  const currentSpread = SPREADS.find(spread => spread.id === spreadId);

  const handleSpreadChange = (spreadId: string) => {
    setSpreadId(spreadId);
    // Reset intention when spread changes
    setSelectedIntentionId("");
    setCustomIntentionText("");
    setRelationshipName("");
  };

  const handleIntentionChange = (intentionId: string) => {
    setSelectedIntentionId(intentionId);
    
    // Clear custom text if not custom intention
    if (!intentionId.includes(":custom:own")) {
      setCustomIntentionText("");
    }
    
    // Clear relationship name if new intention doesn't require it
    const intention = currentSpread?.categories
      .flatMap(cat => cat.intentions)
      .find(int => int.id === intentionId);
    
    if (!intention?.requiresName) {
      setRelationshipName("");
    }
  };

  const selectedIntentionData = currentSpread?.categories
    .flatMap(cat => cat.intentions)
    .find(int => int.id === selectedIntentionId);

  return (
    <div className="space-y-4">
      {/* Spread Selection */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Spread:
        </label>
        <select
          value={spreadId}
          onChange={(e) => handleSpreadChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select a spread...</option>
          {SPREADS.map((spread) => (
            <option key={spread.id} value={spread.id}>
              {spread.title}
            </option>
          ))}
        </select>
      </div>

      {/* Intention Selection (only show if spread is selected) */}
      {spreadId && currentSpread && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Intention:
          </label>
          <select
            value={selectedIntentionId || ""}
            onChange={(e) => handleIntentionChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select an intention...</option>
            {currentSpread.categories.map((category) => (
              <optgroup key={category.id} label={category.title}>
                {category.intentions.map((intention) => (
                  <option key={intention.id} value={intention.id}>
                    {intention.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      )}

      {/* Custom Intention Text (only show for custom intentions) */}
      {selectedIntentionId?.includes(":custom:own") && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Your Intention:
          </label>
          <textarea
            value={customIntentionText}
            onChange={(e) => setCustomIntentionText(e.target.value)}
            placeholder="Write your intention here..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
          />
        </div>
      )}

      {/* Relationship Name (only show for intentions that require it) */}
      {selectedIntentionData?.requiresName && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Relationship Name:
          </label>
          <input
            type="text"
            value={relationshipName}
            onChange={(e) => setRelationshipName(e.target.value)}
            placeholder="Enter the name..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      )}
    </div>
  );
}