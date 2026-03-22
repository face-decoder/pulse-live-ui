---
name: react-19-best-practices
description: >
  Apply React 19 best practices when writing, reviewing, or refactoring React components,
  hooks, forms, state, and UI logic. Use this skill whenever Claude is working with React
  components, custom hooks, context, refs, effects, concurrent features, or any React 19
  pattern. Trigger for tasks like "build a component", "refactor this hook", "add a form",
  "fix this useEffect", "manage state", "improve performance", or any mention of React,
  JSX, hooks, Suspense, transitions, or React 19 APIs.
  This skill enforces React 19 modern patterns — always use new APIs, never legacy ones.
---

# React 19 Best Practices

React 19 is a major release. It introduces new APIs, deprecates old patterns, and enables
the concurrent rendering model fully. Always use the patterns below — never fall back to
React 17/18 workarounds.

---

## 🗺️ Reference Files — Read When Needed

| Topic                    | File                             | Read When                                                 |
| ------------------------ | -------------------------------- | --------------------------------------------------------- |
| New React 19 APIs        | `references/react-19-apis.md`    | Using Actions, `useActionState`, `useOptimistic`, `use()` |
| Components & Composition | `references/components.md`       | Building components, refs, context, composition patterns  |
| Hooks — Rules & Patterns | `references/hooks.md`            | Custom hooks, `useEffect`, `useReducer`, `useMemo`        |
| Forms & Mutations        | `references/forms.md`            | Forms, controlled inputs, validation, async mutations     |
| Performance              | `references/performance.md`      | `memo`, `useMemo`, `useCallback`, `lazy`, Suspense        |
| State Management         | `references/state-management.md` | Local state, context, external stores                     |

---

## What Changed in React 19 — At a Glance

| Old Pattern (React ≤ 18)               | New Pattern (React 19)               | Status                                      |
| -------------------------------------- | ------------------------------------ | ------------------------------------------- |
| `forwardRef(Component)`                | `ref` as a regular prop              | `forwardRef` **deprecated**                 |
| `useContext(MyContext)`                | `use(MyContext)`                     | `useContext` still works, `use()` preferred |
| `useState` + manual `isLoading/error`  | `useActionState`                     | For async form/mutation state               |
| `useEffect` for async after submit     | Server Actions / async transitions   | Replace where possible                      |
| Optimistic UI via manual state         | `useOptimistic`                      | Built-in optimistic state                   |
| `ReactDOM.render()`                    | `ReactDOM.createRoot()`              | `render()` removed in React 19              |
| `React.FC` type with implicit children | Explicit `children: React.ReactNode` | `React.FC` no longer has implicit children  |
| `startTransition` (sync only)          | `startTransition(async () => {...})` | Now supports async                          |
| Context `.Consumer` render prop        | `use(Context)`                       | `.Consumer` deprecated                      |

---

## Non-Negotiable Rules

### ✅ Always Do

- Use **function components** — never class components
- Use `ref` as a **regular prop** — no `forwardRef`
- Use `useActionState` for any form with async submission
- Use `useOptimistic` for instant UI feedback on mutations
- Use `use()` to read Context and Promises
- Define `children` explicitly: `{ children: React.ReactNode }`
- Use `startTransition` for non-urgent state updates
- Use `Suspense` boundaries around async/lazy content
- Use `useId` for accessible label/input associations
- Keep components **small and focused** — one responsibility per component

### ❌ Never Do

- Class components (no `extends React.Component`)
- `forwardRef` wrapper — pass `ref` directly as a prop
- `useEffect` for data fetching — use `use()` + Suspense or React Query
- `useEffect` for event-driven side effects — call in the handler directly
- Mutate state directly: `state.items.push(x)` — always return new references
- `ReactDOM.render()` — use `createRoot()` only
- `React.FC` with assumed children — type children explicitly
- `Context.Consumer` — use `use(Context)` instead
- Store derived data in `useState` when it can be computed during render

---

## Component Anatomy (React 19)

```tsx
import { use, useActionState, useOptimistic, useTransition, memo } from 'react'

// ✅ Modern React 19 component — no forwardRef, ref as prop
interface ButtonProps {
  label: string
  onClick?: () => void
  ref?: React.Ref<HTMLButtonElement> // ref is a normal prop
  children?: React.ReactNode // explicit children
  className?: string
  disabled?: boolean
}

function Button({
  label,
  onClick,
  ref,
  children,
  className,
  disabled,
}: ButtonProps) {
  return (
    <button
      ref={ref}
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {children ?? label}
    </button>
  )
}

export default memo(Button) // memoize reusable UI components
```

---

## TypeScript Conventions

```tsx
// ✅ Explicit children
interface CardProps {
  title: string
  children: React.ReactNode // never omit this
}

// ✅ Event handler types
interface InputProps {
  onChange: (value: string) => void
  onBlur?: React.FocusEventHandler<HTMLInputElement>
}

// ✅ Generic components
interface ListProps<T> {
  items: T[]
  renderItem: (item: T) => React.ReactNode
  keyExtractor: (item: T) => string
}
function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <ul>
      {items.map((item) => (
        <li key={keyExtractor(item)}>{renderItem(item)}</li>
      ))}
    </ul>
  )
}

// ✅ Discriminated union for variant components
type AlertProps =
  | { variant: 'success'; message: string }
  | { variant: 'error'; message: string; onRetry: () => void }
  | { variant: 'info'; message: string; dismissible?: boolean }
```

---

## Folder & File Conventions

```
└── src/
    ├── components/
    │   ├── common/
    │   │   ├── empty-state/
    │   │   │   ├── empty-state.tsx
    │   │   │   └── index.ts
    │   │   └── error-state/
    │   │       ├── error-state.tsx
    │   │       └── index.ts
    │   ├── forms/
    │   │   └── fields/
    │   │       ├── form-text-field.tsx
    │   │       ├── form-number-field.tsx
    │   │       └── index.ts
    │   └── ui/
    │       ├── button.tsx
    │       ├── input.tsx
    │       └── ...
    ├── features/
    │   └── [key]/
    │       ├── components/
    │       │   └── [key]-xxx.tsx
    │       ├── constants/
    │       │   └── index.ts
    │       ├── services/
    │       │   └── use-get-[key].ts
    │       ├── schemas/
    │       │   └── [key].schema.ts
    │       ├── hooks/
    │       │   └── use-[key].ts
    │       └── types/
    │           └── index.ts
    ├── hooks/
    │   ├── use-debounce.ts
    │   └── use-storage.ts
    ├── stores/
    │   ├── use-xxx-store.ts
    │   └── use-yyy-store.ts
    └── lib/
        └── http/
            └── index.ts
```

---

## For Deeper Topics

Read the relevant reference file before writing code:

- **React 19 new APIs?** → `references/react-19-apis.md`
- **Building components, refs, context?** → `references/components.md`
- **Writing or fixing hooks?** → `references/hooks.md`
- **Optimizing performance?** → `references/performance.md`
- **Routes?** → `references/routes.md`
- **Managing state?** → `references/state-management.md`
