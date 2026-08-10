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

const radiusRules = (severity) => ({
  "no-restricted-syntax": [
    severity,
    {
      selector: `JSXAttribute[name.name="className"] Literal[value=/${RADIUS_SCALE}/]`,
      message:
        "Corner radius is a design-system decision. Use <SsCard> or an .ss-* class; rounded-full and rounded-none are still fine.",
    },
    {
      selector: `JSXAttribute[name.name="className"] TemplateElement[value.raw=/${RADIUS_SCALE}/]`,
      message:
        "Corner radius is a design-system decision. Use <SsCard> or an .ss-* class; rounded-full and rounded-none are still fine.",
    },
  ],
});

/**
 * Ground that is clean today and must stay clean. Grows one entry per migrated
 * surface — that growth IS the migration's definition of done.
 */
const ENFORCED_PATHS = [
  "src/components/ui/ss-card.tsx",
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
