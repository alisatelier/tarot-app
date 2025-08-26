import * as PIXI from "pixi.js";
import { Engine, Render } from "matter-js";

/**
 * PixiJS application setup and initialization
 */
export class PixiSetup {
  static async initializePixiApp(
    canvasRef: React.RefObject<HTMLCanvasElement>,
    setAppReady: (ready: boolean) => void
  ): Promise<PIXI.Application | null> {
    if (!canvasRef.current) return null;

    const app = new PIXI.Application();
    await app.init({
      canvas: canvasRef.current,
      width: 900,
      height: 650,
      antialias: true,
      autoDensity: true,
      resolution: 2,
      backgroundAlpha: 0,
    });

    setAppReady(true);
    return app;
  }

  static setupEngineAndRender(app: PIXI.Application) {
    const engine = Engine.create();
    engine.world.gravity.y = 0;

    const render = Render.create({
      canvas: document.createElement("canvas"),
      engine: engine,
      options: {
        width: app.renderer.width,
        height: app.renderer.height,
        wireframes: false,
        background: "transparent",
      },
    });

    render.canvas.style.position = "absolute";
    render.canvas.style.top = "0px";
    render.canvas.style.left = "0px";
    render.canvas.style.pointerEvents = "none";
    render.canvas.style.opacity = "0";

    return { engine, render };
  }
}

/**
 * Background utilities
 */
export class BackgroundUtils {
  // Optional: make the bg behave like CSS "background-size: cover"
  static coverSpriteTo(app: PIXI.Application, sprite: PIXI.Sprite) {
    const W = app.renderer.width;
    const H = app.renderer.height;
    const texW = sprite.texture.width || 1;
    const texH = sprite.texture.height || 1;
    const scale = Math.max(W / texW, H / texH);
    sprite.scale.set(scale);
    sprite.position.set((W - texW * scale) / 2, (H - texH * scale) / 2);
  }

  // Draw gradient background
  static drawGradientBg(
    app: PIXI.Application,
    colorFrom: number,
    colorTo: number,
    gradientRef?: React.MutableRefObject<PIXI.Sprite | null>
  ) {
    // Remove old gradient if ref is provided
    if (gradientRef?.current) {
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
    grad.addColorStop(0, "#" + colorFrom.toString(16).padStart(6, "0"));
    grad.addColorStop(1, "#" + colorTo.toString(16).padStart(6, "0"));
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

    // Store in ref if provided
    if (gradientRef) {
      gradientRef.current = sprite;
    }

    return sprite;
  }
}

/**
 * Animation utilities
 */
export class AnimationUtils {
  // Generic RAF tween helper
  static tweenNumber(
    from: number,
    to: number,
    ms: number,
    onUpdate: (v: number) => void,
    onDone?: () => void
  ) {
    const start = performance.now();
    let raf = 0;

    const step = (now: number) => {
      const t = Math.min(1, (now - start) / ms);
      // easeInOutQuad
      const e = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      onUpdate(from + (to - from) * e);
      if (t < 1) {
        raf = requestAnimationFrame(step);
      } else {
        onDone?.();
      }
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }
}

export function attachPhysicsTicker(app: PIXI.Application, engine: Engine) {
  const cb = (ticker: PIXI.Ticker) => {
    Engine.update(engine, ticker.deltaMS);
  };
  app.ticker.add(cb);
  return () => app.ticker.remove(cb);
}
