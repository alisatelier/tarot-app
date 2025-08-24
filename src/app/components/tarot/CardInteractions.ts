import * as PIXI from "pixi.js";
import type { SpriteEntity } from "./types";

/**
 * Card interaction and animation utilities
 */

type Getter<T> = () => T;
type Setter<T> = (v: T) => void;

export class interactions {
  private getHoverAnim: Getter<Map<SpriteEntity, number>>;
  private getFlipping: Getter<Set<SpriteEntity>>;
  private getCurrentZoomed: Getter<SpriteEntity | null>;
  private setCurrentZoomed: Setter<SpriteEntity | null>;
  private getApp: Getter<PIXI.Application | null>;
  private getSprites: Getter<SpriteEntity[]>;

  constructor(
    getHoverAnim: Getter<Map<SpriteEntity, number>>,
    getFlipping: Getter<Set<SpriteEntity>>,
    getCurrentZoomed: Getter<SpriteEntity | null>,
    setCurrentZoomed: Setter<SpriteEntity | null>,
    getApp: Getter<PIXI.Application | null>,
    getSprites: Getter<SpriteEntity[]>
  ) {
    this.getHoverAnim = getHoverAnim;
    this.getFlipping = getFlipping;
    this.getCurrentZoomed = getCurrentZoomed;
    this.setCurrentZoomed = setCurrentZoomed;
    this.getApp = getApp;
    this.getSprites = getSprites;
  }

  handleCardClick(entity: SpriteEntity) {
    if (this.getFlipping().has(entity)) return;

    const zoomed = this.getCurrentZoomed();

    if (!zoomed) {
      this.zoomToCard(entity, true);
      this.setCurrentZoomed(entity);
      return;
    }

    if (zoomed === entity) {
      this.unzoomCurrent();
      this.setCurrentZoomed(null);
      return;
    }

    if (!entity.isFaceUp) {
      // First click: Flip to reveal the card
      this.flipEntity(entity, 260);
    } else if (entity.zoomState === "normal") {
      // Second click: Zoom in and hide other cards
      this.zoomToCard(entity, true);
      this.hideOtherCards(entity);
      this.setCurrentZoomed(entity);
    } else {
      // Third click: Zoom out and show all cards
      this.zoomToCard(entity, false);
      this.showAllCards();
      this.setCurrentZoomed(null);
    }
  }

  handleGlobalClick = (dealing: boolean) => {
    if (dealing) return false; // Block during dealing

    // Check if there's a zoomed card - if so, zoom out on ANY click anywhere
    const currentZoomed = this.getCurrentZoomed();
    if (currentZoomed && currentZoomed.zoomState === "zoomed") {
      this.zoomToCard(currentZoomed, false);
      this.showAllCards();
      this.setCurrentZoomed(null);
      return true; // Handled zoom out
    }

    return false; // Continue with normal processing
  };

  private hideOtherCards(zoomedEntity: SpriteEntity, ms = 300) {
    for (const entity of this.spritesRef.current) {
      if (entity === zoomedEntity) continue; // Skip the zoomed card

      const v = entity.view;
      v.eventMode = "none";
      const fromAlpha = v.alpha;
      const toAlpha = 0; // Fade to invisible

      if (fromAlpha === toAlpha) return; // Already hidden

      const start = performance.now();
      let raf = 0;
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / ms);
        const e = 1 - Math.pow(1 - t, 3); // easeOutCubic
        v.alpha = fromAlpha + (toAlpha - fromAlpha) * e;
        if (t < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }
  }

  public showAllCards(ms = 300) {
    for (const entity of this.spritesRef.current) {
      const v = entity.view;
      v.eventMode = "static";
      const fromAlpha = v.alpha;
      const toAlpha = 1; // Fade to fully visible

      if (fromAlpha === toAlpha) continue; // Already visible, skip animation

      const start = performance.now();
      let raf = 0;
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / ms);
        const e = 1 - Math.pow(1 - t, 3); // easeOutCubic
        v.alpha = fromAlpha + (toAlpha - fromAlpha) * e;
        if (t < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }
  }

  unzoomCurrent() {
  const app = this.getApp();
  const zoomed = this.getCurrentZoomed();
  if (!app || !zoomed) return;

  const v = zoomed.view;

  // Pull saved transform
  // @ts-expect-error - restore ad-hoc metadata
  const orig = v.__orig as
    | { x: number; y: number; sx: number; sy: number; rot: number; z: number }
    | undefined;

  const toX = orig?.x ?? v.x;
  const toY = orig?.y ?? v.y;
  const toS = orig?.sx ?? v.scale.x;
  const toZ = orig?.z ?? 0;

  // Animation setup
  const fromX = v.x;
  const fromY = v.y;
  const fromS = v.scale.x;
  const durationMs = 250;

  let elapsed = 0;
  const tick = (delta: number) => {
    elapsed += (1000 / 60) * delta;
    const t = Math.min(1, elapsed / durationMs);
    const e = this.easeOutCubic(t);

    v.position.set(
      fromX + (toX - fromX) * e,
      fromY + (toY - fromY) * e
    );
    const s = fromS + (toS - fromS) * e;
    v.scale.set(s, s);

    if (t >= 1) {
      app.ticker.remove(tick);

      // Restore z-index and state
      v.zIndex = toZ;
      zoomed.zoomState = 'idle';

      // Restore others
      const sprites = this.getSprites();
      for (const s of sprites) {
        if (s === zoomed) continue;
        const sv = s.view;
        sv.alpha = 1;
        sv.eventMode = "static"; // re-enable interaction
      }

      // Clear current zoomed and temp metadata
      this.setCurrentZoomed(null);
      // @ts-expect-error
      v.__orig = undefined;
    }
  };

  app.ticker.add(tick);
}


  private flipEntity(entity: SpriteEntity, ms = 260) {
    const flipping = this.flippingRef.current;
    if (flipping.has(entity)) return;
    flipping.add(entity);

    // Cancel any zoom animation and normalize scale first
    const cancel = this.hoverAnimRef.current.get(entity);
    if (cancel) {
      cancelAnimationFrame(cancel);
      this.hoverAnimRef.current.delete(entity);
    }

    const view = entity.view;
    view.scale.set(1, 1); // normalize scale before flip
    entity.zoomState = "normal"; // Reset zoom state

    const start = performance.now();
    const half = ms * 0.5;
    let swapped = false;

    const step = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / ms);

      // 1 → 0 → 1
      const scaleX = t < 0.5 ? 1 - t / 0.5 : (t - 0.5) / 0.5;
      view.scale.x = Math.max(0.0001, scaleX);

      if (!swapped && elapsed >= half) {
        entity.isFaceUp = !entity.isFaceUp; // ticker handles visibility
        swapped = true;
      }

      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        view.scale.x = 1;
        flipping.delete(entity);
      }
    };

    requestAnimationFrame(step);
  }
}
