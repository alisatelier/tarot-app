import * as PIXI from "pixi.js";
import { Body } from "matter-js";

export type SpriteEntity = {
  body: Body;
  cardId: string;
  view: PIXI.Container; //parent container for flip/rotate/position
  front: PIXI.Sprite;
  back: PIXI.Sprite;
  clip: PIXI.Graphics;
  isFaceUp: boolean;
  reversed: boolean;
  slotKey: string;
  zoomState: 'normal' | 'zoomed'; // Track zoom state for click cycling
};

// --- Reading metadata that accompanies the cards you save ---
export type SavedIntention = {
  spreadId: string;               // e.g. "ppf", "this-or-that"
  intentionId: string;            // e.g. "tot:home:rent-or-buy"
  template: string;               // raw template with ${relationshipName}
  vars: { relationshipName?: string };
  rendered: string;               // substituted label the user saw

  // Only present for "binary" (This or That) intentions
  pathA?: string;
  pathB?: string;
};

export type SavedReading = {
  id: string;                     // uuid you generate
  createdAt: string;              // ISO
  cards: string[];                // whatever you already store (ids/urls/etc.)
  slotLabels: string[];           // labels under the cards at save time
  colorway?: string;              // optional if you store it
  rngSeed?: string | number;      // optional if you store it
  intention: SavedIntention;      // 👈 new: tuck intention in here
};


export type Target = { x: number; y: number; angle?: number };
