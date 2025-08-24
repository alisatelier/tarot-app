import type { TarotInterfaceProfile } from "./types";
import { fitScaleToScreen } from "./types";

/** Create a profile without using `this` inside methods. */
export function makeProfile(cfg: {
  id: "mobile" | "tablet" | "desktop";
  baseWidthRel: number;
  zoomPadding: number;
  zoomOverscale?: number;
  matches: (w: number) => boolean;
}): TarotInterfaceProfile {
  return {
    ...cfg,
    computeZoomScale(app, entity) {
      return fitScaleToScreen(
        app,
        entity.view,
        cfg.zoomPadding,
        cfg.zoomOverscale ?? 1
      );
    },
  };
}
