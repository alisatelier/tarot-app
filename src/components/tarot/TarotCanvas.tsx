"use client";

import { useEffect, useRef, useState } from "react";
import * as PIXI from "pixi.js";
import Matter, { Engine, Runner, Bodies, Composite, Body } from "matter-js";
import { useTarotStore } from "./useTarotStore";
import { ALL_CARD_IDS } from "./useTarotStore";
import { mulberry32, hashSeed } from "../../lib/tarot/rng";
import { savedReading } from "../../lib/tarot/persistence";
import {
  CARDS_CATALOG,
  frontSrcFor,
  backSrcFor,
  type Colorway,
} from "../../lib/tarot/cards";

type SpriteEntity = {
  body: Matter.Body;
  front: PIXI.Sprite;
  back: PIXI.Sprite;
  isFaceUp: boolean;
  reversed: boolean;
  slotKey: string;
  cardId: string; // store id for reliable saves & re-skin
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
  const appRef = useRef<PIXI.Application | null>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const spritesRef = useRef<SpriteEntity[]>([]);
  const deckBodyRef = useRef<Matter.Body | null>(null);
  const cleanupRef = useRef<() => void>();
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
      await app.init(); // v7 async init
      if (destroyed) return;

      appRef.current = app;
      containerRef.current!.appendChild(app.view as HTMLCanvasElement);

      const resize = () => {
        const el = containerRef.current!;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        app.renderer.resolution = dpr;
        app.renderer.resize(el.clientWidth, el.clientHeight);
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
      const deck = Bodies.rectangle(w * 0.18, h * 0.8, 120, 180, { isStatic: true });
      deckBodyRef.current = deck;
      Composite.add(engine.world, deck);

      // Sync loop
      app.ticker.add(() => {
        for (const s of spritesRef.current) {
          const { x, y } = s.body.position;
          const angle = s.body.angle;
          s.front.position.set(x, y);
          s.back.position.set(x, y);
          const rot = s.reversed ? angle + Math.PI : angle;
          s.front.rotation = rot;
          s.back.rotation = rot;
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

  // --- Deal flow ---
  async function dealToSpread() {
    if (!appRef.current || !engineRef.current || !deckBodyRef.current) return;
    if (dealing) return;
    setDealing(true);

    // Clear previous
    for (const s of spritesRef.current) {
      s.front.destroy();
      s.back.destroy();
      Composite.remove(engineRef.current!.world, s.body);
    }
    spritesRef.current = [];

    // Seed + pick
    const s = getSeed();
    setSeed(s);
    const picks = pickCardsDeterministic(s, spread.slots.length);
    const newAssignments = picks.map((p, i) => ({
      slotKey: spread.slots[i].key,
      cardId: p.id,
      reversed: p.reversed,
    }));
    setAssignments(newAssignments);

    // Create + tween to slots
    const app = appRef.current!;
    const deck = deckBodyRef.current!;
    const w = 120, h = 180;

    const makeCard = (cardId: string, reversed: boolean, slotKey: string) => {
      const body = Bodies.rectangle(deck.position.x, deck.position.y, w, h, { frictionAir: 0.14 });
      Composite.add(engineRef.current!.world, body);

      const front = new PIXI.Sprite(PIXI.Texture.from(frontSrcFor(cardId, colorway)));
      const back  = new PIXI.Sprite(PIXI.Texture.from(backSrcFor(colorway)));
      for (const spr of [front, back]) {
        spr.anchor.set(0.5);
        spr.width = w; spr.height = h;
        spr.visible = false;
        app.stage.addChild(spr);
      }
      const entity: SpriteEntity = { body, front, back, isFaceUp: false, reversed, slotKey, cardId };
      spritesRef.current.push(entity);
      return entity;
    };

    const tween = (entity: SpriteEntity, target: { x: number; y: number; angle?: number }, ms = 700) =>
      new Promise<void>((resolve) => {
        const body = entity.body;
        const start = performance.now();
        const sx = body.position.x, sy = body.position.y, sa = body.angle;
        const ta = target.angle ?? sa;
        const step = (now: number) => {
          const t = Math.min(1, (now - start) / ms);
          const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
          Body.setPosition(body, { x: sx + (target.x - sx) * ease, y: sy + (target.y - sy) * ease });
          Body.setAngle(body, sa + (ta - sa) * ease);
          if (t < 1) requestAnimationFrame(step);
          else resolve();
        };
        requestAnimationFrame(step);
      });

    const W = app.renderer.width;
    const H = app.renderer.height;
    const toXY = (xp: number, yp: number) => ({ x: (xp / 100) * W, y: (yp / 100) * H });

    for (let i = 0; i < spread.slots.length; i++) {
      const slot = spread.slots[i];
      const { x, y } = toXY(slot.xPerc, slot.yPerc);
      const chosen = newAssignments[i];
      const card = makeCard(chosen.cardId, chosen.reversed, slot.key);
      const angle = (i - spread.slots.length / 2) * 0.08 + (slot.angle ?? 0);
      card.back.visible = true; // start face-down
      await tween(card, { x, y, angle }, 650);
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
        if (bounds.contains(pos.x, pos.y)) {
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
    if (!appRef.current || spritesRef.current.length === 0) return;
    for (const s of spritesRef.current) {
      s.front.texture = PIXI.Texture.from(frontSrcFor(s.cardId, colorway));
      s.back.texture  = PIXI.Texture.from(backSrcFor(colorway));
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
      cards: useTarotStore.getState().assignments.map(a => ({
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
            <option key={s.id} value={s.id}>{s.label}</option>
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

        <button onClick={saveCurrentReading} className="px-4 py-2 rounded-xl border">
          Save Reading
        </button>

        {seed && (
          <span className="text-sm text-neutral-500">
            Shareable: add <code>?seed={seed}&colorway={colorway}</code> to this page URL
          </span>
        )}
      </div>

      {/* 2b) Focus/Choice inputs (conditional) */}
      {isFocusChoiceSpread && (
        <div className="grid md:grid-cols-3 gap-3 mb-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-neutral-600" htmlFor="focus-text">Focus</label>
            <input
              id="focus-text"
              type="text"
              value={focusText}
              onChange={(e) => setFocusText(e.target.value)}
              placeholder="Your central focus"
              className="w-full px-3 py-2 rounded-xl border"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-neutral-600" htmlFor="choice1-text">Choice #1</label>
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
            <label className="text-sm text-neutral-600" htmlFor="choice2-text">Choice #2</label>
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
      <div ref={containerRef} className="w-full h-[70vh] rounded-2xl border bg-neutral-50 overflow-hidden" />
      <p className="mt-3 text-sm text-neutral-600">
        Tip: Tap/click a card to flip. Reversed cards are auto‑handled (rotated 180°).
      </p>
    </div>
  );
}
