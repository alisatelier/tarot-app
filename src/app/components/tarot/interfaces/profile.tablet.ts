import { makeProfile } from "./profile.util";

export const TabletProfile = makeProfile({
  id: "tablet",
  baseWidthRel: 0.13,
  zoomPadding: 24,
  zoomOverscale: 1.0,
  matches: (w) => w > 520 && w <= 1180,
});
