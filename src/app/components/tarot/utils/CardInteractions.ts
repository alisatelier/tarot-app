import * as PIXI from "pixi.js";
import type { SpriteEntity } from "./types";
import type { TarotInterfaceProfile } from "../interfaces/types";

type Getter<T> = () => T;
type Setter<T> = (v: T) => void;

export class CardInteractions {
  private getHoverAnim: Getter<Map<SpriteEntity, number>>;
  private getFlipping: Getter<Set<SpriteEntity>>;
  private getCurrentZoomed: Getter<SpriteEntity | null>;
  private setCurrentZoomed: Setter<SpriteEntity | null>;
  private getApp: Getter<PIXI.Application | null>;
  private getSprites: Getter<SpriteEntity[]>;
  private getBaseScale: Getter<number>;
  private getProfile: Getter<TarotInterfaceProfile>;

  constructor(
    getHoverAnim: Getter<Map<SpriteEntity, number>>,
    getFlipping: Getter<Set<SpriteEntity>>,
    getCurrentZoomed: Getter<SpriteEntity | null>,
    setCurrentZoomed: Setter<SpriteEntity | null>,
    getApp: Getter<PIXI.Application | null>,
    getSprites: Getter<SpriteEntity[]>,
    getBaseScale: Getter<number>,
    getProfile: Getter<TarotInterfaceProfile>
  ) {
    this.getHoverAnim = getHoverAnim;
    this.getFlipping = getFlipping;
    this.getCurrentZoomed = getCurrentZoomed;
    this.setCurrentZoomed = setCurrentZoomed;
    this.getApp = getApp;
    this.getSprites = getSprites;
    this.getBaseScale = getBaseScale;
    this.getProfile = getProfile;
  }

  private easeOutCubic(t: number) {
    return 1 - Math.pow(1 - t, 3);
  }

  handleCardClick(entity: SpriteEntity) {
    if (this.getFlipping().has(entity)) return;

    const zoomed = this.getCurrentZoomed();
    if (!entity.isFaceUp) {
      this.flipEntity(entity, 260);
      return;
    }

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

    // optional: swap focus
    this.unzoomCurrent();
    this.zoomToCard(entity, true);
    this.setCurrentZoomed(entity);
  }

  private hideOtherCards(zoomedEntity: SpriteEntity, ms = 300) {
    // Hide all other cards
    for (const entity of this.getSprites()) {
      if (entity === zoomedEntity) continue;
      const v = entity.view;
      v.eventMode = "none";
      const from = v.alpha,
        to = 0;
      if (from === to) continue;
      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / ms);
        v.alpha = from + (to - from) * this.easeOutCubic(t);
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }

