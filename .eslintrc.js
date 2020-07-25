module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module"
  },
  env: {
    es6: true,
    browser: true
  },
  plugins: ["svelte3", "@typescript-eslint"],
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  overrides: [
    {
      files: ["*.svelte"],
      processor: "svelte3/svelte3"
    }
  ],
  rules: {
    "quotes": ["error", "double", { avoidEscape: true }],
    "multiline-ternary": "off",
    "max-len": ["error", 80, 2],
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "no-process-exit": ["error"]
  }
}