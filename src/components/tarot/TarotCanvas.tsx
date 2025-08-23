"use client";

import { useEffect, useRef, useState } from "react";
import * as PIXI from "pixi.js";
import { Engine, Runner, Bodies, Composite, Body } from "matter-js";
import { useTarotStore } from "./useTarotStore";
import { ALL_CARD_IDS } from "./useTarotStore";
import { mulberry32, hashSeed } from "../../lib/tarot/rng";
import { saveReading } from "../../lib/tarot/persistence";
import {
  CARDS_CATALOG,
  frontSrcFor,
  backSrcFor,
  type Colorway,
} from "../../lib/tarot/cards";

// percent units, relative to canvas
type Win = { x: number; y: number; w: number; h: number };

// Windows for 5‑card spreads (two rows, 3 on top and 2 below)
// Tweak these to match your artwork “windows”
const WINDOWS_5: Win[] = [
  // top row (3)
  { x: 18, y: 18, w: 14, h: 26 }, // #1 (left top)
  { x: 43, y: 18, w: 14, h: 26 }, // #2 (center top)
  { x: 68, y: 18, w: 14, h: 26 }, // #3 (right top)
  // bottom row (2)
  { x: 30, y: 54, w: 14, h: 26 }, // #4 (left bottom)
  { x: 56, y: 54, w: 14, h: 26 }, // #5 (right bottom)
];

// Windows for 3‑card spreads (straight line)
const WINDOWS_3: Win[] = [
  { x: 43, y: 20, w: 14, h: 26 }, // #1 left
  { x: 20, y: 55, w: 14, h: 26 }, // #2 center
  { x: 66, y: 55, w: 14, h: 26 }, // #3 right
];

function windowCenterTarget(win: Win, W: number, H: number) {
  const cx = ((win.x + win.w / 2) / 100) * W;
  const cy = ((win.y + win.h / 2) / 100) * H;
  return { x: cx, y: cy, angle: 0 };
}

// Choose desktop vs mobile image by current renderer size (matches Pink/Grey filename case)
function bgPath(colorway: "pink" | "grey", w: number, h: number) {
  const variant = w >= h ? "Desktop" : "Mobile"; // Capitalized
  const tone = colorway === "pink" ? "Pink" : "Grey"; // Capitalized
  return `/cards/canvas/${tone}-${variant}.png`;
}

// Optional: make the bg behave like CSS "background-size: cover"
function coverSpriteTo(app: PIXI.Application, sprite: PIXI.Sprite) {
  const W = app.renderer.width;
  const H = app.renderer.height;
  const texW = sprite.texture.width || 1;
  const texH = sprite.texture.height || 1;
  const scale = Math.max(W / texW, H / texH);
  sprite.scale.set(scale);
  sprite.position.set((W - texW * scale) / 2, (H - texH * scale) / 2);
}

type SpriteEntity = {
  body: Body;
  cardId: string;
  front: PIXI.Sprite;
  back: PIXI.Sprite;
  clip: PIXI.Graphics; // NEW (mask)
  isFaceUp: boolean;
  reversed: boolean;
  slotKey: string;
};

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

