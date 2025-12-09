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
      "unused-imports": unusedImports,
    },
    rules: {
      "react/prop-types": "off",

      // מכבים את הכללים הרגילים כדי למנוע כפילויות
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",

      // --- הגדרות לאזהרה בלבד (Warning) ---
      
      // אזהרה על imports שלא בשימוש (צבע צהוב)
      "unused-imports/no-unused-imports": "warn",
      
      // אזהרה על משתנים שלא בשימוש (צבע צהוב)
      "unused-imports/no-unused-vars": [
        "warn",
        {
          "vars": "all",
          "varsIgnorePattern": "^_",
          "args": "after-used",
          "argsIgnorePattern": "^_",
        },
      ],
    },
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
      "unused-imports": unusedImports,
    },
   rules: {
      // גם בשרת - מכבים את הרגיל
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",

      // --- הגדרות לאזהרה בלבד (Warning) ---
      
      "unused-imports/no-unused-imports": "warn",
      
      "unused-imports/no-unused-vars": [
        "warn",
        {
          "vars": "all",
          "varsIgnorePattern": "^_",
          "args": "after-used",
          "argsIgnorePattern": "^_",
        },
      ],
    },
  }
];