    // Hide the entire label layer to prevent labels from showing behind/around the zoomed card
    const app = this.getApp();
    if (app) {
      const stageAny = app.stage as any;
      const labelLayer = stageAny.__labelLayer as PIXI.Container | undefined;
      if (labelLayer) {
        const labelFrom = labelLayer.alpha;
        const labelTo = 0;
        if (labelFrom !== labelTo) {
          const labelStart = performance.now();
          const labelStep = (now: number) => {
            const t = Math.min(1, (now - labelStart) / ms);
            labelLayer.alpha = labelFrom + (labelTo - labelFrom) * this.easeOutCubic(t);
            if (t < 1) requestAnimationFrame(labelStep);
          };
          requestAnimationFrame(labelStep);
        }
      }
    }
  }

  public showAllCards(ms = 300) {
    // Show all cards
    for (const entity of this.getSprites()) {
      const v = entity.view;
      v.eventMode = "static";
      const from = v.alpha,
        to = 1;
      if (from === to) continue;
      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / ms);
        v.alpha = from + (to - from) * this.easeOutCubic(t);
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }

    // Show the entire label layer
    const app = this.getApp();
    if (app) {
      const stageAny = app.stage as any;
      const labelLayer = stageAny.__labelLayer as PIXI.Container | undefined;
      if (labelLayer) {
        const labelFrom = labelLayer.alpha;
        const labelTo = 1;
        if (labelFrom !== labelTo) {
          const labelStart = performance.now();
          const labelStep = (now: number) => {
            const t = Math.min(1, (now - labelStart) / ms);
            labelLayer.alpha = labelFrom + (labelTo - labelFrom) * this.easeOutCubic(t);
            if (t < 1) requestAnimationFrame(labelStep);
          };
          requestAnimationFrame(labelStep);
        }
      }
    }
  }

  zoomToCard(entity: SpriteEntity, zoomIn: boolean, ms = 400) {
    const app = this.getApp();
    if (!app) return;

    const animMap = this.getHoverAnim();
    const prev = animMap.get(entity);
    if (prev) cancelAnimationFrame(prev);

    const v = entity.view;
    // Ensure uniform scale before computing zoom target
    if (Math.abs(v.scale.x - v.scale.y) > 1e-4) {
      const s = Math.max(v.scale.x, v.scale.y);
      v.scale.set(s, s);
    }

    const fromS = v.scale.x,
      fromX = v.x,
      fromY = v.y;

    let toS = fromS,
      toX = fromX,
      toY = fromY;
    if (zoomIn) {
      toS = this.getProfile().computeZoomScale(app, entity);
      toX = app.screen.width / 2;
      toY = app.screen.height / 2;
      entity.zoomState = "zoomed";
    } else {
      const base = this.getBaseScale();
      toS = base;
      toX = entity.body.position.x;
      toY = entity.body.position.y;
      entity.zoomState = "normal";
    }

    const start = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / ms);
      const e = this.easeOutCubic(t);
      v.scale.set(fromS + (toS - fromS) * e);
      v.position.set(fromX + (toX - fromX) * e, fromY + (toY - fromY) * e);
      if (t < 1) raf = requestAnimationFrame(step);
      else animMap.delete(entity);
    };
    raf = requestAnimationFrame(step);
    animMap.set(entity, raf);

    if (zoomIn) {
      v.zIndex = 999999;
      v.parent && v.parent.setChildIndex(v, v.parent.children.length - 1);
      this.hideOtherCards(entity);
    } else {
      v.zIndex = 100;
      this.showAllCards();
    }
  }

  unzoomCurrent() {
    const app = this.getApp();
    const zoomed = this.getCurrentZoomed();
    if (!app || !zoomed) return;

    // Animate back to base scale & body position (CardCanvas ticker handles rotation/visibility)
    this.zoomToCard(zoomed, false, 250);
  }

  private flipEntity(entity: SpriteEntity, ms = 260) {
    const flipping = this.getFlipping();
    if (flipping.has(entity)) return;
    flipping.add(entity);

    const animMap = this.getHoverAnim();
    const cancel = animMap.get(entity);
    if (cancel) {
      cancelAnimationFrame(cancel);
      animMap.delete(entity);
    }

    const base = this.getBaseScale();
    const view = entity.view;
    // Start from a clean, uniform scale
    view.scale.set(base, base);
    entity.zoomState = "normal";

    const start = performance.now();
    const half = ms * 0.5;
    let swapped = false;

    const step = (now: number) => {
      const t = Math.min(1, (now - start) / ms);
      // 1 → 0 → 1 along X, keep Y constant = base
      const sxUnit = t < 0.5 ? 1 - t / 0.5 : (t - 0.5) / 0.5;
      view.scale.x = Math.max(0.0001, sxUnit) * base;
      view.scale.y = base; // 👈 lock Y so zoom doesn't read a “skinny” state

      if (!swapped && now - start >= half) {
        entity.isFaceUp = !entity.isFaceUp;
        swapped = true;
      }

      if (t < 1) requestAnimationFrame(step);
      else {
        // End perfectly uniform
        view.scale.set(base, base);
        flipping.delete(entity);
      }
    };

    requestAnimationFrame(step);
  }
}
