## Problem

`/blueprint` crashes with React error #31 ("Objects are not valid as a React child") on the object `{fullTitle, light, shadow, insight, think, act, react}`.

## Root cause (verified)

`src/components/blueprint/BlueprintOverview.tsx` builds each row with:

```ts
description: desc("mbtiDescriptions", mbti)  // etc.
```

But `desc(...)` calls `getPersonalityDescription(...)` which returns an **object** (`{ fullTitle, light, shadow, insight, think?, act?, react? }`), not a string. The row is then rendered directly:

```tsx
<div ...>{r.description}</div>
```

React refuses to render the object → crash. This started showing now because translations for several keys resolved to real objects (see console: `humanDesignDescriptions.projector`, `sunSignDescriptions.aquarius`, etc. all logged as `isObject: true`).

Note: `SimplifiedBlueprintViewer.tsx` already handles the object correctly (spreads `...desc` into a modal and reads `desc.fullTitle`, `desc.light`, etc.), so no change needed there.

## Fix (UI-only, single file)

In `src/components/blueprint/BlueprintOverview.tsx`:

1. Extract the short summary string from the description object before assigning it to `Row.description`. Use `insight` as the one-line summary (matches the compact usage in `PersonalityDescription.tsx`), falling back to `fullTitle` if `insight` is empty.
2. Add a small helper, e.g.:
   ```ts
   const descText = (category: string, value: string | number): string => {
     const d = getPersonalityDescription(t, category, value, language);
     return d?.insight || d?.fullTitle || "";
   };
   ```
3. Replace every `desc(...)` call inside the `rows` array with `descText(...)`. Keep the plain-English MBTI fallback string as-is.

No changes to services, hooks, translation files, or other components. No behavioral changes beyond rendering the correct string.

## Verification

- Reload `/blueprint` in the preview at 390×844 — page renders instead of crashing.
- Each row shows the localized `insight` sentence under the value.
- Console no longer shows the minified React #31 error.