"use client";

import { useEffect, useRef, useState } from "react";
import * as PIXI from "pixi.js";
import Matter from "matter-js";
import { useTarotStore } from "./useTarotStore";
import { ALL_CARD_IDS } from "./useTarotStore";

// Import modular utilities from src/components/tarot
import { CardCreation } from "./CardCreation";
import { CardInteractions } from "./CardInteractions";
import { PhysicsUtils } from "./PhysicsUtils";
import { PixiSetup, BackgroundUtils, AnimationUtils } from "./PixiSetup";
import { WINDOWS_5, WINDOWS_3, windowCenterTarget, bgPath } from "./constants";
import type { SpriteEntity, Target } from "./types";

// Import from lib/tarot
import { mulberry32, hashSeed } from "../../../lib/tarot/rng";
import { saveReading } from "../../../lib/tarot/persistence";
import { frontSrcFor, backSrcFor, type Colorway } from "../../../lib/tarot/cards";

const { Engine, Runner, Bodies, Composite, Body } = Matter;

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

  const padX = 8; // %
  const padY = 8; // %
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
  const [seed, setSeed] = useState<string | null>(null);
  const flippingRef = useRef<Set<SpriteEntity>>(new Set());
  const hoverAnimRef = useRef<Map<SpriteEntity, number>>(new Map());
  const currentZoomedCardRef = useRef<SpriteEntity | null>(null);

  // Initialize card interactions utility
  const cardInteractions = useRef<CardInteractions | null>(null);

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
  } = useTarotStore();

  // Initialize card interactions
  useEffect(() => {
    cardInteractions.current = new CardInteractions(
      hoverAnimRef,
      flippingRef,
      currentZoomedCardRef,
      appRef,
      spritesRef
    );
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

      console.log("[TarotCanvas] PixiJS app initialized", app);

      // Load background assets
      await PIXI.Assets.load([
        "/cards/canvas/Pink-Desktop.png",
        "/cards/canvas/Pink-Mobile.png",
        "/cards/canvas/Grey-Desktop.png",
        "/cards/canvas/Grey-Mobile.png",
      ]);

      // Load card assets
      const cw = useTarotStore.getState().colorway;
      await PIXI.Assets.load([
        backSrcFor("pink"),
        backSrcFor("grey"),
        ...ALL_CARD_IDS.map((id) => frontSrcFor(id, cw)),
      ]);

      if (destroyed) return;

      appRef.current = app;

      app.stage.eventMode = "static";
      app.stage.hitArea = app.screen;
      app.stage.sortableChildren = true;

      if (containerRef.current) {
        containerRef.current.appendChild(app.view as HTMLCanvasElement);
      }

      // Style canvas
      const canvasEl = app.view as HTMLCanvasElement;
      canvasEl.style.display = "block";
      canvasEl.style.width = "100%";
      canvasEl.style.height = "100%";

      // Background management
      let bgSprite: PIXI.Sprite | null = null;

      const mountOrUpdateBg = () => {
        if (usingGradientRef.current) return;
        const w = app.renderer.width;
        const h = app.renderer.height;
        const url = bgPath(useTarotStore.getState().colorway, w, h);

        if (!bgSprite) {
          bgSprite = new PIXI.Sprite(PIXI.Texture.from(url));
          bgSprite.anchor.set(0);
          app.stage.addChildAt(bgSprite, 0);
        } else {
          bgSprite.texture = PIXI.Texture.from(url);
        }
        BackgroundUtils.coverSpriteTo(app, bgSprite);
        bgRef.current = bgSprite;
      };

      const ensureBackdrop = () => {
        if (usingGradientRef.current) {
          BackgroundUtils.drawGradientBg(app, gradientFromRef.current, gradientToRef.current, gradientRef);
        } else {
          mountOrUpdateBg();
        }
      };

      const resize = () => {
        const el = containerRef.current!;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        app.renderer.resolution = dpr;
        app.renderer.resize(el.clientWidth, el.clientHeight);
        ensureBackdrop();
      };

      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(containerRef.current!);

      // Physics setup
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

      // Deck position
      const deck = PhysicsUtils.createDeckBody(w * 0.18, h * 0.8, 200, 300);
      deckBodyRef.current = deck;
      Composite.add(engine.world, deck);

      // Sync loop
      app.ticker.add(() => {
        for (const s of spritesRef.current) {
          const { x, y } = (s.body as any).position;
          const angle = (s.body as any).angle;

          if (!hoverAnimRef.current.has(s)) {
            s.view.position.set(x, y);
          }
          
          const rot = s.reversed ? angle + Math.PI : angle;
          s.view.rotation = rot;

          s.front.visible = s.isFaceUp;
          s.back.visible = !s.isFaceUp;
          s.clip.position.set(0, 0);
        }
      });

      const runner = Runner.create();
      Runner.run(runner, engine);
      runnerRef.current = runner;

      // Cleanup function
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
    };
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

    // Switch to gradient background
    usingGradientRef.current = true;
    gradientFromRef.current = 0x000000;
    gradientToRef.current = 0x535b73;

    const pixiApp = appRef.current!;

    // Remove previous background
    if (bgRef.current) {
      pixiApp.stage.removeChild(bgRef.current);
      bgRef.current.destroy(true);
      bgRef.current = null;
    }
    BackgroundUtils.drawGradientBg(pixiApp, gradientFromRef.current, gradientToRef.current, gradientRef);

    setDealing(true);
    currentZoomedCardRef.current = null;

    // Clean up previous cards
    PhysicsUtils.cleanupSprites(spritesRef.current, engineRef.current!, hoverAnimRef.current);
    spritesRef.current = [];

    // Generate cards
    const seedStr = getSeed();
    setSeed(seedStr);
    const picks = pickCardsDeterministic(seedStr, spread.slots.length);

    const newAssignments = picks.map((p, i) => ({
      slotKey: spread.slots[i].key,
      cardId: p.id,
      reversed: p.reversed,
    }));
    setAssignments(newAssignments);

    // Preload textures
    await CardCreation.preloadTextures(newAssignments, colorway, frontSrcFor, backSrcFor);

    // Create cards using modular utility
    const deck = deckBodyRef.current!;
    const deckPosition = { x: (deck as any).position.x, y: (deck as any).position.y };

    for (let i = 0; i < spread.slots.length; i++) {
      const { slotKey, cardId, reversed } = newAssignments[i];
      const entity = await CardCreation.createCardEntity(
        cardId,
        reversed,
        slotKey,
        i,
        deckPosition,
        frontSrcFor,
        backSrcFor,
        colorway,
        engineRef.current!,
        pixiApp
      );

      // Add click handler
      entity.view.on("pointerdown", () => {
        cardInteractions.current?.handleCardClick(entity);
      });

      spritesRef.current.push(entity);
    }

    // Calculate targets based on spread
    const W = pixiApp.renderer.width;
    const H = pixiApp.renderer.height;

    let targets: Target[] = [];
    if (spread.id === "horoscope-12") {
      targets = computeHoroscopeTargets(pixiApp);
    } else if (spread.slots.length === 5) {
      targets = WINDOWS_5.map((win) => windowCenterTarget(win, W, H));
    } else if (spread.slots.length === 3) {
      targets = WINDOWS_3.map((win) => windowCenterTarget(win, W, H));
    } else {
      targets = spread.slots.map((s) => ({
        x: (s.xPerc / 100) * W,
        y: (s.yPerc / 100) * H,
        angle: s.angle ?? 0,
      }));
    }

    // Animate cards to positions
    for (let i = 0; i < spritesRef.current.length; i++) {
      const entity = spritesRef.current[i];
      const target = targets[i];
      await tweenCardToTarget(entity, target, 650);
    }

    setDealing(false);
  }

  // Tween helper
  const tweenCardToTarget = (
    entity: SpriteEntity,
    target: Target,
    ms = 700
  ) =>
    new Promise<void>((resolve) => {
      const body = entity.body;
      const start = performance.now();
      const sx = (body as any).position.x;
      const sy = (body as any).position.y;
      const sa = (body as any).angle;
      const ta = target.angle ?? sa;

      const step = (now: number) => {
        const t = Math.min(1, (now - start) / ms);
        const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        Body.setPosition(body, {
          x: sx + (target.x - sx) * ease,
          y: sy + (target.y - sy) * ease,
        });
        Body.setAngle(body, sa + (ta - sa) * ease);

        if (t < 1) requestAnimationFrame(step);
        else {
          Body.setVelocity(body, { x: 0, y: 0 });
          Body.setAngularVelocity(body, 0);
          Body.setStatic(body, true);
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
      if (cardInteractions.current?.handleGlobalClick(dealing)) {
        return; // Handled zoom out
      }
      
      // Normal card click detection
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
          cardInteractions.current?.handleCardClick(s);
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
        BackgroundUtils.coverSpriteTo(app, bg);
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
    saveReading({
      when: new Date().toISOString(),
      spreadId: spread.id,
      seed,
      colorway,
      question,
      meta: {
        focus: focusText || undefined,
        choice1: choice1Text || undefined,
        choice2: choice2Text || undefined,
      },
      cards: useTarotStore.getState().assignments.map((a) => ({
        id: a.cardId,
        reversed: a.reversed,
        slotKey: a.slotKey,
      })),
    });
    alert("Reading saved locally.");
  }

  const isFocusChoiceSpread = spread.id === "focus-choice1-choice2";

  return (
    <div className="w-full">
      {/* Question input */}
      <div className="flex flex-col gap-1 mb-4">
        <label className="text-sm text-neutral-600" htmlFor="reading-question">
          Question / Intention
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

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
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

        <div className="flex items-center gap-2">
          <label className="text-sm text-neutral-600">Deck</label>
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
          {dealing ? "Pullling..." : "Pull Spread"}
        </button>

        <button
          onClick={saveCurrentReading}
          className="px-4 py-2 rounded-xl border"
        >
          Save Reading
        </button>

        {seed && (
          <span className="text-sm text-neutral-500">
            Shareable: add{" "}
            <code>
              ?seed={seed}&colorway={colorway}
            </code>{" "}
            to this page URL
          </span>
        )}
      </div>

      {/* Focus/Choice inputs */}
      {isFocusChoiceSpread && (
        <div className="grid md:grid-cols-2 gap-3 mb-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-neutral-600" htmlFor="choice1-text">
              Choice #1
            </label>
            <input
              id="choice1-text"
              type="text"
              value={choice1Text}
              onChange={(e) => setChoice1Text(e.target.value)}
              placeholder="Describe option 1"
              className="w-full px-3 py-2 rounded-xl border"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-neutral-600" htmlFor="choice2-text">
              Choice #2
            </label>
            <input
              id="choice2-text"
              type="text"
              value={choice2Text}
              onChange={(e) => setChoice2Text(e.target.value)}
              placeholder="Describe option 2"
              className="w-full px-3 py-2 rounded-xl border"
            />
          </div>
        </div>
      )}

      {/* Canvas */}
      <div
        ref={containerRef}
        className="w-full h-[70vh] rounded-2xl border bg-neutral-50 overflow-hidden"
      />
      <p className="mt-3 text-sm text-neutral-600">
        Tip: Click a card to reveal → click again to zoom.
      </p>
    </div>
  );
}
