import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tailwindcss from "eslint-plugin-tailwindcss";
import tseslint from "typescript-eslint";

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
      "tailwindcss": tailwindcss,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "@typescript-eslint/no-unused-vars": "off",
      
      // ============= GOLDEN STANDARD ENFORCEMENT =============
      // Forbid legacy color usage - enforce semantic tokens
      "tailwindcss/no-custom-classname": ["error", {
        "whitelist": [
          // Allow only Golden Standard semantic tokens
          "font-display", "font-body", "font-cormorant", "font-inter",
          "text-main", "text-secondary", "text-muted", "text-subtle", "text-on-brand", "text-on-dark", "text-disabled",
          "surface", "surface-elevated", "surface-sunken", "surface-overlay",
          "success", "success-light", "warning", "warning-light", "error", "error-light", "info", "info-light",
          "border-default", "border-muted", "border-subtle", "border-focus", "border-error",
          "space-xs", "space-sm", "space-md", "space-lg", "space-xl", "space-2xl", "space-3xl",
          "component-xs", "component-sm", "component-md", "component-lg", "component-xl",
          "layout-xs", "layout-sm", "layout-md", "layout-lg", "layout-xl", "layout-2xl",
          "bg-gradient-brand", "bg-gradient-brand-radial"
        ]
      }],
      
      // Forbid hardcoded spacing, colors, fonts
      "tailwindcss/enforces-negative-arbitrary-values": "error",
      "tailwindcss/enforces-shorthand": "error",
      "tailwindcss/no-arbitrary-value": ["error", {
        "severity": "error"
      }]
    },
  }
);
