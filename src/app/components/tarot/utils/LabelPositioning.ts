import * as PIXI from "pixi.js";
import { SpriteEntity } from "./types";

/**
 * Utility for positioning card labels consistently across the app
 */
export class LabelPositioning {
  // Store locked positions for labels to prevent jumping during flips
  private static lockedPositions = new Map<string, { x: number; y: number }>();
  
  // Cache spawn point coordinates to detect when cards are still clustered
  private static spawnPoint: { x: number; y: number } | null = null;
  
  /**
   * Update the spawn point coordinates (called during deal initialization)
   */
  static setSpawnPoint(x: number, y: number): void {
    this.spawnPoint = { x, y };
  }

  /**
   * Position a label for a card entity based on spread type and profile
   */
  static positionLabel(card: SpriteEntity, spreadId: string | undefined, isMobile: boolean, spacing: number = 5, lockPosition: boolean = true): void {
    const label = (card as any).__label as PIXI.Text | undefined;
    if (!label) {
      return;
    }

    const cardId = card.cardId;
    
   
    // Calculate new position based on the card's current position
    const x = card.view.position.x;
    const y = card.view.position.y;
    const scale = card.view.scale.x || 1;
    
    // Don't lock position if cards are still at spawn point (all stacked)
    // This prevents all labels from getting the same locked position
    // Using larger tolerance (50px) to account for minor positioning variations during animation
    const spawnX = this.spawnPoint?.x ?? 461.5; // fallback to center
    const spawnY = this.spawnPoint?.y ?? 600; // fallback to reasonable spawn point
    const isAtSpawnPoint = Math.abs(x - spawnX) < 50 && Math.abs(y - spawnY) < 50;
    const shouldActuallyLock = lockPosition && !isAtSpawnPoint;
    
    // Check if this should be a side label (mobile + specific spreads)
    const needsSideLabels = isMobile && 
      (spreadId === "ppf" || spreadId === "pphao" || spreadId === "gsbbl");
    
    let labelX: number, labelY: number;
    
    if (needsSideLabels) {
      // Side label: right of card, center vertically
      const actualCardWidth = card.front.width * scale;
      labelX = x + actualCardWidth / 2 + spacing;
      labelY = y + 0;
    } else {
      // Bottom label: below card - use a simple fixed offset instead of complex calculations
      labelX = x;
      labelY = y + 120; // Fixed offset below card (about 100px for card + 20px spacing)
    }
    
    // Apply position
    label.x = labelX;
    label.y = labelY;
    label.rotation = 0;
    
    // TEMPORARILY DISABLE POSITION LOCKING
    // Store locked position only if cards have moved to their final positions
    // if (shouldActuallyLock) {
    //   this.lockedPositions.set(cardId, { x: labelX, y: labelY });
    // }
  }

  /**
   * Position all labels for an array of entities
   */
  static positionAllLabels(
    entities: SpriteEntity[],
    spreadId: string | undefined,
    isMobile: boolean,
    spacing: number = 5,
    lockPosition: boolean = true
  ): void {
    for (const entity of entities) {
      this.positionLabel(entity, spreadId, isMobile, spacing, lockPosition);
    }
  }

  /**
   * Clear locked positions for specific cards or all cards
   */
  static clearLockedPositions(cardIds?: string[]): void {
    if (cardIds) {
      for (const cardId of cardIds) {
        this.lockedPositions.delete(cardId);
      }
    } else {
      this.lockedPositions.clear();
    }
  }

  /**
   * Force recalculation of label position (ignoring lock)
   */
  static forceRecalculateLabel(
    entity: SpriteEntity,
    spreadId: string | undefined,
    isMobile: boolean,
    spacing: number = 5
  ): void {
    // Clear any existing lock for this card
    this.clearLockedPositions([entity.cardId]);
    // Recalculate and lock new position
    this.positionLabel(entity, spreadId, isMobile, spacing, true);
  }

  /**
   * Check if a spread should use side labels on mobile
   */
  static shouldUseSideLabels(spreadId: string | undefined, isMobile: boolean): boolean {
    return isMobile && (spreadId === "ppf" || spreadId === "pphao" || spreadId === "gsbbl");
  }
}
