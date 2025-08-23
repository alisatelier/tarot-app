import * as PIXI from "pixi.js";
import type { SpriteEntity } from "./types";

/**
 * Card interaction and animation utilities
 */
export class CardInteractions {
  private hoverAnimRef: React.MutableRefObject<Map<SpriteEntity, number>>;
  private flippingRef: React.MutableRefObject<Set<SpriteEntity>>;
  private currentZoomedCardRef: React.MutableRefObject<SpriteEntity | null>;
  private appRef: React.MutableRefObject<PIXI.Application | null>;
  private spritesRef: React.MutableRefObject<SpriteEntity[]>;

  constructor(
    hoverAnimRef: React.MutableRefObject<Map<SpriteEntity, number>>,
    flippingRef: React.MutableRefObject<Set<SpriteEntity>>,
    currentZoomedCardRef: React.MutableRefObject<SpriteEntity | null>,
    appRef: React.MutableRefObject<PIXI.Application | null>,
    spritesRef: React.MutableRefObject<SpriteEntity[]>
  ) {
    this.hoverAnimRef = hoverAnimRef;
    this.flippingRef = flippingRef;
    this.currentZoomedCardRef = currentZoomedCardRef;
    this.appRef = appRef;
    this.spritesRef = spritesRef;
  }

  handleCardClick = (entity: SpriteEntity) => {
    // If there's already a zoomed card that's not this one, zoom it out first
    const currentZoomed = this.currentZoomedCardRef.current;
    if (currentZoomed && currentZoomed !== entity && currentZoomed.zoomState === 'zoomed') {
      this.zoomToCard(currentZoomed, false);
      this.showAllCards();
      this.currentZoomedCardRef.current = null;
    }
    
    if (!entity.isFaceUp) {
      // First click: Flip to reveal the card
      this.flipEntity(entity, 260);
    } else if (entity.zoomState === 'normal') {
      // Second click: Zoom in and hide other cards
      this.zoomToCard(entity, true);
      this.hideOtherCards(entity);
      this.currentZoomedCardRef.current = entity;
    } else {
      // Third click: Zoom out and show all cards
      this.zoomToCard(entity, false);
      this.showAllCards();
      this.currentZoomedCardRef.current = null;
    }
  };

  handleGlobalClick = (dealing: boolean) => {
    if (dealing) return false; // Block during dealing
    
    // Check if there's a zoomed card - if so, zoom out on ANY click anywhere
    const currentZoomed = this.currentZoomedCardRef.current;
    if (currentZoomed && currentZoomed.zoomState === 'zoomed') {
      this.zoomToCard(currentZoomed, false);
      this.showAllCards();
      this.currentZoomedCardRef.current = null;
      return true; // Handled zoom out
    }
    
    return false; // Continue with normal processing
  };

  private hideOtherCards(zoomedEntity: SpriteEntity, ms = 300) {
    for (const entity of this.spritesRef.current) {
      if (entity === zoomedEntity) continue; // Skip the zoomed card
      
      const v = entity.view;
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

  public zoomToCard(entity: SpriteEntity, zoomIn: boolean, ms = 300) {
    const map = this.hoverAnimRef.current;
    const cancel = map.get(entity);
    if (cancel) cancelAnimationFrame(cancel);

    const v = entity.view;
    const app = this.appRef.current;
    if (!app) return;

    const fromScale = v.scale.x;
    const fromX = v.position.x;
    const fromY = v.position.y;

    let toScale: number;
    let toX: number;
    let toY: number;

    if (zoomIn) {
      // Zoom in: move to exact center and scale up
      toScale = 1.8; // Moderate zoom that fits in canvas
      toX = app.renderer.width / 2;
      toY = app.renderer.height / 2;
      entity.zoomState = 'zoomed';
    } else {
      // Zoom out: return to original position
      const body = entity.body;
      toScale = 1;
      toX = (body as any).position.x;
      toY = (body as any).position.y;
      entity.zoomState = 'normal';
    }

    const cancelId = (() => {
      const start = performance.now();
      let raf = 0;
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / ms);
        const e = 1 - Math.pow(1 - t, 3); // easeOutCubic
        const s = fromScale + (toScale - fromScale) * e;
        const x = fromX + (toX - fromX) * e;
        const y = fromY + (toY - fromY) * e;
        v.scale.set(s, s);
        // Ensure the card's CENTER is positioned at the target coordinates
        v.position.x = x;
        v.position.y = y;
        if (t < 1) raf = requestAnimationFrame(step);
        else {
          // Only remove from animation map if zooming out, keep zoomed cards in map
          if (!zoomIn) {
            map.delete(entity);
          }
        }
      };
      raf = requestAnimationFrame(step);
      return raf;
    })();

    map.set(entity, cancelId);
    
    // Keep zoomed card on top
    if (zoomIn) {
      v.zIndex = 999999;
      if (v.parent) {
        v.parent.setChildIndex(v, v.parent.children.length - 1);
      }
    } else {
      v.zIndex = 100;
    }
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
    entity.zoomState = 'normal'; // Reset zoom state

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
