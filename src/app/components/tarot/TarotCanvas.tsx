"use client";

import { useEffect, useRef, useState, type MutableRefObject } from "react";
import * as PIXI from "pixi.js";
import Matter from "matter-js";
import { useTarotStore } from "./useTarotStore";
import { ALL_CARD_IDS } from "./useTarotStore";

import { CardInteractions } from "./CardInteractions";
import { pickProfile } from "./interfaces/profile.registry";
import type { TarotInterfaceProfile } from "./interfaces/types";
import {
  recomputeAndApplyBaseScaleWithProfile,
  preScaleEntityForProfile,
} from "./ResponsiveSizing";
import { applyLayoutOverrides } from "./interfaces/layout.overrides";
import { computeSpawnPoint } from "./interfaces/deal.spawn";
import {
  QUESTIONS,
  CATEGORIES,
  type CategoryId,
} from "../../../lib/tarot/question";

// Import from lib/tarot
import { mulberry32, hashSeed } from "../../../lib/tarot/rng";
import { saveReading } from "../../../lib/tarot/persistence";
import {
  frontSrcFor,
  backSrcFor,
  type Colorway,
} from "../../../lib/tarot/cards";

const { Engine, Runner, Bodies, Composite, Body } = Matter;

// Types
type Target = { x: number; y: number; angle?: number };
type SpriteEntity = {
  body: any;
  cardId: string;
  view: PIXI.Container;
  front: PIXI.Sprite;
  back: PIXI.Sprite;
  clip: PIXI.Graphics;
  isFaceUp: boolean;
  reversed: boolean;
  slotKey: string;
  zoomState: "normal" | "zoomed";
};

// Constants - removed unused WINDOWS_5, WINDOWS_3, and windowCenterTarget


function bgPath(colorway: "pink" | "grey", w: number, h: number) {
  const variant = w >= h ? "Desktop" : "Mobile";
  const tone = colorway === "pink" ? "Pink" : "Grey";
  return `/cards/canvas/${tone}-${variant}.png`;
}

function coverSpriteTo(app: PIXI.Application, sprite: PIXI.Sprite) {
  const W = app.renderer.width;
  const H = app.renderer.height;
  const texW = sprite.texture.width || 1;
  const texH = sprite.texture.height || 1;
  const scale = Math.max(W / texW, H / texH);
  sprite.scale.set(scale);
  sprite.position.set((W - texW * scale) / 2, (H - texH * scale) / 2);
}

