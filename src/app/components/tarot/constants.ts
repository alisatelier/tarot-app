import type { Win } from "./types";

// Windows for 5‑card spreads (two rows, 3 on top and 2 below)
export const WINDOWS_5: Win[] = [
  // top row (3)
  { x: 18, y: 18, w: 14, h: 26 }, // #1 (left top)
  { x: 43, y: 18, w: 14, h: 26 }, // #2 (center top)
  { x: 68, y: 18, w: 14, h: 26 }, // #3 (right top)
  // bottom row (2)
  { x: 30, y: 54, w: 14, h: 26 }, // #4 (left bottom)
  { x: 56, y: 54, w: 14, h: 26 }, // #5 (right bottom)
];

// Windows for 3‑card spreads (straight line)
export const WINDOWS_3: Win[] = [
  { x: 43, y: 20, w: 14, h: 26 }, // #1 left
  { x: 20, y: 55, w: 14, h: 26 }, // #2 center
  { x: 66, y: 55, w: 14, h: 26 }, // #3 right
];

export function windowCenterTarget(win: Win, W: number, H: number) {
  const cx = ((win.x + win.w / 2) / 100) * W;
  const cy = ((win.y + win.h / 2) / 100) * H;
  return { x: cx, y: cy, angle: 0 };
}

export function zoomScaleTarget() {
  const w = window.innerWidth;
  if (w < 560) return 2.0; // phones
  if (w < 1024) return 2.5; // tablets
  return 3.0; // desktop
}

// Choose desktop vs mobile image by current renderer size
export function bgPath(colorway: "pink" | "grey", w: number, h: number) {
  const variant = w >= h ? "Desktop" : "Mobile"; // Capitalized
  const tone = colorway === "pink" ? "Pink" : "Grey"; // Capitalized
  return `/cards/canvas/${tone}-${variant}.png`;
}
