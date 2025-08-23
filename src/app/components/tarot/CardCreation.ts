import * as PIXI from "pixi.js";
import { Bodies, Composite } from "matter-js";
import type { SpriteEntity } from "./types";
import type { Colorway } from "../../../lib/tarot/cards";

/**
 * Card creation utilities
 */
export class CardCreation {
  static async createCardEntity(
    cardId: string,
    reversed: boolean,
    slotKey: string,
    dealIndex: number,
    deckPosition: { x: number; y: number },
    frontSrcFor: (cardId: string, colorway: Colorway) => string,
    backSrcFor: (colorway: Colorway) => string,
    colorway: Colorway,
    engine: any,
    pixiApp: PIXI.Application,
    cardW = 200,
    cardH = 300
  ): Promise<SpriteEntity> {
    const body = Bodies.rectangle(
      deckPosition.x,
      deckPosition.y,
      cardW,
      cardH,
      {
        frictionAir: 0.16,
        isSensor: true,
        collisionFilter: { group: -1, category: 0, mask: 0 },
      }
    );
    Composite.add(engine.world, body);

    const corner = Math.min(cardW, cardH) * 0.12;

    // Parent container (we will position/rotate/flip this)
    const view = new PIXI.Container();
    view.zIndex = 100 + dealIndex * 3;
    view.eventMode = "static";
    view.cursor = "pointer";
    pixiApp.stage.addChild(view);

    // Front/back sprites centered in the container
    // build textures
    const frontTex = PIXI.Texture.from(frontSrcFor(cardId, colorway));
    frontTex.source.scaleMode = 'linear'; // Smooth scaling instead of pixelated

    const backTex = PIXI.Texture.from(backSrcFor(colorway));
    backTex.source.scaleMode = 'linear';

    const front = new PIXI.Sprite(frontTex);
    const back = new PIXI.Sprite(backTex);

    front.anchor.set(0.5);
    back.anchor.set(0.5);
    front.width = cardW;
    front.height = cardH;
    back.width = cardW;
    back.height = cardH;

    for (const spr of [front, back]) {
      spr.anchor.set(0.5);
      spr.width = cardW;
      spr.height = cardH;
      view.addChild(spr);
    }
    // start face-down
    front.visible = false;
    back.visible = true;

    // Rounded mask applied to the container (so children keep their aspect)
    const clip = new PIXI.Graphics();
    clip
      .roundRect(-cardW / 2, -cardH / 2, cardW, cardH, corner)
      .fill(0xffffff);
    // The mask must be on the stage or a parent of view — add as child of view.
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
      zoomState: 'normal',
    };

    return entity;
  }

  static async preloadTextures(
    assignments: Array<{ cardId: string; slotKey: string; reversed: boolean }>,
    colorway: Colorway,
    frontSrcFor: (cardId: string, colorway: Colorway) => string,
    backSrcFor: (colorway: Colorway) => string
  ): Promise<void> {
    const urlsToLoad = [
      backSrcFor(colorway),
      ...assignments.map((a) => frontSrcFor(a.cardId, colorway)),
    ];
    await PIXI.Assets.load(urlsToLoad);
  }
}
