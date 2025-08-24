import type { TarotInterfaceProfile } from "./types";
import { MobileProfile } from "./profile.mobile";
import { TabletProfile } from "./profile.tablet";
import { DesktopProfile } from "./profile.desktop";

const ALL: TarotInterfaceProfile[] = [MobileProfile, TabletProfile, DesktopProfile];

export function pickProfile(screenWidth: number): TarotInterfaceProfile {
  for (const p of ALL) if (p.matches(screenWidth)) return p;
  return DesktopProfile;
}
