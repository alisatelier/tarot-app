import type * as PIXI from "pixi.js";
import type { TarotInterfaceProfile } from "./types";
import type { Spread } from "../lib/spreads";

// Reuse the same shape TarotCanvas uses for layout targets
export type Target = { x: number; y: number; angle?: number };

/**
 * Tablet-only spacing bump for 5-card spread.
 * rowGapVH = fraction of screen height to separate the two rows.
 */
export function applyLayoutOverrides(
  profile: TarotInterfaceProfile,
  spread: Spread,
  targets: Target[],
  app: PIXI.Application,
  rowGapVH = 0.05
): Target[] {
  if (profile.id === "tablet" && spread.id === "path-a-vs-b") {
    const H = app.renderer.height;
    const gap = H * rowGapVH;
    const pad = Math.max(8, H * 0.04);
    return targets.map((t, i) => {
      if (i === 0) {
        // focus stays a bit higher
        return { ...t, y: Math.max(pad, t.y - gap) };
      }
      return { ...t, y: Math.min(H - pad, t.y + gap) };
    });
  }

  // Mobile override: Path A vs B custom layout
  if (profile.id === "mobile" && spread.id === "path-a-vs-b" && app) {
    const W = app.renderer.width,
      H = app.renderer.height;
    const map = {
      focus: { x: W * 0.5, y: H * 0.2 },
      prosA: { x: W * 0.3, y: H * 0.52 },
      prosB: { x: W * 0.7, y: H * 0.52 },
      consA: { x: W * 0.3, y: H * 0.78 },
      consB: { x: W * 0.7, y: H * 0.78 },
    } as Record<string, { x: number; y: number }>;

    // Get profile-specific slots for proper key mapping
    const profileSlots = profile.getSlotsForSpread(spread);

    return targets.map((t, i) => {
      const key = profileSlots[i]?.idKey;
      const m = map[key];
      return m ? { ...t, x: m.x, y: m.y } : t;
    });
  }

  // Mobile override: Horoscope 12 as 3 × 4 grid
  if (profile.id === "mobile" && spread.id === "horoscope-12" && app) {
    const W = app.renderer.width,
      H = app.renderer.height;
    const xs = [W * 0.25, W * 0.5, W * 0.75];
    const ys = [H * 0.25, H * 0.42, H * 0.59, H * 0.76];
    const remap = Array.from({ length: 12 }, (_, i) => ({
      x: xs[i % 3],
      y: ys[Math.floor(i / 3)],
    }));
    return targets.map((t, i) => ({ ...t, x: remap[i].x, y: remap[i].y }));
  }

  // No change for other profiles/spreads
  return targets;
}
