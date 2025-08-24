import * as PIXI from "pixi.js";

/**
 * Where newly dealt cards start from.
 * Bottom-center, just off the canvas so they fly in upward.
 *
 * @param app PIXI app
 * @param defaultCardH your intrinsic (unscaled) card height, e.g. 300
 * @param yFactor how far below the bottom edge (in card heights). 0.8–1.0 works well.
 */
export function computeSpawnPoint(
  app: PIXI.Application,
  defaultCardH: number,
  yFactor = 0.8
) {
  const W = app.renderer.width;
  const H = app.renderer.height;
  const x = W / 2;
  const y = H + defaultCardH * yFactor; // off-screen
  return { x, y };
}
