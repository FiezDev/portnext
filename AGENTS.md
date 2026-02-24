# AGENTS.md - AI Agent Instructions for Portnext

## Purpose

This document provides specific instructions for AI coding agents working on the Portnext project. Follow these rules strictly to maintain code quality and consistency.

---

## 🚫 Restrictions

### Package Manager
```
❌ NEVER use: npm, yarn, pnpm
✅ ALWAYS use: bun
```

### Do NOT
- Create class components
- Use `any` type (use `unknown` if truly needed)
- Install packages without checking if similar functionality exists
- Modify `firestore.rules` or `storage.rules` without explicit request
- Change the build output mode from static export
- Add new dependencies to major version updates without confirmation

### Do NOT Auto-Update to Major Versions
These packages should stay on current major versions unless explicitly requested:
- `next` - stay on v15.x (v16 is major)
- `react` / `react-dom` - stay on v19.x
- `tailwindcss` - stay on v3.x (v4 has breaking changes)
- `zod` - stay on v3.x (v4 is major rewrite)
- `firebase` - stay on v11.x (v12 is major)
- `storybook` - stay on v8.x (v10 is major)
- `jest` - stay on v29.x (v30 is major)

---

## ✅ Coding Standards

### TypeScript
```typescript
// ✅ Good: Explicit types, strict null checks
interface Props {
  title: string;
  onClick: () => void;
  children?: ReactNode;
}

// ❌ Bad: Implicit any, loose typing
const Component = (props) => { ... }
```

### Imports
```typescript
// ✅ Use absolute imports
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ❌ Avoid relative imports for shared code
import { Button } from '../../../components/ui/button';
```

### Component Structure
```typescript
// ✅ Preferred structure
import { type FC, type ReactNode } from 'react';

interface ComponentProps {
  // props here
}

const Component: FC<ComponentProps> = ({ prop1, prop2 }) => {
  // hooks first
  // derived state
  // handlers
  // render
  return <div>...</div>;
};

export default Component;
```

### Styling with Tailwind
```typescript
// ✅ Use cn() for conditional classes
import { cn } from '@/lib/utils';

<div className={cn(
  'base-classes',
  isActive && 'active-classes',
  className
)} />

// ❌ String concatenation
<div className={`base ${isActive ? 'active' : ''}`} />
```

---

## 📁 File Placement

| Type | Location | Naming |
|------|----------|--------|
| Page components | `src/app/[route]/page.tsx` | `page.tsx` |
| Layouts | `src/app/[route]/layout.tsx` | `layout.tsx` |
| Global components | `src/components/global/` | `PascalCase.tsx` |
| Feature components | `src/components/[feature]/` | `PascalCase.tsx` |
| UI primitives | `src/components/ui/` | `lowercase.tsx` |
| Custom hooks | `src/hooks/` | `useCamelCase.ts` |
| Type definitions | `src/types/` | `camelCase.ts` |
| API services | `src/services/` | `camelCase.ts` |
| Zustand stores | `src/lib/store/` | `camelCase.ts` |
| Zod schemas | `src/lib/validations/` | `camelCase.ts` |
| Constants | `src/constants/` | `camelCase.ts` |

---

## 🔧 Common Tasks

### Adding a New Component
1. Create file in appropriate directory
2. Export as default
3. Add types inline or in `src/types/`
4. Add Storybook story if it's a UI component

### Adding a New Page
1. Create folder in `src/app/`
2. Add `page.tsx` with default export
3. Add `layout.tsx` if page needs specific layout

### Adding a Service
1. Create file in `src/services/`
2. Use axios instance from `baseApi.ts`
3. Add types for request/response

### Adding State
- **Local UI state**: `useState`
- **Form state**: React Hook Form
- **Global client state**: Zustand store in `src/lib/store/`
- **Server state**: TanStack Query hook

---

## 🧪 Testing Guidelines

```typescript
// Test file naming
Component.tsx → Component.test.tsx
useHook.ts → useHook.test.ts

// Test structure
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Component from './Component';

describe('Component', () => {
  it('should render correctly', () => {
    render(<Component />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(<Component onClick={onClick} />);
    
    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
```

---

## 🚀 Deployment Notes

- Static export to `out/` directory
- Deployable to any static host (Vercel, Netlify, Firebase Hosting)
- Images must be unoptimized for static export
- API routes not supported in static export mode

---

## 📝 Git Commit Style

```
type(scope): description

feat(portfolio): add project filtering
fix(contact): resolve form validation bug  
docs(readme): update installation steps
style(ui): improve button hover states
refactor(hooks): simplify useWindowSize
test(services): add contact service tests
chore(deps): update dependencies
```

---

## ⚠️ Before Making Changes

1. **Read existing code** in the area you're modifying
2. **Check for existing utilities** before creating new ones
3. **Verify imports** use the `@/` prefix
4. **Run tests** after changes: `bun test`
5. **Check lint**: `bun lint`
