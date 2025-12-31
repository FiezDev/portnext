#!/usr/bin/env node

/**
 * Package Manager Guard
 * Prevents usage of npm, yarn, or pnpm in this project.
 * Only Bun is allowed as the package manager.
 */

const userAgent = process.env.npm_config_user_agent || '';

const isBun = userAgent.startsWith('bun');
const isNpm = userAgent.startsWith('npm');
const isYarn = userAgent.startsWith('yarn');
const isPnpm = userAgent.startsWith('pnpm');

if (!isBun && (isNpm || isYarn || isPnpm)) {
  const detected = isNpm ? 'npm' : isYarn ? 'yarn' : 'pnpm';
  console.error(`
╔═══════════════════════════════════════════════════════════════╗
║                    ⛔ WRONG PACKAGE MANAGER                    ║
╠═══════════════════════════════════════════════════════════════╣
║  This project uses Bun as the package manager.                ║
║  You tried to use: ${detected.padEnd(42)}║
║                                                               ║
║  Please install Bun and use it instead:                       ║
║  → curl -fsSL https://bun.sh/install | bash                   ║
║  → bun install                                                ║
╚═══════════════════════════════════════════════════════════════╝
`);
  process.exit(1);
}
