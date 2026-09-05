import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";


/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "out/**",
      "storybook-static/**",
      "coverage/**",
      "tools/**",
      "scripts/**",
    ],
  },
  ...nextCoreWebVitals,
  ...nextTs,
  {
    rules: Object.fromEntries(
      [
        "refs",
        "set-state-in-effect",
        "set-state-in-render",
        "purity",
        "globals",
        "preserve-manual-memoization",
        "incompatible-library",
        "immutability",
        "memoized-effect-dependencies",
        "exhaustive-effect-dependencies",
      ].map((r) => [
        `react-hooks/${r}`,
        "warn",
      ])
    ),
  },
];
