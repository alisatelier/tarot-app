import * as PIXI from "pixi.js";
import { Body } from "matter-js";
import type { SpriteEntity } from "../utils/types";
import type { TarotInterfaceProfile } from "./types";

export type RefLike<T> = { current: T };

export function preScaleEntityForProfile(
  app: PIXI.Application,
  entity: SpriteEntity,
  profile: TarotInterfaceProfile,
  defaultCardW: number
) {
  const targetWidth = app.screen.width * profile.baseWidthRel;
  const preScale = targetWidth / Math.max(1, defaultCardW);

  // Use entity.view instead of entity.canvas
  const cur = entity.view.scale.x || 1;
  if (Math.abs(cur - preScale) > 1e-3) {
    entity.view.scale.set(preScale, preScale);
    if (entity.body) {
      const ratio = preScale / cur;
      Body.scale(entity.body, ratio, ratio);
    }
  }
  return preScale;
}

export function computeBaseScaleForEntityWithProfile(
  entity: SpriteEntity,
  app: PIXI.Application,
  profile: TarotInterfaceProfile
) {
  const targetWidth = app.screen.width * profile.baseWidthRel;
  const v = entity.view;
  const b = v.getBounds(); // world-space size at current scale
  const currentWidth = Math.max(1, b.width);
  const currentScale = v.scale.x || 1;
  const k = targetWidth / currentWidth;
  return currentScale * k; // absolute scale to reach targetWidth
}

export function applyBaseScaleToCards(
  newScale: number,
  spritesRef: RefLike<SpriteEntity[]>,
  currentZoomedCardRef: RefLike<SpriteEntity | null>,
  baseCardScaleRef: RefLike<number>
) {
  const sprites = spritesRef.current;
  if (!sprites.length) return;
  if (currentZoomedCardRef.current) return;

  for (const entity of sprites) {
    const v = entity.view;
    const curScale = v.scale.x || 1;
    if (Math.abs(curScale - newScale) < 0.001) continue;
    const ratio = newScale / curScale;
    v.scale.set(newScale, newScale);
    if (entity.body) Body.scale(entity.body, ratio, ratio);
  }
  baseCardScaleRef.current = newScale;
}

export function recomputeAndApplyBaseScaleWithProfile(
  appRef: RefLike<PIXI.Application | null>,
  spritesRef: RefLike<SpriteEntity[]>,
  currentZoomedCardRef: RefLike<SpriteEntity | null>,
  baseCardScaleRef: RefLike<number>,
  profile: TarotInterfaceProfile
) {
  const app = appRef.current;
  const sprites = spritesRef.current;
  if (!app || !sprites.length) return;

  const scale = computeBaseScaleForEntityWithProfile(sprites[0], app, profile);
  applyBaseScaleToCards(scale, spritesRef, currentZoomedCardRef, baseCardScaleRef);
}
