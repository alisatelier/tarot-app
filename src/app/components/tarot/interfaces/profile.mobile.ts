import { makeProfile } from "./profile.util";

export const MobileProfile = makeProfile({
  id: "mobile",
  baseWidthRel: 0.22,
  zoomPadding: 12, // Reduced padding to allow bigger zoom
  zoomOverscale: 1.2, // Slight overscale for better mobile zoom
  matches: (w) => w <= 520,
});
