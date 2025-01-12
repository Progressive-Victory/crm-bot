import { FlatCompat } from "@eslint/eslintrc";
import stylistic from "@stylistic/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import jsdoc from "eslint-plugin-jsdoc";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({ resolvePluginsRelativeTo: __dirname });

export default [
  ...compat.env({
    node: true,
    es2020: true,
    browser: true,
  }),
  ...compat.plugins("@typescript-eslint", "eslint-plugin-import"),
  jsdoc.configs["flat/recommended-typescript"],
  {
    files: ["**/*.ts", "**/*.js"],
    ignores: ["**/dist/*"],
    languageOptions: {
      parser: tsParser,
      parserOptions: { ecmaVersion: "latest" },
    },
    plugins: { "@stylistic": stylistic },
    rules: {
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/type-annotation-spacing": [
        "error",
        {
          before: false,
          after: true,
          overrides: {
            arrow: {
              before: true,
              after: true,
            },
          },
        },
      ],

      "class-methods-use-this": 0,
      "max-classes-per-file": "off",
      "no-await-in-loop": "off",
      "no-bitwise": "off",
      "no-console": "off",
      "no-continue": "off",
      "no-tabs": "off",
      "no-param-reassign": 0,
      "no-plusplus": 0,
      "no-prototype-builtins": "off",
      "no-underscore-dangle": "off",
      "no-multi-assign": "off",
      "no-extend-native": "off",
      "no-restricted-syntax": "off",
      "no-unused-vars": "off",
      "no-nested-ternary": "off",
      "no-promise-executor-return": "off",
    },
  },
];