function drawGradientBg(
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

function pickCardsDeterministic(seedStr: string, n: number) {
  const rnd = mulberry32(hashSeed(seedStr));
  const ids = [...ALL_CARD_IDS];
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return ids.slice(0, n).map((id) => ({ id, reversed: rnd() < 0.5 }));
}

function getSeed(): string {
  const url = new URL(window.location.href);
  const s = url.searchParams.get("seed");
  return s || `reading-${Date.now()}`;
}

function computeHoroscopeTargets(app: PIXI.Application): Target[] {
  const W = app.renderer.width;
  const H = app.renderer.height;

  const isDesktop = W >= 768;
  const cols = isDesktop ? 6 : 3;
  const rows = isDesktop ? 2 : 4;

  const padX = 8;
  const padY = 8;
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

export default function TarotCanvas() {
  // Refs
  const containerRef = useRef<HTMLDivElement | null>(null);
  const gradientRef = useRef<PIXI.Sprite | null>(null);
  const usingGradientRef = useRef(false);
  const gradientFromRef = useRef(0x000000);
  const gradientToRef = useRef(0x535b73);
  const bgRef = useRef<PIXI.Sprite | null>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const engineRef = useRef<any>(null);
  const runnerRef = useRef<any>(null);
  const spritesRef = useRef<SpriteEntity[]>([]);
  const deckBodyRef = useRef<any>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const labelLayerRef = useRef<PIXI.Container | null>(null);
  const [seed, setSeed] = useState<string | null>(null);
  const flippingRef = useRef<Set<SpriteEntity>>(new Set());
  const hoverAnimRef = useRef<Map<SpriteEntity, number>>(new Map());
  const currentZoomedCardRef = useRef<SpriteEntity | null>(null);
  const baseCardScaleRef = useRef(1);
  const profileRef = useRef<TarotInterfaceProfile | null>(null);
  const interactions = useRef<CardInteractions | null>(null);
  
  // Background loading state
  const [backgroundReady, setBackgroundReady] = useState(false);
  const backgroundPromiseRef = useRef<Promise<void> | null>(null);

  // Preload background images
  const preloadBackgrounds = async () => {
    if (backgroundPromiseRef.current) {
      return backgroundPromiseRef.current;
    }
    
    backgroundPromiseRef.current = (async () => {
      const backgroundUrls = [
        "/cards/canvas/Pink-Desktop.png",
        "/cards/canvas/Pink-Mobile.png", 
        "/cards/canvas/Grey-Desktop.png",
        "/cards/canvas/Grey-Mobile.png"
      ];
      
      await PIXI.Assets.load(backgroundUrls);
      setBackgroundReady(true);
    })();
    
    return backgroundPromiseRef.current;
  };

  // Store
  const {
    spread,
    assignments,
    setAssignments,
    dealing,
    setDealing,
    question,
    focusText,
    choice1Text,
    choice2Text,
    setQuestion,
    setFocusText,
    setChoice1Text,
    setChoice2Text,
    colorway,
    setColorway,
    updateSpreadsForQuestion,
  } = useTarotStore();

  // Early background preloading effect
  useEffect(() => {
    preloadBackgrounds();
  }, []);

  // PIXI + Matter initialization
  useEffect(() => {
    if (!containerRef.current) return;

    let destroyed = false;

    (async () => {
      const app = new PIXI.Application();
      await app.init({
        backgroundAlpha: 0,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      });

      // Load assets
      await PIXI.Assets.load([
        "/cards/canvas/Pink-Desktop.png",
        "/cards/canvas/Pink-Mobile.png",
        "/cards/canvas/Grey-Desktop.png",
        "/cards/canvas/Grey-Mobile.png",
      ]);

      const cw = useTarotStore.getState().colorway;
      await PIXI.Assets.load([
        backSrcFor("pink"),
        backSrcFor("grey"),
        ...ALL_CARD_IDS.map((id) => frontSrcFor(id, cw)),
      ]);

      if (destroyed) return;

      appRef.current = app;

      profileRef.current = pickProfile(app.screen.width);

      app.stage.eventMode = "static";
      app.stage.hitArea = app.screen;
      app.stage.sortableChildren = true;

      // Create a dedicated overlay layer for labels so they don't rotate with cards
      const labelLayer = new PIXI.Container();
      labelLayer.zIndex = 9999;
      app.stage.addChild(labelLayer);
      labelLayerRef.current = labelLayer;

      if (containerRef.current) {
        containerRef.current.appendChild(app.view as HTMLCanvasElement);
      }

      const canvasEl = app.view as HTMLCanvasElement;
      canvasEl.style.display = "block";
      canvasEl.style.width = "100%";
      canvasEl.style.height = "100%";

      let bgSprite: PIXI.Sprite | null = null;

      const mountOrUpdateBg = async () => {
        if (usingGradientRef.current) return;
        
        // Ensure background images are preloaded
        await preloadBackgrounds();
        
        const w = app.renderer.width;
        const h = app.renderer.height;
        const url = bgPath(useTarotStore.getState().colorway, w, h);

        // Use cached texture since it's preloaded
        const texture = PIXI.Texture.from(url);
        
        if (!bgSprite) {
          bgSprite = new PIXI.Sprite(texture);
          bgSprite.anchor.set(0);
          bgSprite.alpha = 0; // Start transparent for fade in
          app.stage.addChildAt(bgSprite, 0);
          
          // Fade in the PIXI background
          const fadeIn = () => {
            if (bgSprite && bgSprite.alpha < 1) {
              bgSprite.alpha += 0.1;
              if (bgSprite.alpha < 1) {
                requestAnimationFrame(fadeIn);
              }
            }
          };
          requestAnimationFrame(fadeIn);
        } else {
          bgSprite.texture = texture;
        }
        coverSpriteTo(app, bgSprite);
        bgRef.current = bgSprite;
      };

      const ensureBackdrop = () => {
        if (usingGradientRef.current) {
          drawGradientBg(
            app,
            gradientFromRef.current,
            gradientToRef.current,
            gradientRef
          );
        } else {
          mountOrUpdateBg();
        }
      };

      const resize = () => {
        const el = containerRef.current!;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        // 1) Resize the PIXI renderer
        app.renderer.resolution = dpr;
        app.renderer.resize(el.clientWidth, el.clientHeight);

        // 2) Redraw background (yours)
        ensureBackdrop();

        // 3) Select the interface profile based on the NEW width
        const nextProfile = pickProfile(app.screen.width);
        const changed = profileRef.current?.id !== nextProfile.id;
        profileRef.current = nextProfile;

        // 4) Recompute and apply base (non-zoom) card scale for this profile
        //    (safe to call on every resize; it no-ops while a card is zoomed)
        recomputeAndApplyBaseScaleWithProfile(
          appRef,
          spritesRef,
          currentZoomedCardRef,
          baseCardScaleRef,
          nextProfile
        );

        // (optional) If you want to react when the profile bucket changes:
        // if (changed) console.debug("[Tarot] Interface profile:", nextProfile.id);
      };

      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(containerRef.current!);

      const engine = Engine.create({ gravity: { x: 0, y: 0 } });
      engineRef.current = engine;

      const w = app.renderer.width;
      const h = app.renderer.height;
      const t = 100;
      const walls = [
        Bodies.rectangle(w / 2, -t / 2, w, t, { isStatic: true }),
        Bodies.rectangle(w / 2, h + t / 2, w, t, { isStatic: true }),
        Bodies.rectangle(-t / 2, h / 2, t, h, { isStatic: true }),
        Bodies.rectangle(w + t / 2, h / 2, t, h, { isStatic: true }),
      ];
      Composite.add(engine.world, walls);

      const deck = Bodies.rectangle(w * 0.18, h * 0.8, 200, 300, {
        isStatic: true,
      });
      deckBodyRef.current = deck;
      Composite.add(engine.world, deck);

      app.ticker.add(() => {
        for (const s of spritesRef.current) {
          const { x, y } = s.body.position;
          const angle = s.body.angle;

          // Only sync position if not zoomed and not being animated
          if (!hoverAnimRef.current.has(s) && s.zoomState !== "zoomed") {
            s.view.position.set(x, y);
          }

          // Only sync rotation if not zoomed
          if (s.zoomState !== "zoomed") {
            const rot = s.reversed ? angle + Math.PI : angle;
            s.view.rotation = rot;
          }

          s.front.visible = s.isFaceUp;
          s.back.visible = !s.isFaceUp;
          s.clip.position.set(0, 0);
        }
      });

      const runner = Runner.create();
      Runner.run(runner, engine);
      runnerRef.current = runner;

      const cleanup = () => {
        ro.disconnect();
        Runner.stop(runner);
        app.ticker.stop();
        app.stage.removeChildren();
        app.destroy(true);
        spritesRef.current = [];
        engineRef.current = null;
        appRef.current = null;
        runnerRef.current = null;
        deckBodyRef.current = null;
      };
      cleanupRef.current = cleanup;
    })();

    return () => {
      destroyed = true;
      if (cleanupRef.current) cleanupRef.current();
      if (labelLayerRef.current) { labelLayerRef.current.destroy({ children: true }); labelLayerRef.current = null; }
    };
  }, []);

  useEffect(() => {
    interactions.current = new CardInteractions(
      () => hoverAnimRef.current,
      () => flippingRef.current,
      () => currentZoomedCardRef.current,
      (v) => {
        currentZoomedCardRef.current = v;
      },
      () => appRef.current,
      () => spritesRef.current,
      () => baseCardScaleRef.current,
      () => profileRef.current!
    );
  }, []);

  // Deal cards to spread
  async function dealToSpread() {
    if (!appRef.current || !engineRef.current || !deckBodyRef.current) return;
    if (ALL_CARD_IDS.length === 0) {
      console.error("[Tarot] No cards found.");
      alert("No cards found. Please add cards to your deck.");
      return;
    }
    if (dealing) return;

    usingGradientRef.current = true;
    gradientFromRef.current = 0x000000;
    gradientToRef.current = 0x535b73;

      // Clear old labels
    if (labelLayerRef.current) { labelLayerRef.current.removeChildren(); }

    const pixiApp = appRef.current!;

    // Label layer: one container for all card labels (keeps them independent of card rotation)
    if (!(pixiApp.stage as any).__labelLayer) {
      const layer = new PIXI.Container();
      (pixiApp.stage as any).__labelLayer = layer;
      pixiApp.stage.addChild(layer);
    }
    const labelLayer: PIXI.Container = (pixiApp.stage as any).__labelLayer;
    labelLayer.removeChildren();


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
    for (const s of spritesRef.current) {
      const cancel = hoverAnimRef.current.get(s);
      if (cancel) cancelAnimationFrame(cancel);
      hoverAnimRef.current.delete(s);

      s.view.mask = null;
      s.view.destroy({ children: true });
      Composite.remove(engineRef.current!.world, s.body);
    }
    spritesRef.current = [];

    const seedStr = getSeed();
    setSeed(seedStr);
    const picks = pickCardsDeterministic(seedStr, spread.slots.length);

    const newAssignments = picks.map((p, i) => ({
      slotKey: spread.slots[i].idKey,
      cardId: p.id,
      reversed: p.reversed,
    }));
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

    // Compute spawn once per deal (uses current viewport)
    const { x: spawnX, y: spawnY } = computeSpawnPoint(
      pixiApp,
      defaultCardH,
      /* yFactor */ 0.9
    );

    for (let i = 0; i < spread.slots.length; i++) {
      const { slotKey, cardId, reversed } = newAssignments[i];

      const body = Bodies.rectangle(
        spawnX,
        spawnY,
        defaultCardW,
        defaultCardH,
        {
          frictionAir: 0.16,
          isSensor: true,
          collisionFilter: { group: -1, category: 0, mask: 0 },
        }
      );
      Composite.add(engineRef.current!.world, body);

      const corner = Math.min(defaultCardW, defaultCardH) * 0.12;

      const view = new PIXI.Container();
      view.zIndex = 100 + i * 3;
      view.eventMode = "static";
      view.cursor = "pointer";
      pixiApp.stage.addChild(view);

      // Match the PIXI view to the spawn immediately (no 1-frame flicker)
      view.position.set(spawnX, spawnY);

      const frontTex = PIXI.Texture.from(frontSrcFor(cardId, colorway));
      frontTex.source.scaleMode = "linear";

      const backTex = PIXI.Texture.from(backSrcFor(colorway));
      backTex.source.scaleMode = "linear";

      const front = new PIXI.Sprite(frontTex);
      const back = new PIXI.Sprite(backTex);

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
      // 🔖 Add a label under each card to show the spread position (e.g., Past / Present / Future)
      try {
        const slotDef = spread.slots.find(sl => sl.idKey === slotKey);
        const labelText = slotDef?.cardLabel || slotKey
          .replace(/-/g, ' ') // friendlier for e.g. 'past-present-future'
          .toLowerCase();
        const label = new PIXI.Text({
          text: labelText,
          style: new PIXI.TextStyle({
            fontFamily: 'Poppins, ui-sans-serif, system-ui, -apple-system',
            fontSize: 14,
            fill: 0xffffff,
            stroke: 0x000000,
            strokeThickness: 3,
            align: 'center',
            dropShadow: true,
            dropShadowColor: 0x000000,
            dropShadowBlur: 2,
            dropShadowDistance: 1,
          }),
        });
        // position label below the card
        label.anchor.set(0.5, 0);
        label.x = targets[i].x;
        label.y = targets[i].y + (defaultCardH / 2) + 8;
        label.rotation = 0;
        // ensure label is on top of the card sprites
        labelLayerRef.current?.addChild(label);
        // store reference for future scaling with profile
        (view as any).__label = label;
      } catch (e) {
        console.warn('[Tarot] Could not attach label', e);
      }


      // ✅ Pre-size for the active interface profile so there’s no flash on mobile
      const activeProfile =
        profileRef.current ?? pickProfile(pixiApp.screen.width);
      const pre = preScaleEntityForProfile(
        pixiApp,
        entity,
        activeProfile,
        defaultCardW
      );
      
      // Cache the base scale (used when unzooming)
      if (i === 0) baseCardScaleRef.current = pre;

      spritesRef.current.push(entity);

// 🔖 Create label for this slot on the labelLayer
const slotDef = spread.slots.find(sl => sl.idKey === slotKey);
if (slotDef) {
  const labelText = slotDef.cardLabel || slotDef.idKey.replace(/-/g, ' ').toLowerCase();
  const label = new PIXI.Text({
    text: labelText,
    style: new PIXI.TextStyle({
      fontFamily: 'Poppins, ui-sans-serif, system-ui, -apple-system',
      fontSize: 14,
      fill: 0xffffff,
      align: 'center',
    }),
  });
  label.anchor.set(0.5, 0);
  // temp position; will be updated after tween
  label.x = spawnX;
  label.y = spawnY + defaultCardH/2 + 8;
  labelLayer.addChild(label);
  (entity as any).__label = label;
}

      view.on("pointerdown", (e) => {
        e.stopPropagation();
        if (!interactions.current) return;
        interactions.current.handleCardClick(entity);
      });
    }

    // Calculate targets
    const W = pixiApp.renderer.width;
    const H = pixiApp.renderer.height;

    let targets: Target[] = [];
    if (spread.id === "horoscope-12") {
      // Keep the special 6+6 (desktop/tablet) and 3×4 (mobile) logic
      targets = computeHoroscopeTargets(pixiApp);
    } else {
      // Honor the coordinates you hardcoded in spreads.ts
      targets = spread.slots.map((s: any) => ({
        x: (s.xPerc / 100) * W,
        y: (s.yPerc / 100) * H,
        angle: s.angle ?? 0,
      }));
    }

    // Tablet-only extra vertical spacing for 5-card
    const activeProfile =
      profileRef.current ?? pickProfile(pixiApp.screen.width);
    targets = applyLayoutOverrides(
      activeProfile,
      spread,
      targets,
      pixiApp,
      /* rowGapVH */ 0.05
    );

    // Animate cards to positions
    for (let i = 0; i < spritesRef.current.length; i++) {
      const entity = spritesRef.current[i];
      const target = targets[i];
      await tweenCardToTarget(entity, target, 650);
    }

    const profile =
      profileRef.current ?? pickProfile(appRef.current!.screen.width);
    recomputeAndApplyBaseScaleWithProfile(
      appRef,
      spritesRef,
      currentZoomedCardRef,
      baseCardScaleRef,
      profile
    );

    // Update labels after profile scaling
    

    setDealing(false);
  }

  // Tween helper
  const tweenCardToTarget = (entity: SpriteEntity, target: Target, ms = 700) =>
    new Promise<void>((resolve) => {
      const body = entity.body;
      const start = performance.now();
      const sx = body.position.x;
      const sy = body.position.y;
      const sa = body.angle;
      const ta = target.angle ?? sa;

      const step = (now: number) => {
        const t = Math.min(1, (now - start) / ms);
        const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        Body.setPosition(body, {
          x: sx + (target.x - sx) * ease,
          y: sy + (target.y - sy) * ease,
        });
        Body.setAngle(body, sa + (ta - sa) * ease);

// keep label tracking this entity's body position
const lbl = (entity as any).__label as PIXI.Text | undefined;
if (lbl) {
  lbl.x = body.position.x;
  lbl.y = body.position.y + (entity.front.height/2) + 8;
}

        if (t < 1) requestAnimationFrame(step);
        else {
          Body.setVelocity(body, { x: 0, y: 0 });
          Body.setAngularVelocity(body, 0);
          Body.setStatic(body, true);
          const lbl = (entity as any).__label as PIXI.Text | undefined;
          if (lbl) { lbl.x = body.position.x; lbl.y = body.position.y + (entity.front.height/2) + 8; }
          resolve();
        }
      };
      requestAnimationFrame(step);
    });

  // Global click handler
  useEffect(() => {
    const app = appRef.current;
    if (!app) return;

    const onPointer = (e: PIXI.FederatedPointerEvent) => {
      if (interactions.current?.handleGlobalClick(dealing)) return;

      if (dealing) return;

      const currentZoomed = currentZoomedCardRef.current;
      if (currentZoomed && currentZoomed.zoomState === "zoomed") {
        if (interactions.current) {
          interactions.current.zoomToCard(currentZoomed, false);
          interactions.current.showAllCards();
          currentZoomedCardRef.current = null;
        }
        return;
      }

      const pos = e.global;
      for (let i = spritesRef.current.length - 1; i >= 0; i--) {
        const s = spritesRef.current[i];
        const spr = s.isFaceUp ? s.front : s.back;
        if (!spr.visible) continue;
        const b = spr.getBounds();
        if (
          pos.x >= b.x &&
          pos.x <= b.x + b.width &&
          pos.y >= b.y &&
          pos.y <= b.y + b.height
        ) {
          if (interactions.current) {
            interactions.current.handleCardClick(s);
          }
          break;
        }
      }
    };

    app.stage.addEventListener("pointerdown", onPointer);
    return () => app.stage.removeEventListener("pointerdown", onPointer);
  }, [dealing]);

  // Update textures when colorway changes
  useEffect(() => {
    const app = appRef.current;
    if (!app) return;

    for (const s of spritesRef.current) {
      s.front.texture = PIXI.Texture.from(frontSrcFor(s.cardId, colorway));
      s.back.texture = PIXI.Texture.from(backSrcFor(colorway));
    }

    if (!usingGradientRef.current) {
      const bg = bgRef.current;
      if (bg) {
        const w = app.renderer.width;
        const h = app.renderer.height;
        const url = bgPath(colorway, w, h);
        bg.texture = PIXI.Texture.from(url);
        coverSpriteTo(app, bg);
      }
    }
  }, [colorway]);

  // Read colorway from URL
  useEffect(() => {
    const url = new URL(window.location.href);
    const c = url.searchParams.get("colorway") as Colorway | null;
    if (c === "pink" || c === "grey") setColorway(c);
  }, [setColorway]);

  // Save reading
  function saveCurrentReading() {
    if (!seed) return;

    const selectedQ = QUESTIONS.find((q) => q.label === focusText); // <- use spread prompt
    let safeChoice1 = choice1Text;
    let safeChoice2 = choice2Text;

    if (spread.id === "path-a-vs-b" && selectedQ) {
      if (selectedQ.requiresSubDropdown) {
        const allowed = selectedQ.subOptions ?? [];
        if (!allowed.includes(safeChoice1)) safeChoice1 = "";
        if (!allowed.includes(safeChoice2)) safeChoice2 = "";
      } else {
        safeChoice1 = selectedQ.pathA;
        safeChoice2 = selectedQ.pathB;
      }
    }

    saveReading({
      when: new Date().toISOString(),
      spreadId: spread.id,
      seed,
      colorway,
      // 'question' remains the user's personal intention
      question,
      meta: {
        // focus = the chosen A/B prompt
        focus: focusText || selectedQ?.label || undefined,
        choice1: safeChoice1 || undefined,
        choice2: safeChoice2 || undefined,
      },
      cards: useTarotStore.getState().assignments.map((a) => ({
        id: a.cardId,
        reversed: a.reversed,
        slotKey: a.slotKey,
      })),
    });
    alert("Reading saved locally.");
  }

  const isFocusChoiceSpread = spread.id === "path-a-vs-b";

  const [selectedCategory, setSelectedCategory] = useState<CategoryId>(
    CATEGORIES[0].id
  );

  useEffect(() => {
    const current = QUESTIONS.find((q) => q.label === focusText);
    const inCategory = current && current.category === selectedCategory;
    if (!inCategory) {
      const first = QUESTIONS.find((q) => q.category === selectedCategory);
      if (first) {
        setFocusText(first.label);
        updateSpreadsForQuestion(first.label);
        setChoice1Text(first.requiresSubDropdown ? "" : first.pathA);
        setChoice2Text(first.requiresSubDropdown ? "" : first.pathB);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  // Keep Intention blank for all spreads except Pros & Cons.
  // For Pros & Cons, mirror the selected A/B prompt (focusText) and update live.
  useEffect(() => {
    if (spread.id === "path-a-vs-b") {
      setQuestion(focusText || ""); // dynamically follows Category/Question changes
    } else {
      setQuestion(""); // force blank for every other spread
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spread.id, focusText]);

  return (
    <div className="w-full">
      {/* Controls row (Spread first) */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {/* Spread select */}
        <select
          className="px-3 py-2 rounded-xl border"
          value={spread.id}
          onChange={(e) => {
            const all = useTarotStore.getState().allSpreads;
            const next = all.find((s) => s.id === e.target.value)!;
            useTarotStore.getState().setSpread(next);
          }}
        >
          {useTarotStore.getState().allSpreads.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>

        {/* Colorway */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-600">Colorway</span>
          <select
            className="px-3 py-2 rounded-xl border"
            value={colorway}
            onChange={(e) => setColorway(e.target.value as Colorway)}
          >
            <option value="pink">Pink</option>
            <option value="grey">Grey</option>
          </select>
        </div>

        <button
          onClick={dealToSpread}
          className="px-4 py-2 rounded-xl bg-brandnavy text-white hover:bg-brandpink hover:text-black transition"
          disabled={
            // Optional: block pull until A/B chosen for the special case
            (() => {
              if (spread.id !== "path-a-vs-b") return dealing;
              const sel = QUESTIONS.find((q) => q.label === focusText);
              const needsAB = !!sel?.requiresSubDropdown;
              return dealing || (needsAB && (!choice1Text || !choice2Text));
            })()
          }
        >
          {dealing ? "Pulling..." : "Pull Spread"}
        </button>

        <button
          onClick={saveCurrentReading}
          className="px-4 py-2 rounded-xl border hover:bg-neutral-100 transition"
        >
          Save Reading
        </button>
      </div>

      {/* Path A/B panel (only for that spread) */}
      {isFocusChoiceSpread && (
        <div className="w-full max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-3 p-3 mb-4 rounded-xl border bg-white/60">
          {/* Category + Question */}
          <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-sm text-neutral-600" htmlFor="qa-category">
                Category
              </label>
              <select
                id="qa-category"
                className="w-full px-3 py-2 rounded-xl border"
                value={selectedCategory}
                onChange={(e) => {
                  const cat = e.target.value as CategoryId;
                  setSelectedCategory(cat);
                  const first = QUESTIONS.find((q) => q.category === cat);
                  if (first) {
                    // Always set the spread focus + A/B from the question
                    setFocusText(first.label);
                    updateSpreadsForQuestion(first.label);
                    setChoice1Text(
                      first.requiresSubDropdown ? "" : first.pathA
                    );
                    setChoice2Text(
                      first.requiresSubDropdown ? "" : first.pathB
                    );
                  }
                }}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-sm text-neutral-600" htmlFor="qa-question">
                Question
              </label>
              <select
                id="qa-question"
                className="w-full px-3 py-2 rounded-xl border"
                value={focusText || ""} // <- tie to focusText (the spread prompt)
                onChange={(e) => {
                  const selected = QUESTIONS.find(
                    (q) => q.label === e.target.value
                  );
                  if (selected) {
                    setFocusText(selected.label);
                    updateSpreadsForQuestion(selected.label);
                    setChoice1Text(
                      selected.requiresSubDropdown ? "" : selected.pathA
                    );
                    setChoice2Text(
                      selected.requiresSubDropdown ? "" : selected.pathB
                    );
                  }
                }}
              >
                {QUESTIONS.filter((q) => q.category === selectedCategory).map(
                  (q) => (
                    <option key={q.id} value={q.label}>
                      {q.label}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          {/* Special case: dual dropdowns (no duplicates) */}
          {(() => {
            const sel = QUESTIONS.find((q) => q.label === focusText);
            if (sel?.requiresSubDropdown) {
              return (
                <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <span className="block text-xs uppercase tracking-wide text-neutral-500 mb-1">
                      Path A
                    </span>
                    <select
                      id="choice1-text"
                      className="w-full px-3 py-2 rounded-xl border"
                      value={choice1Text}
                      onChange={(e) => {
                        const v = e.target.value;
                        setChoice1Text(v);
                        if (v && v === choice2Text) setChoice2Text("");
                      }}
                    >
                      <option value="">Select…</option>
                      {sel.subOptions?.map((opt) => (
                        <option key={"A-" + opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <span className="block text-xs uppercase tracking-wide text-neutral-500 mb-1">
                      Path B
                    </span>
                    <select
                      id="choice2-text"
                      className="w-full px-3 py-2 rounded-xl border"
                      value={choice2Text}
                      onChange={(e) => {
                        const v = e.target.value;
                        setChoice2Text(v);
                        if (v && v === choice1Text) setChoice1Text("");
                      }}
                    >
                      <option value="">Select…</option>
                      {sel.subOptions
                        ?.filter((opt) => opt !== choice1Text)
                        .map((opt) => (
                          <option key={"B-" + opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              );
            }

            // Default: read-only A/B labels (no free text)
            const selDefault = QUESTIONS.find((q) => q.label === focusText);
            return (
              <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <span className="block text-xs uppercase tracking-wide text-neutral-500 mb-1">
                    Path A
                  </span>
                  <div className="px-3 py-2 rounded-xl border bg-neutral-50">
                    {selDefault?.pathA ?? "—"}
                  </div>
                </div>
                <div>
                  <span className="block text-xs uppercase tracking-wide text-neutral-500 mb-1">
                    Path B
                  </span>
                  <div className="px-3 py-2 rounded-xl border bg-neutral-50">
                    {selDefault?.pathB ?? "—"}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Intention AFTER spread selection (independent of Path A/B) */}
      <div className="mb-2">
        <label className="text-sm text-neutral-600" htmlFor="reading-question">
          Intention (optional)
        </label>
        <input
          id="reading-question"
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="What guidance are you seeking?"
          className="w-full px-3 py-2 rounded-xl border"
        />
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="tarot-canvas-container w-full h-[70vh] rounded-2xl border bg-neutral-50 overflow-hidden"
      >
        {/* CSS background fallback */}
        <div 
          className={`tarot-canvas-background ${colorway} ${backgroundReady ? 'loaded' : ''}`}
          aria-hidden="true"
        />
      </div>
      <p className="mt-3 text-sm text-neutral-600">
        Tip: Click a card to reveal → click again to zoom.
      </p>
    </div>
  );
}
