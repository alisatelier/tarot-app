import * as PIXI from "pixi.js";
import { SpriteEntity } from "./types";

/**
 * Utility for positioning card labels consistently across the app
 */
export class LabelPositioning {
  /**
   * Position a label for a card entity based on spread type and profile
   */
  static positionLabel(
    entity: SpriteEntity,
    spreadId: string | undefined,
    isMobile: boolean,
    spacing: number = 5,
  ): void {
    const lbl = (entity as any).__label as PIXI.Text | undefined;
    if (!lbl || !entity.body || !entity.front || !entity.view) return;

    // Use the visual card position instead of physics body center
    // This accounts for any transformations or anchoring applied to the visual representation
    const x = entity.view.position.x;
    const y = entity.view.position.y;
    const scale = entity.view.scale.x || 1;
    
    // Check if this should be a side label (mobile + specific spreads)
    const needsSideLabels = isMobile && 
      (spreadId === "ppf" || spreadId === "pphao" || spreadId === "gsbbl");
    
    if (needsSideLabels) {
      // Side label: right of card, center vertically
      const actualCardWidth = entity.front.width * scale;
      lbl.x = x + actualCardWidth / 2 + spacing;
      lbl.y = y + 0;
    } else {
      // Bottom label: below card, use actual scaled dimensions
      const actualCardHeight = entity.front.height * scale;
      lbl.x = x;
      lbl.y = y + actualCardHeight / 2 + spacing + 10;
    }
    
    lbl.rotation = 0;
  }

  /**
   * Position all labels for an array of entities
   */
  static positionAllLabels(
    entities: SpriteEntity[],
    spreadId: string | undefined,
    isMobile: boolean,
    spacing: number = 5,
    verticalOffset: number = 0
  ): void {
    for (const entity of entities) {
      this.positionLabel(entity, spreadId, isMobile, spacing);
    }
  }

  /**
   * Check if a spread should use side labels on mobile
   */
  static shouldUseSideLabels(spreadId: string | undefined, isMobile: boolean): boolean {
    return isMobile && (spreadId === "ppf" || spreadId === "pphao" || spreadId === "gsbbl");
  }
}
