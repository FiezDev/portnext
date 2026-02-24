# CLAUDE.md - AI Assistant Guidelines for Portnext

## Project Overview

**Portnext** is a personal portfolio website built with modern web technologies. This is Ittipol's portfolio showcasing development work and personal profile.

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 15 (App Router, Static Export) |
| **Language** | TypeScript 5.9 |
| **UI Library** | React 19 |
| **Styling** | Tailwind CSS 3.4 + tailwindcss-animate |
| **State Management** | Zustand 5, TanStack Query 5 |
| **Forms** | React Hook Form 7 + Zod validation |
| **Icons** | FontAwesome 6, Lucide React |
| **UI Components** | Radix UI (Toast, Slot) |
| **Carousel** | Embla Carousel |
| **Backend** | Firebase (Firestore, Storage) |
| **Testing** | Jest 29 + React Testing Library |
| **Storybook** | Storybook 8.6 |
| **Linting** | ESLint 9 (flat config) |
| **Package Manager** | **Bun** (required) |

## Project Structure

```
portnext/
├── src/
│   ├── app/           # Next.js App Router pages
│   │   ├── layout.tsx # Root layout with providers
│   │   ├── page.tsx   # Home page
│   │   ├── admin/     # Admin dashboard
│   │   ├── blog/      # Blog section
│   │   ├── portfolio/ # Portfolio showcase
│   │   └── work/      # Work experience
│   ├── components/
│   │   ├── global/    # Shared components (Button, Heading, etc.)
│   │   ├── portfolio/ # Portfolio-specific components
│   │   └── ui/        # shadcn/ui components
│   ├── constants/     # Enums, mappings, storage keys
│   ├── hooks/         # Custom React hooks
│   ├── layout/        # Layout components
│   ├── lib/           # Utilities, providers, configs
│   │   ├── config/    # App configuration
│   │   ├── firebase/  # Firebase setup
│   │   ├── store/     # Zustand stores
│   │   └── validations/ # Zod schemas
│   ├── mocks/         # Mock data for testing/dev
│   ├── services/      # API service layer
│   ├── styles/        # Global CSS
│   └── types/         # TypeScript type definitions
├── public/            # Static assets
├── scripts/           # Build/utility scripts
└── nextjs/            # Next.js build cache
```

## Commands

```bash
# Development
bun dev              # Start dev server with Turbopack
bun build            # Production build (static export)
bun start            # Serve production build

# Testing
bun test             # Run Jest tests
bun test:watch       # Watch mode
bun test:coverage    # Coverage report

# Code Quality
bun lint             # ESLint check

# Storybook
bun storybook        # Dev server on port 6006
bun build-storybook  # Build static Storybook
```

## Critical Rules

### Package Manager
- **ONLY use Bun** - npm, yarn, and pnpm are blocked
- Run `bun install` for dependencies
- Lock file: `bun.lockb` (binary)

### Code Style
- Follow **SOLID principles**
- Apply **DRY** (Don't Repeat Yourself)
- Keep it **KISS** (Keep It Simple, Stupid)
- TypeScript strict mode enabled
- Use absolute imports with `@/` prefix

### Component Guidelines
- Functional components only (no class components)
- Use custom hooks for reusable logic
- Prefer composition over inheritance
- Keep components small and focused (SRP)

### State Management
- **Zustand** for global client state
- **TanStack Query** for server state/caching
- **React Hook Form** for form state
- Avoid prop drilling - use context or stores

### Styling
- **Tailwind CSS** for all styling
- Use `cn()` utility from `@/lib/utils` for class merging
- Custom colors defined in `tailwind.config.ts`
- Dark mode support via `next-themes` (currently disabled)

### File Naming
- Components: `PascalCase.tsx`
- Hooks: `useCamelCase.ts`
- Types: `camelCase.ts`
- Constants: `camelCase.ts`

### Testing
- Place tests in `__tests__` folders or with `.test.ts(x)` suffix
- Use React Testing Library patterns
- Test behavior, not implementation

## Build Configuration

- **Output**: Static export (`output: 'export'`)
- **Images**: Unoptimized (for static hosting)
- **ESLint**: Ignored during builds

## Firebase Integration

- Firestore for data storage
- Firebase Storage for file uploads
- Security rules in `firestore.rules` and `storage.rules`
- Server config in `firebaseServer.js`

## Environment

- Node.js >= 22 required
- Development uses Turbopack for faster HMR
- React Scan enabled in development for debugging
