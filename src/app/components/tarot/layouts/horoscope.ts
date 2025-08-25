import * as PIXI from "pixi.js";

export type Target = { x: number; y: number; angle?: number };

/**
 * Computes target positions for the 12-card horoscope spread
 * Uses a responsive grid: 6x2 on desktop, 3x4 on mobile
 * @param app PIXI application for screen dimensions
 * @returns Array of 12 target positions
 */
export function computeHoroscopeTargets(app: PIXI.Application): Target[] {
  const W = app.renderer.width;
  const H = app.renderer.height;

  const isDesktop = W >= 768;
  const cols = isDesktop ? 6 : 3;
  const rows = isDesktop ? 2 : 4;

  const padX = 8; // Horizontal padding percentage
  const padY = 8; // Vertical padding percentage
  const cellW = (100 - padX * 2) / cols;
  const cellH = (100 - padY * 2) / rows;

  const targets: Target[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (targets.length === 12) break;
      const xPerc = padX + cellW * (c + 0.5);
      const yPerc = padY + cellH * (r + 0.5);
      targets.push({
        x: (xPerc / 100) * W,
        y: (yPerc / 100) * H,
        angle: 0,
      });
    }
  }
  return targets;
}