export default function TarotCanvas() {
  // Refs
  const containerRef = useRef<HTMLDivElement | null>(null);
  const gradientRef = useRef<PIXI.Sprite | null>(null);
  const usingGradientRef = useRef(false); // NEW
  const gradientFromRef = useRef(0x000000); // optional, remember colors
  const gradientToRef = useRef(0x535b73);
  const bgRef = useRef<PIXI.Sprite | null>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const engineRef = useRef<Engine | null>(null);
  const runnerRef = useRef<Runner | null>(null);
  const spritesRef = useRef<SpriteEntity[]>([]);
  const deckBodyRef = useRef<Body | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const [seed, setSeed] = useState<string | null>(null);

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

  // --- PIXI + Matter init (Pixi v7 async) ---
  useEffect(() => {
    if (!containerRef.current) return;

    let destroyed = false;

    (async () => {
      const app = new PIXI.Application();
      await app.init({ backgroundAlpha: 0 }); // v7 async init
      // Preload BG variants using Pixi v7 Assets loader
      const bgUrls = [
        "/cards/canvas/Pink-Desktop.png",
        "/cards/canvas/Pink-Mobile.png",
        "/cards/canvas/Grey-Desktop.png",
        "/cards/canvas/Grey-Mobile.png",
      ];

      // This returns an array of Textures (one per URL) and waits until all are ready
      await PIXI.Assets.load(bgUrls);

      const cw = useTarotStore.getState().colorway;
      await PIXI.Assets.load([
        backSrcFor("pink"),
        backSrcFor("grey"),
        ...ALL_CARD_IDS.map((id) => frontSrcFor(id, cw)),
      ]);

      if (destroyed) return;

      appRef.current = app;

      app.stage.sortableChildren = true;

      containerRef.current!.appendChild(app.view as HTMLCanvasElement);

      // Keep a local variable but also mirror it to bgRef so other effects can see it
      let bgSprite: PIXI.Sprite | null = null;

      const mountOrUpdateBg = () => {
        if (usingGradientRef.current) return; // skip cloth if gradient active

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
        coverSpriteTo(app, bgSprite);
        bgRef.current = bgSprite;
      };

      const resize = () => {
        const el = containerRef.current!;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        app.renderer.resolution = dpr;
        app.renderer.resize(el.clientWidth, el.clientHeight);

        if (usingGradientRef.current) {
          drawGradientBg(app, gradientFromRef.current, gradientToRef.current);
        } else {
          mountOrUpdateBg();
        }
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

      // Deck position (bottom-left-ish)
      const deck = Bodies.rectangle(w * 0.18, h * 0.8, 120, 180, {
        isStatic: true,
      });
      deckBodyRef.current = deck;
      Composite.add(engine.world, deck);

      // Sync loop
      app.ticker.add(() => {
        for (const s of spritesRef.current) {
          const { x, y } = s.body.position;
          const angle = s.body.angle;
          s.front.position.set(x, y);
          s.back.position.set(x, y);
          s.clip.position.set(x, y);

          const rot = s.reversed ? angle + Math.PI : angle;
          s.front.visible = s.isFaceUp;
          s.back.visible = !s.isFaceUp;
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

  //Horoscope Spread
  function computeHoroscopeTargets(app: PIXI.Application) {
    const W = app.renderer.width;
    const H = app.renderer.height;

    const isDesktop = W >= 768;
    const cols = isDesktop ? 6 : 3;
    const rows = isDesktop ? 2 : 4;

    const padX = 8; // %
    const padY = 8; // %
    const cellW = (100 - padX * 2) / cols;
    const cellH = (100 - padY * 2) / rows;

    const targets: { x: number; y: number; angle?: number }[] = [];
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

  //Black to BrandNavy Backdrop Canvas
  function drawGradientBg(app: PIXI.Application, from: number, to: number) {
    // remove old gradient
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
    sprite.alpha = 0; // fade in
    app.stage.addChildAt(sprite, 0);

    // fade
    const fade = () => {
      sprite.alpha = Math.min(1, sprite.alpha + 0.06);
      if (sprite.alpha >= 1) app.ticker.remove(fade);
    };
    app.ticker.add(fade);

    gradientRef.current = sprite;
  }

  // --- Deal flow ---
async function dealToSpread() {
  if (!appRef.current || !engineRef.current || !deckBodyRef.current) return;
  if (ALL_CARD_IDS.length === 0) {
    console.error("[Tarot] No cards found. Fill CARDS_CATALOG in src/lib/tarot/cards.ts");
    alert("No cards found. Please add cards to your deck.");
    return;
  }
  if (dealing) return;

  // Turn on gradient mode (one-time each deal)
  usingGradientRef.current = true;
  gradientFromRef.current = 0x000000; // black
  gradientToRef.current   = 0x535b73; // brand navy

  const pixiApp = appRef.current!;

  // Remove cloth if present and draw gradient
  if (bgRef.current) {
    pixiApp.stage.removeChild(bgRef.current);
    bgRef.current.destroy(true);
    bgRef.current = null;
  }
  drawGradientBg(pixiApp, gradientFromRef.current, gradientToRef.current);

  setDealing(true);

  // ---------- Clear previous ----------
  for (const s of spritesRef.current) {
    s.front.destroy();
    s.back.destroy();
    s.clip.destroy();
    Composite.remove(engineRef.current!.world, s.body);
  }
  spritesRef.current = [];

  // ---------- Seed + pick ----------
  const seedStr = getSeed();
  setSeed(seedStr);
  const picks = pickCardsDeterministic(seedStr, spread.slots.length);

  const newAssignments = picks.map((p, i) => ({
    slotKey: spread.slots[i].key,
    cardId: p.id,
    reversed: p.reversed,
  }));
  setAssignments(newAssignments);

  // Preload the textures we’ll use
  const urlsToLoad = [
    backSrcFor(colorway),
    ...newAssignments.map((a) => frontSrcFor(a.cardId, colorway)),
  ];
  await PIXI.Assets.load(urlsToLoad);

  // ---------- helpers ----------
  const deck = deckBodyRef.current!;
  const defaultCardW = 120;
  const defaultCardH = 180;

  // create one card entity at the deck position
  const makeCard = (
    cardId: string,
    reversed: boolean,
    slotKey: string,
    dealIndex: number,
    cardW = defaultCardW,
    cardH = defaultCardH
  ) => {
    const body = Bodies.rectangle(deck.position.x, deck.position.y, cardW, cardH, {
      frictionAir: 0.16,
      isSensor: true,                                // no collisions while moving
      collisionFilter: { group: -1, category: 0, mask: 0 },
    });
    Composite.add(engineRef.current!.world, body);

    const corner = Math.min(cardW, cardH) * 0.12;

    const front = new PIXI.Sprite(PIXI.Texture.from(frontSrcFor(cardId, colorway)));
    const back  = new PIXI.Sprite(PIXI.Texture.from(backSrcFor(colorway)));
    for (const spr of [front, back]) {
      spr.anchor.set(0.5);
      spr.width = cardW;
      spr.height = cardH;
      spr.visible = false;                  // start face-down
      spr.zIndex = 100 + dealIndex * 3;     // stable stacking
      pixiApp.stage.addChild(spr);
    }

    // rounded mask (no border)
    const clip = new PIXI.Graphics();
    clip.roundRect(-cardW/2, -cardH/2, cardW, cardH, corner).fill(0xffffff);
    clip.alpha = 0;
    clip.zIndex = 100 + dealIndex * 3 + 1;
    pixiApp.stage.addChild(clip);

    front.mask = clip;
    back.mask  = clip;

    const entity: SpriteEntity = {
      body,
      cardId,
      front,
      back,
      clip,
      isFaceUp: false,
      reversed,
      slotKey,
    };
    spritesRef.current.push(entity);
    return entity;
  };

  // tween one card body to a target, then lock static
  const tween = (
    entity: SpriteEntity,
    target: { x: number; y: number; angle?: number },
    ms = 700
  ) =>
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

        if (t < 1) requestAnimationFrame(step);
        else {
          Body.setVelocity(body, { x: 0, y: 0 });
          Body.setAngularVelocity(body, 0);
          Body.setStatic(body, true);       // stop drift
          resolve();
        }
      };
      requestAnimationFrame(step);
    });

  // ---------- build targets (triangle/5/12/fallback) ----------
  const W = pixiApp.renderer.width;
  const H = pixiApp.renderer.height;

  let targets: { x: number; y: number; angle?: number }[] = [];
  if (spread.id === "horoscope-12") {
    targets = computeHoroscopeTargets(pixiApp);
  } else if (spread.slots.length === 5 && typeof windowCenterTarget === "function") {
    targets = WINDOWS_5.map((win) => windowCenterTarget(win, W, H));
  } else if (spread.slots.length === 3 && typeof windowCenterTarget === "function") {
    targets = WINDOWS_3.map((win) => windowCenterTarget(win, W, H));
  } else {
    // fallback to percentages on the spread
    targets = spread.slots.map((s) => ({
      x: (s.xPerc / 100) * W,
      y: (s.yPerc / 100) * H,
      angle: s.angle ?? 0,
    }));
  }

  // ---------- create → show back → tween (stable order) ----------
  for (let i = 0; i < spread.slots.length; i++) {
    const { slotKey, cardId, reversed } = newAssignments[i];
    const card = makeCard(cardId, reversed, slotKey, i);
    card.back.visible = true;
    await tween(card, targets[i], 650);
  }

  setDealing(false);
}

  // --- Flip handler (this is the one that was easy to delete) ---
  useEffect(() => {
    const app = appRef.current;
    if (!app) return;

    const onPointer = (e: PIXI.FederatedPointerEvent) => {
      const pos = e.global;
      // topmost first
      for (let i = spritesRef.current.length - 1; i >= 0; i--) {
        const s = spritesRef.current[i];
        const spr = s.isFaceUp ? s.front : s.back;
        if (!spr.visible) continue;
        const bounds = spr.getBounds();
        if (
          pos.x >= bounds.x &&
          pos.x <= bounds.x + bounds.width &&
          pos.y >= bounds.y &&
          pos.y <= bounds.y + bounds.height
        ) {
          s.isFaceUp = !s.isFaceUp;
          break;
        }
      }
    };

    app.stage.eventMode = "static";
    app.stage.hitArea = app.screen;
    app.stage.addEventListener("pointerdown", onPointer);
    return () => app.stage.removeEventListener("pointerdown", onPointer);
  }, []);

  // --- Live re‑skin when colorway changes (optional but nice) ---
  useEffect(() => {
    const app = appRef.current;
    if (!app) return;

    // Update dealt cards
    for (const s of spritesRef.current) {
      s.front.texture = PIXI.Texture.from(frontSrcFor(s.cardId, colorway));
      s.back.texture = PIXI.Texture.from(backSrcFor(colorway));
    }

    // Update background
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

  // --- Read ?colorway= from URL once (optional) ---
  useEffect(() => {
    const url = new URL(window.location.href);
    const c = url.searchParams.get("colorway") as Colorway | null;
    if (c === "pink" || c === "grey") setColorway(c);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Save reading (uses store assignments, not texture URLs) ---
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
      {/* 1) Question */}
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

      {/* 2) Spread + actions */}
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
          {dealing ? "Dealing..." : "Deal Spread"}
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

      {/* 2b) Focus/Choice inputs (conditional) */}
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

      {/* 3) Canvas */}
      <div
        ref={containerRef}
        className="w-full h-[70vh] rounded-2xl border bg-neutral-50 overflow-hidden"
      />
      <p className="mt-3 text-sm text-neutral-600">
        Tip: Tap/click a card to flip.
      </p>
    </div>
  );
}
