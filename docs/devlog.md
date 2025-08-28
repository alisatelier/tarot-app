# Dev Log

Quick running notes of what was happening at each commit or push.  
(Doesn’t need to be fancy—just a couple of lines helps.)

---

## 2025-08-28 0052– GREEN PUSH
- Pushed Branch to Main post changes.


## 2025-08-28 0046– Text Label Positioning
- Adjusted positioning of Text labels for mobile and desktop.

## 2025-08-26 1735– Mobile/ Tablet Layout Optimization
- Adjusted Mobile and Tablet card positioning.
- Next Up: Fix text postitions.

## 2025-08-26 0703– Decrease distance between card and label
- The ticker in TarotCanvas looped the sprite to match the physics body, which blocked the change of distance. resize() was then also blcoked and so was applyLayoutOverrides which modified target positions. Fixed by changing ticker.


## 2025-08-26 0626– Bug Fix - Have labels diappear on zoom.
- hideOtherCards method now includes labels. showAllCards also shows cards with label.


## 2025-08-26 0626– GREEN PUSH - Intention Free-Text Cleaned Up 
- IntentionPicker.tsx made redundant deleted file.


## 2025-08-26 0537– Intention Free-Text Working
- Adjusted the SelectorBar.tsx to do most of the functions, and dropDownIntention.tsx to host most of the layout of the UI. IntentionPicker.tsx handles the "Write My Own Intention" Layout only.


## 2025-08-26 0537– Intention Free-Text
[flattenIntentions](../src/app/components/tarot/intention/flattenIntentions.ts) [text](../src/app/components/tarot/intention/IntentionPicker.tsx) [IntentionPicker](../src/app/components/tarot/intention/useIntentionStore.ts) [useResolvedIntention](../src/app/components/tarot/intention/useResolvedIntention.ts) [IntentionPicker](../src/app/components/tarot/intention/IntentionPicker.ts)   Created.  
- Claud made some changes. There seemed to be some duplicaiton between IntentionPicker and SelectorBar.


## 2025-08-26 0441– Code Clean Up
- Deleted questions.ts as no code was referenced in new working version.
- removed humanizeSlotKey() and makeLabel() from dealToSpread.ts
- Cleaned up hanldeGlobalClick from CardInteractions.ts
- Next Goal: New free-text intention field.


## 2025-08-26 0415 – green push
- Reset project back to functional state \
- Next goal: Code Clean -up



