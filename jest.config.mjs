import nextJest from 'next/jest.js';

const createJestConfig = nextJest({ dir: './' });

/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};

// react-markdown@10 + remark-gfm@4 ship ESM-only, and their transitive dep
// tree (hast-util-*, mdast-util-*, micromark-*, html-url-attributes, ...) is
// large. Next 16's next/jest CONCATENATES its default transformIgnorePatterns
// with the user's (rather than replacing), so a per-package allowlist can't
// un-ignore modules the default already matches. Post-process the resolved
// config to REPLACE the list with one that lets SWC transform ALL of
// node_modules (only CSS modules stay ignored). The repo's test suite is
// small, so the extra transform cost is negligible.
const nextConfigFn = createJestConfig(config);

export default async () => {
  const resolved = await nextConfigFn();
  resolved.transformIgnorePatterns = ['^.+\\.module\\.(css|sass|scss)$'];
  return resolved;
};
