// src/app/components/tarot/questions.ts
import {
  SPREADS,
  Spread,
  getSpreadById,
  getIntentionById,
  needsRelationshipName,
  substituteVars,
  Intention,
} from "./spreads";

export {
  SPREADS,
  getSpreadById,
  getIntentionById,
  needsRelationshipName,
  substituteVars,
};
export type { Spread, Intention };

// Public helpers used by UI + save logic
export function listCategoriesForSpread(spreadId: string) {
  const spread = getSpreadById(spreadId, SPREADS);
  return spread?.categories ?? [];
}

export function resolveIntentionLabel(
  intention: Intention,
  vars: { relationshipName?: string } = {}
) {
  return substituteVars(intention.label, vars);
}
