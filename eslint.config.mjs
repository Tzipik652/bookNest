// eslint.config.mjs
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import reactPlugin from "eslint-plugin-react";

export default [
  // צד לקוח - React + Vite
  {
    files: ["client/**/*.{js,ts,jsx,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
      globals: {
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
      },
    },
    plugins: {
      react: reactPlugin,
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      "no-unused-vars": "warn",
      "react/prop-types": "off"
    }
  },

  // צד שרת - Node + TS
  {
    files: ["server/**/*.{js,ts}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: "module",
      },
      globals: {
        require: "readonly",
        module: "readonly",
        __dirname: "readonly",
        process: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      "no-unused-vars": "warn"
    }
  }
];
