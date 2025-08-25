import Matter from "matter-js";

const { Body } = Matter;

// Types
export type Target = { x: number; y: number; angle?: number };

export interface SpriteEntity {
  body: any; // Matter.Body
  cardId: string;
  view: any; // PIXI.Container
  front: any; // PIXI.Sprite
  back: any; // PIXI.Sprite
  clip: any; // PIXI.Graphics
  isFaceUp: boolean;
  reversed: boolean;
  slotKey: string;
  zoomState: "normal" | "zoomed";
}

/**
 * Smoothly animates a card from its current position to a target position
 * @param entity The sprite entity to animate
 * @param target The target position and rotation
 * @param ms Animation duration in milliseconds
 * @returns Promise that resolves when animation completes
 */
export const tweenCardToTarget = (
  entity: SpriteEntity,
  target: Target,
  ms = 700
): Promise<void> =>
  new Promise<void>((resolve) => {
    const body = entity.body;
    const start = performance.now();
    const sx = body.position.x;
    const sy = body.position.y;
    const sa = body.angle;
    const ta = target.angle ?? sa;

    const step = (now: number) => {
      const t = Math.min(1, (now - start) / ms);
      // Ease-in-out cubic animation
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      
      Body.setPosition(body, {
        x: sx + (target.x - sx) * ease,
        y: sy + (target.y - sy) * ease,
      });
      Body.setAngle(body, sa + (ta - sa) * ease);

      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        // Stop all movement when animation completes
        Body.setVelocity(body, { x: 0, y: 0 });
        Body.setAngularVelocity(body, 0);
        Body.setStatic(body, true);
        resolve();
      }
    };
    
    requestAnimationFrame(step);
  });
