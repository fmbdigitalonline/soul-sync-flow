import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

/**
 * One card, one radius.
 *
 * `.ss-card` has defined the card for a while — 24px radius, 20px padding, a
 * 1px line, one shadow — but nothing stopped a screen re-deciding it locally.
 * The app grew five corner radii, four paddings, two card components and a long
 * tail of hand-rolled divs, and every page ended up with slightly different
 * edges.
 *
 * This rule bans the radius SCALE in className. `rounded-full` and
 * `rounded-none` are untouched: those are shape decisions (a chip is a pill, an
 * avatar is a circle), not the "pick your own corner" problem. Use `SsCard`, or
 * the `.ss-*` classes, for surfaces.
 *
 * It is an error inside ENFORCED_PATHS and a warning everywhere else. The
 * warning makes the ~1,000 existing drift points visible without blocking a
 * build on work nobody has scheduled; the error keeps clean ground clean. Each
 * surface that gets migrated adds its directory to ENFORCED_PATHS, so the rule
 * ratchets forward and cannot slide back.
 */
const RADIUS_SCALE = "rounded-(?:sm|md|lg|xl|2xl|3xl)";

const SURFACE_MESSAGE =
  "Corner radius is a design-system decision. Use <SsCard> or an .ss-* class; rounded-full and rounded-none are still fine.";

/**
 * The second half of the same problem, and the one the class rule cannot see.
 *
 * Profile and Blueprint both use .ss-card and still did not match, because a
 * card can be re-decided inline: style={{ padding: 16 }} sails past any rule
 * about className. That is how the app ended up with five hand-written radii
 * (10, 11, 12, 13, 14) inside files that were already "on the system".
 *
 * A literal number or px string here is the violation. var(--ss-*) is not.
 */
const INLINE_LITERAL = "^(?:[0-9]|.*px)";

const radiusRules = (severity) => ({
  "no-restricted-syntax": [
    severity,
    {
      selector: `JSXAttribute[name.name="style"] Property[key.name=/^(borderRadius|padding)$/] > Literal[value=/${INLINE_LITERAL}/]`,
      message:
        "Hand-written radius/padding. Use var(--ss-radius), --ss-radius-sm, --ss-pad or --ss-pad-sm so surfaces stay in step.",
    },
    {
      selector: `JSXAttribute[name.name="style"] Property[key.name=/^(borderRadius|padding)$/] > Literal[raw=/^[0-9]/]`,
      message:
        "Hand-written radius/padding. Use var(--ss-radius), --ss-radius-sm, --ss-pad or --ss-pad-sm so surfaces stay in step.",
    },
    {
      selector: `JSXAttribute[name.name="className"] Literal[value=/${RADIUS_SCALE}/]`,
      message: SURFACE_MESSAGE,
    },
    {
      selector: `JSXAttribute[name.name="className"] TemplateElement[value.raw=/${RADIUS_SCALE}/]`,
      message: SURFACE_MESSAGE,
    },
  ],
});

/**
 * Ground that is clean today and must stay clean. Grows one entry per migrated
 * surface — that growth IS the migration's definition of done.
 */
const ENFORCED_PATHS = [
  "src/components/ui/ss-card.tsx",
  // Phase A, first pass: the surfaces the founder photographed. Every inline
  // radius and padding in these now names a token.
  "src/components/blueprint/BlueprintOverview.tsx",
  "src/components/blueprint/PersonalityDescription.tsx",
  "src/components/blueprint/PersonalityDetailModal.tsx",
  "src/components/journey/AlignmentDetail.tsx",
  "src/components/journey/AlignmentSection.tsx",
  "src/components/journey/TurningPoints.tsx",
  // Phase A, pass 2: the shell every screen sits inside.
  "src/components/Layout/**/*.tsx",
  // Phase A, pass 3: the blueprint surface — the screen that started this.
  "src/components/blueprint/**/*.tsx",
  // Phase A, passes 4 and 5.
  "src/components/dashboard/**/*.tsx",
  "src/components/growth/**/*.tsx",
  "src/components/bedtime/**/*.tsx",
  "src/components/context/**/*.tsx",
  "src/components/feedback/**/*.tsx",
  "src/components/funnel/**/*.tsx",
  "src/contexts/**/*.tsx",
];

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "@typescript-eslint/no-unused-vars": "off",
      // Visible everywhere, blocking nowhere: the drift is real and large, and a
      // rule that fails the build on day one just gets switched off.
      ...radiusRules("warn"),
    },
  },
  {
    files: ENFORCED_PATHS,
    rules: radiusRules("error"),
  }
);
