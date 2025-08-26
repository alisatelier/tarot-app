import * as PIXI from "pixi.js";
import Matter from "matter-js";
import type React from "react";
import type { MutableRefObject } from "react";
import {
  pickCardsDeterministic,
  getSeed,
  type CardPick,
} from "../utils/cardPicking";
import { ALL_CARD_IDS } from "../useTarotStore";
import {
  frontSrcFor,
  backSrcFor,
  type Colorway,
} from "../../../../lib/tarot/cards";
import { computeSpawnPoint } from "../interfaces/deal.spawn";
import { preScaleEntityForProfile } from "../interfaces/ResponsiveSizing";
import { type Target, tweenCardToTarget } from "./cardTween";
import { computeHoroscopeTargets } from "../layouts/horoscope";
import { applyLayoutOverrides } from "../interfaces/layout.overrides";
import { pickProfile } from "../interfaces/profile.registry";
import type { SpriteEntity } from "../utils/types";

const { Bodies, Composite } = Matter;

// Types for spread and assignment
export interface SpreadSlot {
  idKey: string;
  xPerc: number;
  yPerc: number;
  angle?: number;
  cardLabel?: string;
}

export interface Spread {
  id: string;
  slots: SpreadSlot[];
}

export interface CardAssignment {
  slotKey: string;
  cardId: string;
  reversed: boolean;
}

export interface DealToSpreadParams {
  // Core refs
  appRef: React.MutableRefObject<PIXI.Application | null>;
  engineRef: React.MutableRefObject<any | null>; // Matter.Engine
  spritesRef: React.MutableRefObject<SpriteEntity[]>;
  profileRef: React.MutableRefObject<any | null>; // TarotInterfaceProfile
  baseCardScaleRef: React.MutableRefObject<number>;
  currentZoomedCardRef: React.MutableRefObject<SpriteEntity | null>;
  hoverAnimRef: React.MutableRefObject<Map<SpriteEntity, number>>;

  // Background refs
  bgRef: React.MutableRefObject<PIXI.Sprite | null>;
  gradientRef: React.MutableRefObject<PIXI.Sprite | null>;
  usingGradientRef: React.MutableRefObject<boolean>;
  gradientFromRef: React.MutableRefObject<number>;
  gradientToRef: React.MutableRefObject<number>;

  // Current spread and state
  spread: Spread;
  colorway: Colorway;

  // State setters
  setDealing: (dealing: boolean) => void;
  setSeed: (seed: string) => void;
  setAssignments: (assignments: CardAssignment[]) => void;

  // Interactions
  interactions: React.MutableRefObject<any | null>; // CardInteractions

}

export function drawGradientBg(
  app: PIXI.Application,
  from: number,
  to: number,
  gradientRef: MutableRefObject<PIXI.Sprite | null>
) {
  if (gradientRef.current) {
    app.stage.removeChild(gradientRef.current);
    gradientRef.current.destroy(true);
    gradientRef.current = null;
  }

  const w = app.renderer.width;
  const h = app.renderer.height;

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, "#" + from.toString(16).padStart(6, "0"));
  grad.addColorStop(1, "#" + to.toString(16).padStart(6, "0"));
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  const tex = PIXI.Texture.from(canvas);
  const sprite = new PIXI.Sprite(tex);
  sprite.width = w;
  sprite.height = h;
  sprite.alpha = 0;
  app.stage.addChildAt(sprite, 0);

  const fade = () => {
    sprite.alpha = Math.min(1, sprite.alpha + 0.06);
    if (sprite.alpha >= 1) app.ticker.remove(fade);
  };
  app.ticker.add(fade);

  gradientRef.current = sprite;
}

function ensureLabelLayer(app: PIXI.Application): PIXI.Container {
  // Reuse one layer across deals; attach to stage to avoid prop-drilling
  const stageAny = app.stage as any;
  if (!stageAny.__labelLayer) {
    const layer = new PIXI.Container();
    layer.zIndex = 9999; // above cards
    app.stage.addChild(layer);
    stageAny.__labelLayer = layer;
  } else if (!stageAny.__labelLayer.parent) {
    // if it was removed by cleanup, add back
    app.stage.addChild(stageAny.__labelLayer);
  }
  return stageAny.__labelLayer as PIXI.Container;
}

/**
 * Modular function to deal cards to a spread
 * Handles all the logic for creating, positioning, and animating cards
 */
