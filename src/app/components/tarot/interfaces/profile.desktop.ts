import { makeProfile } from "./profile.util";

export const DesktopProfile = makeProfile({
  id: "desktop",
  baseWidthRel: 0.18,
  zoomPadding: 32,
  zoomOverscale: 1.0,
  matches: (w) => w > 1180,
});
