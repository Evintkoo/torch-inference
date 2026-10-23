// Copyright (c) 2026 Torviello.
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["node_modules/**", "coverage/**", "dist/**", "target/**", "**/target/**"]
  },
  ...tseslint.configs.recommended,
  {
    files: ["torviello-landing/web/**/*.{ts,tsx}"],
    rules: {
      "max-lines": ["warn", 300],
      "max-params": ["warn", 5],
      "complexity": ["warn", 12]
    }
  }
);