export async function dealToSpread(params: DealToSpreadParams): Promise<void> {
  const {
    appRef,
    engineRef,
    spritesRef,
    profileRef,
    baseCardScaleRef,
    currentZoomedCardRef,
    hoverAnimRef,
    bgRef,
    gradientRef,
    usingGradientRef,
    gradientFromRef,
    gradientToRef,
    spread,
    colorway,
    setDealing,
    setSeed,
    setAssignments,
    interactions,
  } = params;

  // Validation
  if (!appRef.current || !engineRef.current) return;
  if (ALL_CARD_IDS.length === 0) {
    console.error("[Tarot] No cards found.");
    alert("No cards found. Please add cards to your deck.");
    return;
  }

  // Setup background
  usingGradientRef.current = true;
  gradientFromRef.current = 0x000000;
  gradientToRef.current = 0x535b73;

  const pixiApp = appRef.current;

  // Prepare / clear the label layer for this deal
  const labelLayer = ensureLabelLayer(pixiApp);
  labelLayer.removeChildren(); // remove previous labels

  // Remove existing background
  if (bgRef.current) {
    pixiApp.stage.removeChild(bgRef.current);
    bgRef.current.destroy(true);
    bgRef.current = null;
  }

  drawGradientBg(
    pixiApp,
    gradientFromRef.current,
    gradientToRef.current,
    gradientRef
  );

  setDealing(true);
  currentZoomedCardRef.current = null;

  // Clean up previous cards
  for (const sprite of spritesRef.current) {
    const cancel = hoverAnimRef.current.get(sprite);
    if (cancel) cancelAnimationFrame(cancel);
    hoverAnimRef.current.delete(sprite);

    sprite.view.mask = null;
    sprite.view.destroy({ children: true });
    Composite.remove(engineRef.current.world, sprite.body);
  }
  spritesRef.current = [];

  // Generate new card assignments
  const seedStr = getSeed();
  setSeed(seedStr);
  const picks = pickCardsDeterministic(seedStr, spread.slots.length);

  const newAssignments: CardAssignment[] = picks.map(
    (p: CardPick, i: number) => ({
      slotKey: spread.slots[i].idKey,
      cardId: p.id,
      reversed: p.reversed,
    })
  );
  setAssignments(newAssignments);

  // Preload textures
  const urlsToLoad = [
    backSrcFor(colorway),
    ...newAssignments.map((a) => frontSrcFor(a.cardId, colorway)),
  ];
  await PIXI.Assets.load(urlsToLoad);

  // Create cards
  const defaultCardW = 200;
  const defaultCardH = 300;

  // Compute spawn point
  const { x: spawnX, y: spawnY } = computeSpawnPoint(
    pixiApp,
    defaultCardH,
    0.9
  );

  // Create sprite entities
  for (let i = 0; i < spread.slots.length; i++) {
    const { slotKey, cardId, reversed } = newAssignments[i];

    // Create physics body
    const body = Bodies.rectangle(spawnX, spawnY, defaultCardW, defaultCardH, {
      frictionAir: 0.16,
      isSensor: true,
      collisionFilter: { group: -1, category: 0, mask: 0 },
    });
    Composite.add(engineRef.current.world, body);

    // Create PIXI container and sprites
    const corner = Math.min(defaultCardW, defaultCardH) * 0.12;
    const view = new PIXI.Container();
    view.zIndex = 100 + i * 3;
    view.eventMode = "static";
    view.cursor = "pointer";
    pixiApp.stage.addChild(view);
    view.position.set(spawnX, spawnY);

    // Create front and back textures
    const frontTex = PIXI.Texture.from(frontSrcFor(cardId, colorway));
    frontTex.source.scaleMode = "linear";
    const backTex = PIXI.Texture.from(backSrcFor(colorway));
    backTex.source.scaleMode = "linear";

    const front = new PIXI.Sprite(frontTex);
    const back = new PIXI.Sprite(backTex);

    // Configure sprites
    front.anchor.set(0.5);
    back.anchor.set(0.5);
    front.width = defaultCardW;
    front.height = defaultCardH;
    back.width = defaultCardW;
    back.height = defaultCardH;

    view.addChild(front);
    view.addChild(back);

    front.visible = false;
    back.visible = true;

    // Create rounded mask
    const clip = new PIXI.Graphics();
    clip
      .roundRect(
        -defaultCardW / 2,
        -defaultCardH / 2,
        defaultCardW,
        defaultCardH,
        corner
      )
      .fill(0xffffff);

    view.addChild(clip);
    view.mask = clip;

    // Create entity
    const entity: SpriteEntity = {
      body,
      cardId,
      view,
      front,
      back,
      clip,
      isFaceUp: false,
      reversed,
      slotKey,
      zoomState: "normal",
    };

    // Pre-scale for the active profile
    const activeProfile =
      profileRef.current ?? pickProfile(pixiApp.screen.width);
    const preScale = preScaleEntityForProfile(
      pixiApp,
      entity,
      activeProfile,
      defaultCardW
    );

    // Cache base scale from first card
    if (i === 0) baseCardScaleRef.current = preScale;

    spritesRef.current.push(entity);

    // Create the label for this slot (text only, position set after animation)
    // AFTER spritesRef.current.push(entity);
    const slotMeta = spread.slots.find((s) => s.idKey === slotKey);
    const labelText =
      slotMeta?.cardLabel ?? slotKey.replace(/-/g, " ").toLowerCase();
    const label = new PIXI.Text({
      text: labelText, // Removed TEST marker
      style: new PIXI.TextStyle({
        fontFamily: "Poppins, ui-sans-serif, system-ui, -apple-system",
        fontSize: 14,
        fill: 0xffffff, // Back to white text
        align: "center"
      }),
    });
    label.anchor.set(0.5, 0.5); // Center the label both horizontally and vertically
    label.alpha = 0; // we'll fade this in during the tween
    labelLayer.addChild(label);
    (entity as any).__label = label;

    // keep a reference for later positioning
    // (typed as any to avoid changing SpriteEntity type)
    (entity as any).__label = label;

    // Add click handler
    view.on("pointerdown", (e) => {
      e.stopPropagation();
      if (!interactions.current) return;
      interactions.current.handleCardClick(entity);
    });
  }

  // Calculate target positions
  const W = pixiApp.renderer.width;
  const H = pixiApp.renderer.height;

  let targets: Target[] = [];
  if (spread.id === "horoscope-12") {
    targets = computeHoroscopeTargets(pixiApp);
  } else {
    targets = spread.slots.map((slot) => ({
      x: (slot.xPerc / 100) * W,
      y: (slot.yPerc / 100) * H,
      angle: slot.angle ?? 0,
    }));
  }

  // Apply layout overrides for different screen sizes
  const activeProfile = profileRef.current ?? pickProfile(pixiApp.screen.width);
  targets = applyLayoutOverrides(
    activeProfile,
    spread,
    targets,
    pixiApp,
    0.05 // rowGapVH
  );

  // Animate cards to their positions
  for (let i = 0; i < spritesRef.current.length; i++) {
    const entity = spritesRef.current[i];
    const target = targets[i];
    await tweenCardToTarget(entity, target, {
      ms: 650,
      onBegin: (e) => {
        const lbl = (e as any).__label as PIXI.Text | undefined;
        if (lbl) lbl.alpha = 0; // start hidden
      },
      onUpdate: (e, t) => {
        const lbl = (e as any).__label as PIXI.Text | undefined;
        if (!lbl) return;
        const { x, y } = e.body.position;
        lbl.x = x;
        lbl.y = y + e.front.height / 2 - 20; // Much closer during animation
        lbl.rotation = 0;

        // fade in after the card has moved a little (nice feel)
        if (t >= 0.15 && lbl.alpha < 1) {
          // simple eased fade-in between 0.15 → 0.35 progress
          const p = Math.min(1, (t - 0.15) / 0.2);
          lbl.alpha = p;
        }
      },
      onComplete: (e) => {
        const lbl = (e as any).__label as PIXI.Text | undefined;
        if (lbl) {
          lbl.alpha = 1;
          // one last snap in case of rounding
          const { x, y } = e.body.position;
          lbl.x = x;
          lbl.y = y + e.front.height / 2 - 20; // Much closer below the card
        }
      },
    });
  }

  // Position labels under their cards now that bodies are at rest
  for (const entity of spritesRef.current) {
    const lbl = (entity as any).__label as PIXI.Text | undefined;
    if (!lbl) continue;
    const { x, y } = entity.body.position;
    lbl.x = x;
    lbl.y = y + entity.front.height / 2 - 20; // Match the dealing distance
    lbl.rotation = 0;
    lbl.alpha = 1; // reveal
  }

  setDealing(false);
}

/**
 * Repositions all labels relative to their card positions.
 * Call this after window resize or card rescaling.
 */
export function repositionLabels(spritesRef: React.MutableRefObject<SpriteEntity[]>) {
  // Only reposition if we have sprites and they have labels
  if (!spritesRef.current || spritesRef.current.length === 0) {
    return;
  }

  for (const entity of spritesRef.current) {
    const lbl = (entity as any).__label as PIXI.Text | undefined;
    if (!lbl || !entity.body || !entity.front) continue;
    
    const { x, y } = entity.body.position;
    lbl.x = x;
    lbl.y = y + entity.front.height / 2 - 20; // Much closer - reduced from -5 to -20
    lbl.rotation = 0;
  }
}
