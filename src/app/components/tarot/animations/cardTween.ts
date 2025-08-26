// cardTween.ts
import Matter from "matter-js";
const { Body } = Matter;

// Import or define SpriteEntity type
import type { SpriteEntity } from "../utils/types";

// Define Target type
export type Target = {
  x: number;
  y: number;
  angle?: number;
};

export type TweenOptions = {
  ms?: number;
  ease?: (t: number) => number;
  onBegin?: (entity: SpriteEntity) => void;
  onUpdate?: (entity: SpriteEntity, t: number) => void;     // 0..1
  onComplete?: (entity: SpriteEntity) => void;
};

// Keep your existing exports/imports...
export const tweenCardToTarget = (
  entity: SpriteEntity,
  target: Target,
  msOrOpts: number | TweenOptions = 700
) =>
  new Promise<void>((resolve) => {
    const opts: TweenOptions =
      typeof msOrOpts === "number" ? { ms: msOrOpts } : msOrOpts;

    const ms = opts.ms ?? 700;
    const ease =
      opts.ease ??
      ((t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t));

    const body = entity.body;
    const start = performance.now();
    const sx = body.position.x;
    const sy = body.position.y;
    const sa = body.angle;
    const ta = target.angle ?? sa;

    opts.onBegin?.(entity);

    const step = (now: number) => {
      const t = Math.min(1, (now - start) / ms);
      const k = ease(t);

      Body.setPosition(body, {
        x: sx + (target.x - sx) * k,
        y: sy + (target.y - sy) * k,
      });
      Body.setAngle(body, sa + (ta - sa) * k);

      opts.onUpdate?.(entity, t);

      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        Body.setVelocity(body, { x: 0, y: 0 });
        Body.setAngularVelocity(body, 0);
        Body.setStatic(body, true);
        opts.onComplete?.(entity);
        resolve();
      }
    };
    requestAnimationFrame(step);
  });
