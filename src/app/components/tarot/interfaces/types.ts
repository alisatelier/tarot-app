import * as PIXI from "pixi.js";
import type { SpriteEntity } from "../types";

// Structural ref so we don't import React types here
export type RefLike<T> = { current: T };

export interface TarotInterfaceProfile {
  id: "mobile" | "tablet" | "desktop";
  /** non-zoomed card width as a fraction of screen width */
  baseWidthRel: number;
  /** padding (px) around a zoomed card when fitting to screen */
  zoomPadding: number;
  /** optional extra zoom factor on top of fit (1 = no overscale) */
  zoomOverscale?: number;

  /** does this profile apply for the given screen width? */
  matches: (screenWidth: number) => boolean;

  /** compute absolute zoom scale for an entity (based on current scale & bounds) */
  computeZoomScale: (app: PIXI.Application, entity: SpriteEntity) => number;
}

/** Fit a container to the screen using its current world bounds, return *absolute* scale */
export function fitScaleToScreen(
  app: PIXI.Application,
  container: PIXI.Container,
  pad = 24,
  overscale = 1
) {
  const b = container.getBounds(); // world-space size
  const sw = app.screen.width - pad * 2;
  const sh = app.screen.height - pad * 2;
  const k = Math.min(sw / Math.max(1, b.width), sh / Math.max(1, b.height));
  const newAbsScale = (container.scale.x || 1) * k * overscale;
  
  // Ensure zoom always makes the card bigger, never smaller
  const currentScale = container.scale.x || 1;
  const minZoomScale = currentScale * 1.5; // At least 1.5x current size
  
  return Math.max(newAbsScale, minZoomScale);
}
