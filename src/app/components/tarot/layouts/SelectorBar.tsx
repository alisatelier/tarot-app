"use client";

import { useState } from "react";
import { DropDownIntention } from "../intention/dropDownIntention";
import { useTarotStore, getRenderedIntention } from "../useTarotStore";
import { SPREADS } from "../lib/questionDropDown";

export function SelectorBar() {
  const {
    spreadId,
    selectedIntentionId,
    customIntentionText,
    relationshipName,
    setSelectedIntentionId,
    setCustomIntentionText,
    setRelationshipName,
  } = useTarotStore();

  const [intentionMode, setIntentionMode] = useState<"own" | "inspire" | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const currentSpread = SPREADS.find(spread => spread.id === spreadId);
  const categoriesWithoutCustom = currentSpread?.categories.filter(cat => cat.id !== "custom") || [];
  const renderedIntention = getRenderedIntention(selectedIntentionId, relationshipName, customIntentionText);

  const handleWriteOwnIntention = () => {
    setIntentionMode("own");
    setSelectedCategory("");
    const customIntention = currentSpread?.categories.find(cat => cat.id === "custom")?.intentions[0];
    if (customIntention) {
      setSelectedIntentionId(customIntention.id);
    }
  };

  const handleInspireIntention = () => {
    setIntentionMode("inspire");
    setCustomIntentionText("");
    setSelectedIntentionId("");
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedIntentionId("");
  };

  const handleIntentionSelect = (intentionId: string) => {
    setSelectedIntentionId(intentionId);
    const intention = currentSpread?.categories
      .flatMap(cat => cat.intentions)
      .find(int => int.id === intentionId);
    
    // Clear relationship name if new intention doesn't require it
    if (!intention?.requiresName) {
      setRelationshipName("");
    }
  };

  const handleRelationshipNameChange = (name: string) => {
    setRelationshipName(name);
  };

  const selectedIntentionData = currentSpread?.categories
    .flatMap(cat => cat.intentions)
    .find(int => int.id === selectedIntentionId);

  return (
    <div className="w-full bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col space-y-4">
          {/* Original Dropdown for spread selection only */}
          <div className="flex flex-col space-y-2">
            <DropDownIntention spreadOnly={true} />
          </div>

          {/* Show intention selection after spread is selected */}
          {spreadId && (
            <div className="flex flex-col space-y-4">
              {/* Two buttons for intention mode */}
              <div className="flex space-x-4">
                <button
                  onClick={handleWriteOwnIntention}
                  className={`px-4 py-2 rounded-md border transition-colors ${
                    intentionMode === "own"
                      ? "bg-brandnavy text-white border-brandnavy"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  Write My Own Intention
                </button>
                <button
                  onClick={handleInspireIntention}
                  className={`px-4 py-2 rounded-md border transition-colors ${
                    intentionMode === "inspire"
                      ? "bg-brandnavy text-white border-brandnavy"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  Inspire My Intention
                </button>
              </div>

              {/* Custom text field for "Write My Own Intention" */}
              {intentionMode === "own" && (
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

              {/* Category and intention dropdowns for "Inspire My Intention" */}
              {intentionMode === "inspire" && (
                <div className="space-y-4">
                  {/* Category Selection */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Choose a Category:
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select a category...</option>
                      {categoriesWithoutCustom.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Intention Selection */}
                  {selectedCategory && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Choose an Intention:
                      </label>
                      <select
                        value={selectedIntentionId || ""}
                        onChange={(e) => handleIntentionSelect(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select an intention...</option>
                        {currentSpread?.categories
                          .find(cat => cat.id === selectedCategory)
                          ?.intentions.map((intention) => {
                            // Handle label display for relationship intentions
                            let displayLabel = intention.label;
                            if (intention.requiresName) {
                              if (relationshipName) {
                                // Show substituted name
                                displayLabel = intention.label.replace("${relationshipName}", relationshipName);
                              } else {
                                // Show placeholder
                                displayLabel = intention.label.replace("${relationshipName}", "_____");
                              }
                            }
                            
                            return (
                              <option key={intention.id} value={intention.id}>
                                {displayLabel}
                              </option>
                            );
                          })}
                      </select>
                    </div>
                  )}

                  {/* Relationship Name Field */}
                  {selectedIntentionData?.requiresName && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Relationship Name:
                      </label>
                      <input
                        type="text"
                        value={relationshipName}
                        onChange={(e) => handleRelationshipNameChange(e.target.value)}
                        placeholder="Enter the name..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Show rendered intention when available */}
          {renderedIntention && (
            <div className="text-sm text-gray-600 italic bg-gray-50 p-3 rounded">
              "{renderedIntention}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
