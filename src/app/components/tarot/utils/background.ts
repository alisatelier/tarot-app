export function bgPath(colorway: "pink" | "grey", w: number, h: number) {
  const variant = w >= h ? "Desktop" : "Mobile"; // Capitalized
  const tone = colorway === "pink" ? "Pink" : "Grey"; // Capitalized
  return `/cards/canvas/${tone}-${variant}.png`;
}