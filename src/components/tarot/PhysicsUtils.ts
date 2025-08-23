import { Bodies, Composite, Body } from "matter-js";
import type { SpriteEntity } from "./types";

/**
 * Physics utilities for deck and card management
 */
export class PhysicsUtils {
  static createDeckBody(x: number, y: number, width: number, height: number): Body {
    return Bodies.rectangle(x, y, width, height, {
      isStatic: true,
      render: { fillStyle: "#333333" },
    });
  }

  static animateDealing(
    sprites: SpriteEntity[],
    engine: any,
    deckPosition: { x: number; y: number },
    onComplete?: () => void
  ) {
    const delayPerCard = 150; // milliseconds between each card deal
    let completedCards = 0;

    sprites.forEach((entity, index) => {
      setTimeout(() => {
        const body = entity.body;
        
        // Apply physics force to move card from deck to target position
        Body.setPosition(body, { x: deckPosition.x, y: deckPosition.y });
        
        // Apply a small random force for natural movement
        const forceX = (Math.random() - 0.5) * 0.1;
        const forceY = (Math.random() - 0.5) * 0.1;
        Body.applyForce(body, (body as any).position, { x: forceX, y: forceY });
        
        completedCards++;
        if (completedCards === sprites.length && onComplete) {
          onComplete();
        }
      }, index * delayPerCard);
    });
  }

  static cleanupSprites(
    sprites: SpriteEntity[],
    engine: any,
    hoverAnimRef: Map<SpriteEntity, number>
  ) {
    for (const s of sprites) {
      const cancel = hoverAnimRef.get(s);
      if (cancel) cancelAnimationFrame(cancel);
      hoverAnimRef.delete(s);

      s.view.mask = null;
      s.view.destroy({ children: true });
      Composite.remove(engine.world, s.body);
    }
  }
}
