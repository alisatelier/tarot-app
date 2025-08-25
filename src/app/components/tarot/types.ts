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

export type Target = { x: number; y: number; angle?: number };
