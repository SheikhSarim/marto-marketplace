import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    ignores: [".next/**", "node_modules/**", "dist/**", "out/**", ".aistudio/**"],
  },
  {
    rules: {
      "no-unused-vars": "off",
      "no-undef": "off",
    },
  },
]);
