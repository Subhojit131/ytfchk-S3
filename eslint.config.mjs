import globals from "globals";
import pluginJs from "@eslint/js";
import prettier from "eslint-config-prettier";
import pluginPrettier from "eslint-plugin-prettier";

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  {
    languageOptions: {
      globals: {
        ...globals.browser, // Correctly applies browser globals
        chrome: "readonly", //explicitly add chrome
      },
      ecmaVersion: "latest",
      sourceType: "module",
    },
    files: ["src/**/*.js", "src/**/*.mjs"],
  },
  pluginJs.configs.recommended,
  {
    plugins: { prettier: pluginPrettier },
    rules: {
      "no-unused-vars": "warn",
      semi: ["error", "always"],
      quotes: ["error", "single"],
      eqeqeq: "error",
      "prettier/prettier": "error", // Enforce Prettier as an ESLint rule
    },
  },
  prettier, // Disables ESLint rules that conflict with Prettier
];
