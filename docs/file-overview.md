diff --git a//dev/null b/docs/file-overview.md
index 0000000000000000000000000000000000000000..7ccd7ace079227a7af648ff965a035609c7e6afc 100644
--- a//dev/null
+++ b/docs/file-overview.md
@@ -0,0 +1,198 @@
+# Application File Overview
+
+This document summarizes the purpose of each source file in the tarot application and the major functions or classes it provides.
+
+## Top-level Configuration
+
+- `next.config.ts` – Next.js configuration exported as `nextConfig`.
+- `tailwind.config.ts` – Tailwind CSS theme and plugin setup.
+- `eslint.config.mjs` – ESLint configuration using `next` presets.
+- `postcss.config.mjs` – PostCSS plugin configuration.
+
+## App Directory
+
+### `src/app/layout.tsx`
+- **Purpose**: Root layout for the Next.js application.
+- **Exports**:
+  - `metadata` – page metadata.
+  - `RootLayout` – wraps all pages with global fonts and structure.
+
+### `src/app/page.tsx`
+- **Purpose**: Default home page shown at `/`.
+- **Exports**:
+  - `Home` – renders example content and links.
+
+### `src/app/tarot/page.tsx`
+- **Purpose**: Tarot reading page that loads the interactive canvas.
+- **Exports**:
+  - `TarotPage` – renders header, `SelectorBar`, and dynamically imported `TarotCanvas`.
+
+## Components – Tarot
+
+### `src/app/components/tarot/TarotCanvas.tsx`
+- **Purpose**: Main interactive canvas for dealing and manipulating tarot cards.
+- **Exports**:
+  - `TarotCanvas` – React component orchestrating PIXI and Matter.js.
+- **Notable Functions**:
+  - `coverSpriteTo` – scales a PIXI sprite to cover the canvas.
+  - `preloadBackgrounds` – preloads background images for the canvas.
+
+### `src/app/components/tarot/index.ts`
+- **Purpose**: Barrel file re-exporting utility modules for tarot components.
+
+### `src/app/components/tarot/animations/cardTween.ts`
+- **Purpose**: Tweening helper for moving cards.
+- **Exports**:
+  - `tweenCardToTarget` – animates a card entity to a target position.
+  - `Target`, `TweenOptions` – supporting types.
+
+### `src/app/components/tarot/animations/dealToSpread.ts`
+- **Purpose**: Deals cards from the deck to a spread layout.
+- **Exports**:
+  - `drawGradientBg` – renders a gradient background.
+  - `dealToSpread` – orchestrates dealing animation and layout placement.
+- **Internal Helpers**:
+  - `ensureLabelLayer` – ensures a label layer exists on the PIXI stage.
+
+### `src/app/components/tarot/intention/dropDownIntention.tsx`
+- **Purpose**: UI for selecting spread and intention, including custom text.
+- **Exports**:
+  - `DropDownIntention` – selection component.
+
+### `src/app/components/tarot/intention/flattenIntentions.ts`
+- **Purpose**: Flattens spread intentions for display.
+- **Exports**:
+  - `flattenIntentions` – returns intention IDs and labels.
+
+### `src/app/components/tarot/intention/useIntentionStore.ts`
+- **Purpose**: Zustand store factory for intention state.
+- **Exports**:
+  - `makeIntentionStore` – creates a persistent store with setters.
+
+### `src/app/components/tarot/intention/useResolvedIntention.ts`
+- **Purpose**: Hook to compute the finalized intention string.
+- **Exports**:
+  - `useResolvedIntention` – selects either custom text or preset label.
+
+### `src/app/components/tarot/interfaces/ResponsiveSizing.ts`
+- **Purpose**: Utilities for responsive card sizing and scaling.
+- **Exports**:
+  - `preScaleEntityForProfile`
+  - `computeBaseScaleForEntityWithProfile`
+  - `applyBaseScaleToCards`
+  - `recomputeAndApplyBaseScaleWithProfile`
+
+### `src/app/components/tarot/interfaces/deal.spawn.ts`
+- **Purpose**: Calculates spawn point for newly dealt cards.
+- **Exports**:
+  - `computeSpawnPoint` – returns off‑screen starting coordinates.
+
+### `src/app/components/tarot/interfaces/layout.overrides.ts`
+- **Purpose**: Adjusts layout targets for specific profiles and spreads.
+- **Exports**:
+  - `applyLayoutOverrides` – modifies card target positions.
+
+### `src/app/components/tarot/interfaces/profile.*.ts`
+- **Purpose**: Define responsive interface profiles.
+- **Exports**:
+  - `DesktopProfile`, `TabletProfile`, `MobileProfile` – profile objects built with `makeProfile`.
+  - `makeProfile` – helper to build profile objects.
+  - `pickProfile` – selects a profile based on screen width.
+
+### `src/app/components/tarot/interfaces/types.ts`
+- **Purpose**: Shared interface definitions.
+- **Exports**:
+  - `fitScaleToScreen` – computes zoom scale to fit the viewport.
+  - `TarotInterfaceProfile` – interface describing profile shape.
+
+### `src/app/components/tarot/layouts/SelectorBar.tsx`
+- **Purpose**: Toolbar for choosing spread and intention.
+- **Exports**:
+  - `SelectorBar` – wraps `DropDownIntention` and shows resolved text.
+
+### `src/app/components/tarot/layouts/horoscope.ts`
+- **Purpose**: Layout helper for 12‑card horoscope spread.
+- **Exports**:
+  - `computeHoroscopeTargets` – returns target positions for cards.
+
+### `src/app/components/tarot/useTarotStore.ts`
+- **Purpose**: Central Zustand store for tarot UI state.
+- **Exports**:
+  - `useTarotStore` – store with spread, intention, and name setters.
+  - `ALL_CARD_IDS` – list of all card identifiers.
+
+## Components – Utilities
+
+### `src/app/components/tarot/utils/CardCreation.ts`
+- **Purpose**: Builds card sprites and preloads textures.
+- **Exports**:
+  - `CardCreation.createCardEntity` – constructs a card entity with physics and sprites.
+  - `CardCreation.preloadTextures` – preloads card textures.
+
+### `src/app/components/tarot/utils/CardInteractions.ts`
+- **Purpose**: Handles clicks, zooming, flipping, and visibility of cards.
+- **Exports**:
+  - `CardInteractions` – class with methods `handleCardClick`, `zoomToCard`, `unzoomCurrent`, `showAllCards`, `flipEntity`, etc.
+
+### `src/app/components/tarot/utils/PhysicsUtils.ts`
+- **Purpose**: Physics helpers for deck and card lifecycle.
+- **Exports**:
+  - `PhysicsUtils.createDeckBody`
+  - `PhysicsUtils.animateDealing`
+  - `PhysicsUtils.cleanupSprites`
+
+### `src/app/components/tarot/utils/PixiSetup.ts`
+- **Purpose**: Setup helpers for PIXI and animation utilities.
+- **Exports**:
+  - `PixiSetup.initializePixiApp`
+  - `PixiSetup.setupEngineAndRender`
+  - `BackgroundUtils.coverSpriteTo`
+  - `BackgroundUtils.drawGradientBg`
+  - `AnimationUtils.tweenNumber`
+  - `attachPhysicsTicker` – attaches Matter.js updates to the PIXI ticker.
+
+### `src/app/components/tarot/utils/background.ts`
+- **Purpose**: Builds background image URLs.
+- **Exports**:
+  - `bgPath` – returns path based on colorway and dimensions.
+
+### `src/app/components/tarot/utils/cardPicking.ts`
+- **Purpose**: Deterministic card shuffling and seed management.
+- **Exports**:
+  - `pickCardsDeterministic` – returns shuffled card picks using a seed.
+  - `getSeed` – reads or generates the seed parameter.
+
+### `src/app/components/tarot/utils/types.ts`
+- **Purpose**: Shared type definitions for card entities and saved readings.
+
+## Library
+
+### `src/lib/tarot/cards.ts`
+- **Purpose**: Tarot deck metadata and image helpers.
+- **Exports**:
+  - `CARDS_CATALOG` – list of all cards.
+  - `frontSrcFor` – builds URL for card fronts.
+  - `backSrcFor` – builds URL for card backs.
+
+### `src/lib/tarot/persistence.ts`
+- **Purpose**: Local persistence of readings.
+- **Exports**:
+  - `saveReading` – stores a reading in local storage.
+  - `listReadings` – retrieves saved readings.
+  - `loadAllReadings` – loads legacy data format.
+
+### `src/lib/tarot/rng.ts`
+- **Purpose**: Pseudo‑random number utilities.
+- **Exports**:
+  - `mulberry32` – seeded PRNG factory.
+  - `hashSeed` – hashes a string to a 32‑bit seed.
+
+### `src/lib/tarot/spreads.ts`
+- **Purpose**: Definitions and helpers for tarot spreads and intentions.
+- **Exports**:
+  - `substituteVars`, `needsRelationshipName` – label utilities.
+  - `getSpreadById`, `getIntentionById` – lookup helpers.
+  - `currentSeasonIndex`, `horoscopeSpreadDef` – horoscope helpers.
+  - `pathAVsBSpreadDef`, `thisOrThatSpreadDef` – dynamic spread generators.
+  - `getPathsForIntention` – retrieves intention path names.
+
