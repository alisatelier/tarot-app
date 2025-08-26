"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import * as PIXI from "pixi.js";
import Matter from "matter-js";
import { useTarotStore } from "./useTarotStore";
import { ALL_CARD_IDS } from "./useTarotStore";

import { CardInteractions } from "./CardInteractions";
import { pickProfile } from "./interfaces/profile.registry";
import type { TarotInterfaceProfile } from "./interfaces/types";
import {
  recomputeAndApplyBaseScaleWithProfile,
} from "./ResponsiveSizing";
import { dealToSpread as runDealToSpread, drawGradientBg } from "./animations/dealToSpread";

import {
  frontSrcFor,
  backSrcFor,
  type Colorway,
} from "../../../lib/tarot/cards";
import { 
  spreads, 
  horoscopeSpreadDef, 
  pathAVsBSpreadDef,
  type SpreadDef 
} from "../../../lib/tarot/spreads";
import { getPathsForIntention } from "../../../lib/tarot/question";

const { Engine, Runner, Bodies, Composite, Body } = Matter;

// Additional types for TarotCanvas
type SlotAssignment = { slotKey: string; cardId: string; reversed: boolean };

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
        "/cards/canvas/Grey-Mobile.png",
      ];

      await PIXI.Assets.load(backgroundUrls);
      setBackgroundReady(true);
    })();

    return backgroundPromiseRef.current;
  };

  // Store
  const {
    spreadId,
    category,
    intentionId,
    setSpreadId,
    setCategory,
    setIntentionId,
  } = useTarotStore();

  // Local state for missing properties (temporary)
  const [colorway, setColorway] = useState<Colorway>("pink");
  const [dealing, setDealing] = useState(false);
  const [assignments, setAssignments] = useState<SlotAssignment[]>([]);

  // Create a spread object from spreadId with proper slot data
  const spread = useMemo(() => {
    // Map spreadId to the correct spread definition
    const spreadIdMap: Record<string, () => SpreadDef> = {
      "ppf": () => spreads.find(s => s.id === "past-present-future")!,
      "fml": () => spreads.find(s => s.id === "focus-forward-letgo")!,
      "kdk": () => spreads.find(s => s.id === "know-dont-need")!,
      "pphao": () => spreads.find(s => s.id === "pp-issues-advice-outcome")!,
      "gcsbl": () => spreads.find(s => s.id === "goal-pos-block-bridge-lesson")!,
      "pathab": () => {
        // For pathab, use the selected intention to get path names
        if (intentionId) {
          const paths = getPathsForIntention(intentionId);
          return pathAVsBSpreadDef(paths.pathA, paths.pathB);
        }
        return pathAVsBSpreadDef("Path A", "Path B");
      },
      "horoscope": () => horoscopeSpreadDef(),
    };

    const getSpread = spreadIdMap[spreadId];
    if (getSpread) {
      return getSpread();
    }

    // Fallback
    return {
      id: spreadId,
      label: "Unknown Spread",
      slots: []
    };
  }, [spreadId, intentionId]);

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

      const cw = colorway; // Use local state instead of store
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
        const url = bgPath(colorway, w, h);

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
      if (labelLayerRef.current) {
        labelLayerRef.current.destroy({ children: true });
        labelLayerRef.current = null;
      }
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

  // Simplified dealToSpread function
  async function dealToSpread() {
    if (!appRef.current || !engineRef.current) return;
    if (dealing) return;
    
    setDealing(true);
    // Simplified implementation - just calls the modular function
    try {
      await runDealToSpread({
        spread,
        colorway,
        setDealing,
        appRef: appRef as any,
        engineRef: engineRef as any,
        spritesRef: spritesRef as any,
        profileRef: profileRef as any,
        baseCardScaleRef: baseCardScaleRef as any,
        currentZoomedCardRef: currentZoomedCardRef as any,
        hoverAnimRef: hoverAnimRef as any,
        bgRef: bgRef as any,
        gradientRef: gradientRef as any,
        usingGradientRef: usingGradientRef as any,
        gradientFromRef: gradientFromRef as any,
        gradientToRef: gradientToRef as any,
        setSeed,
        setAssignments,
        interactions: interactions as any
      });
    } catch (error) {
      console.error("Error in dealToSpread:", error);
    } finally {
      setDealing(false);
    }
  }



  return (
    <div className="w-full pt-8">
      {/* Simplified controls - only colorway and pull button */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {/* Colorway */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-600">Deck Colour</span>
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
          disabled={dealing}
        >
          {dealing ? "Pulling..." : "Pull Spread"}
        </button>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="tarot-canvas-container w-full h-[70vh] rounded-2xl border bg-neutral-50 overflow-hidden"
      >
        {/* CSS background fallback */}
        <div
          className={`tarot-canvas-background ${colorway} ${
            backgroundReady ? "loaded" : ""
          }`}
          aria-hidden="true"
        />
      </div>
      <p className="mt-3 text-sm text-neutral-600">
        Tip: Click a card to reveal → click again to zoom.
      </p>
    </div>
  );
}
