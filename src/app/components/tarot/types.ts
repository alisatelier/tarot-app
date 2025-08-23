import * as PIXI from "pixi.js";
import { Body } from "matter-js";

// percent units, relative to canvas
export type Win = { x: number; y: number; w: number; h: number };

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

export type Target = { x: number; y: number; angle?: number };
