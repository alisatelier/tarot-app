import type * as PIXI from "pixi.js";
import type { TarotInterfaceProfile } from "./types";

// Reuse the same shape TarotCanvas uses for layout targets
export type Target = { x: number; y: number; angle?: number };

type SpreadLite = { id: string; slots: unknown[] };

/**
 * Tablet-only spacing bump for 5-card spread.
 * rowGapVH = fraction of screen height to separate the two rows.
 */
export function applyLayoutOverrides(
  profile: TarotInterfaceProfile,
  spread: SpreadLite,
  targets: Target[],
  app: PIXI.Application,
  rowGapVH = 0.05
): Target[] {
  if (profile.id === "tablet" && spread.slots.length === 5) {
    const H = app.renderer.height;
    const gap = H * rowGapVH;
    const pad = Math.max(8, H * 0.04); // keep some margin from top/bottom

    // WINDOWS_5 indexing in your code: 0..2 top row, 3..4 bottom row
    return targets.map((t, i) => {
      let y = t.y;
      if (i <= 2) y = t.y - gap;      // move top row up
      else       y = t.y + gap;      // move bottom row down

      // clamp to keep inside the canvas
      y = Math.max(pad, Math.min(H - pad, y));
      return { ...t, y };
    });
  }

  // No change for other profiles/spreads
  return targets;
}

