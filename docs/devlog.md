# Dev Log

Quick running notes of what was happening at each commit or push.  
(Doesn’t need to be fancy—just a couple of lines helps.)

---

## 2025-08-26 0415 – green push
- Reset project back to functional state \
- Next goal: Code Clean -up

## 2025-08-26 0441– Code Clean Up
- Deleted questions.ts as no code was referenced in new working version.
- removed humanizeSlotKey() and makeLabel() from dealToSpread.ts
- Cleaned up hanldeGlobalClick from CardInteractions.ts
- Next Goal: New free-text intention field.

## 2025-08-26 0537– Intention Free-Text
[flattenIntentions](../src/app/components/tarot/intention/flattenIntentions.ts) [text](../src/app/components/tarot/intention/IntentionPicker.tsx) [IntentionPicker](../src/app/components/tarot/intention/useIntentionStore.ts) [useResolvedIntention](../src/app/components/tarot/intention/useResolvedIntention.ts) [IntentionPicker](../src/app/components/tarot/intention/IntentionPicker.ts)   Created.  
- Claud made some changes. There seemed to be some duplicaiton between IntentionPicker and SelectorBar.
