---
name: hooks-best-practices
description: >
  React 19 Hooks patterns including use(), useActionState, useOptimistic,
  custom hooks, and dependency management. Use when implementing component logic.
---

# React 19 Hooks Best Practices Skill

This skill covers React 19 Hooks patterns, new APIs (`use()`, `useActionState`, `useOptimistic`),
custom hooks, dependency management, and effect cleanup.

## When to Use

Use this skill when:

- Reading promises or context with `use()`
- Handling async form/mutation state with `useActionState`
- Implementing optimistic UI with `useOptimistic`
- Writing custom hooks
- Managing component state
- Handling side effects and cleanup
- Optimizing with memoization

## Core Principle

**EXTRACT AND REUSE** — Extract reusable logic into custom hooks. Keep components focused on rendering.

---

## React 19 New Hooks

### `use()` — Read Promises and Context

`use()` is the **only hook** that can be called inside conditions, loops, and nested functions.

#### Reading a Promise (with Suspense)

```typescript
import { use, Suspense } from 'react'

interface User {
  id: string
  name: string
  email: string
}

// Parent: start fetch, pass promise down
function UserPage({ userId }: { userId: string }) {
  const userPromise = fetchUser(userId) // no await — pass the promise

  return (
    <Suspense fallback={<UserSkeleton />}>
      <UserProfile userPromise={userPromise} />
    </Suspense>
  )
}

// Child: suspends until promise resolves
function UserProfile({ userPromise }: { userPromise: Promise<User> }) {
  const user = use(userPromise) // suspends here

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  )
}
```

#### Reading Context Conditionally

```typescript
import { use } from 'react'
import { ThemeContext } from './ThemeContext'

// use() can be called inside conditions — unlike useContext()
function ThemedButton({ isThemed, children }: { isThemed: boolean; children: React.ReactNode }) {
  if (isThemed) {
    const theme = use(ThemeContext) // ✅ conditional use() is allowed
    return <button style={{ background: theme.primary }}>{children}</button>
  }
  return <button>{children}</button>
}
```

#### ❌ Old Pattern vs ✅ New Pattern

```typescript
// ❌ React 18 — useContext cannot be conditional
import { useContext } from 'react'
const theme = useContext(ThemeContext) // must be at top level

// ✅ React 19 — use() replaces useContext, can be conditional
import { use } from 'react'
const theme = use(ThemeContext)
```

---

### `useActionState` — Async Action State

Replaces the `useState` + manual `isLoading` + `error` pattern for async actions.

```typescript
import { useActionState } from 'react'

type FormState = { error?: string; success?: boolean }

async function submitForm(prevState: FormState, formData: FormData): Promise<FormState> {
  const name = formData.get('name') as string
  if (!name || name.length < 2) return { error: 'Name too short' }

  try {
    await api.createUser({ name })
    return { success: true }
  } catch {
    return { error: 'Something went wrong' }
  }
}

function CreateUserForm() {
  const [state, action, isPending] = useActionState(submitForm, {})

  return (
    <form action={action}>
      <input name="name" disabled={isPending} />
      {state.error && <p className="error">{state.error}</p>}
      {state.success && <p className="success">User created!</p>}
      <button type="submit" disabled={isPending}>
        {isPending ? 'Submitting...' : 'Create'}
      </button>
    </form>
  )
}
```

**Key points:**

- `action` goes directly on `<form action={...}>` — no `onSubmit` needed
- `isPending` tracks async state automatically
- `prevState` receives the previous returned value
- Works with any async function, not just server actions

---

### `useOptimistic` — Optimistic UI

Show immediate feedback before async operation confirms.

```typescript
import { useOptimistic, useTransition } from 'react'

interface Todo {
  id: string
  text: string
  completed: boolean
}

function TodoList({ initialTodos }: { initialTodos: Todo[] }) {
  const [isPending, startTransition] = useTransition()
  const [todos, setOptimisticTodo] = useOptimistic(
    initialTodos,
    (current, updatedTodo: Todo) =>
      current.map((t) => (t.id === updatedTodo.id ? updatedTodo : t)),
  )

  async function handleToggle(todo: Todo) {
    startTransition(async () => {
      setOptimisticTodo({ ...todo, completed: !todo.completed }) // instant
      await api.updateTodo(todo.id, { completed: !todo.completed }) // server
    })
  }

  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id} style={{ opacity: isPending ? 0.7 : 1 }}>
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => handleToggle(todo)}
          />
          {todo.text}
        </li>
      ))}
    </ul>
  )
}
```

---

## Custom Hook Patterns

### Basic Custom Hook

```typescript
import { useState, useCallback } from 'react'

interface UseToggleReturn {
  value: boolean
  toggle: () => void
  setTrue: () => void
  setFalse: () => void
}

export function useToggle(initialValue = false): UseToggleReturn {
  const [value, setValue] = useState(initialValue)

  const toggle = useCallback(() => setValue((v) => !v), [])
  const setTrue = useCallback(() => setValue(true), [])
  const setFalse = useCallback(() => setValue(false), [])

  return { value, toggle, setTrue, setFalse }
}
```

### Debounce Hook

```typescript
import { useState, useEffect } from 'react'

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
```

### Local Storage Hook

```typescript
import { useState, useCallback } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const next =
          typeof value === 'function' ? (value as (p: T) => T)(prev) : value
        localStorage.setItem(key, JSON.stringify(next))
        return next
      })
    },
    [key],
  )

  return [storedValue, setValue] as const
}
```

### Form Hook

```typescript
import { useState, useCallback, ChangeEvent, FormEvent } from 'react'

interface UseFormReturn<T> {
  values: T
  errors: Partial<Record<keyof T, string>>
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void
  handleSubmit: (onSubmit: (values: T) => void) => (e: FormEvent) => void
  reset: () => void
  setFieldValue: (field: keyof T, value: T[keyof T]) => void
}

export function useForm<T extends Record<string, unknown>>(
  initialValues: T,
): UseFormReturn<T> {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setValues((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }, [])

  const handleSubmit = useCallback(
    (onSubmit: (values: T) => void) => (e: FormEvent) => {
      e.preventDefault()
      onSubmit(values)
    },
    [values],
  )

  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({})
  }, [initialValues])

  const setFieldValue = useCallback((field: keyof T, value: T[keyof T]) => {
    setValues((prev) => ({ ...prev, [field]: value }))
  }, [])

  return { values, errors, handleChange, handleSubmit, reset, setFieldValue }
}
```

> **Note:** For async form submissions, prefer `useActionState` over manual `useState` + `isLoading` patterns.

---

## Dependency Array Management

### Correct Dependencies

```typescript
// ✅ All dependencies included
useEffect(() => {
  fetchUser(userId)
}, [userId])

// ✅ Stable callback with useCallback
const handleClick = useCallback(() => {
  onClick(id)
}, [onClick, id])

useEffect(() => {
  document.addEventListener('click', handleClick)
  return () => document.removeEventListener('click', handleClick)
}, [handleClick])
```

### Common Mistakes

```typescript
// ❌ Missing dependency
useEffect(() => {
  fetchUser(userId) // userId not in deps
}, [])

// ❌ Object/array causing infinite loops
useEffect(() => {
  doSomething(options) // options is new object each render
}, [options])

// ✅ Fix: Use useMemo or extract values
const { page, limit } = options
useEffect(() => {
  doSomething({ page, limit })
}, [page, limit])
```

### Stable References

```typescript
// ❌ Function recreated each render
function Component({ onSave }: { onSave: (data: Data) => void }) {
  useEffect(() => {
    const handler = () => onSave(data)
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [onSave, data]) // onSave might change every render
}

// ✅ Use useRef to store latest callback (avoids stale closures)
function Component({ onSave }: { onSave: (data: Data) => void }) {
  const onSaveRef = useRef(onSave)
  onSaveRef.current = onSave

  useEffect(() => {
    const handler = () => onSaveRef.current(data)
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [data]) // Stable reference
}
```

---

## `useEffect` — Use Sparingly

`useEffect` is for **synchronizing with external systems** — not for reacting to state changes or fetching data.

### When to Use `useEffect`

- Subscribing to external events (WebSocket, EventEmitter, `window` events)
- Manually managing third-party DOM libraries
- Starting/stopping timers based on mount state

### When NOT to Use `useEffect`

| Anti-pattern                   | Right approach (React 19)              |
| ------------------------------ | -------------------------------------- |
| Fetching data on mount         | `use()` + Suspense, or TanStack Query  |
| Computing derived state        | Compute during render / `useMemo`      |
| Reacting to user events        | Call logic directly in event handler   |
| Resetting state on prop change | Derive from props, or use `key` prop   |
| Syncing two states together    | Lift state up / single source of truth |
| Form async submission          | `useActionState`                       |

### Effect Cleanup (Subscriptions)

```typescript
// ✅ WebSocket subscription with cleanup
useEffect(() => {
  const ws = new WebSocket('wss://api.example.com/live')
  ws.onmessage = (e) => setMessage(JSON.parse(e.data))
  return () => ws.close()
}, [])
```

### Abort Controller for Fetch

```typescript
// Only use when you CANNOT use use() + Suspense or TanStack Query
useEffect(() => {
  const controller = new AbortController()

  async function fetchData(): Promise<void> {
    try {
      const response = await fetch(url, { signal: controller.signal })
      const data = await response.json()
      setData(data)
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err)
      }
    }
  }

  fetchData()
  return () => controller.abort()
}, [url])
```

### Timer Cleanup

```typescript
useEffect(() => {
  const timerId = setInterval(() => {
    setCount((c) => c + 1)
  }, 1000)

  return () => clearInterval(timerId)
}, [])
```

---

## Memoization Patterns

### useMemo for Expensive Computations

```typescript
const sortedItems = useMemo(() => {
  return items.slice().sort((a, b) => a.name.localeCompare(b.name))
}, [items])

const filteredData = useMemo(() => {
  return data.filter((item) => item.status === filter)
}, [data, filter])
```

### useCallback for Stable Functions

```typescript
// ✅ Stable function for child components
const handleSelect = useCallback(
  (id: string) => {
    setSelectedId(id)
    onSelect?.(id)
  },
  [onSelect],
)

// ✅ Stable function for effects
const fetchData = useCallback(async () => {
  const result = await api.getData(params)
  setData(result)
}, [params])
```

### When NOT to Memoize

```typescript
// ❌ Premature optimization
const name = useMemo(() => `${firstName} ${lastName}`, [firstName, lastName])

// ✅ Simple computation — no memoization needed
const name = `${firstName} ${lastName}`

// ❌ Memoizing primitives
const isActive = useMemo(() => status === 'active', [status])

// ✅ Direct comparison
const isActive = status === 'active'
```

---

## Hook Rules (React 19 Update)

1. **Only call at top level** — Not in loops, conditions, or nested functions
   - **Exception:** `use()` CAN be called conditionally (inside `if`, loops, etc.)
2. **Only call in React functions** — Components or custom hooks
3. **Start with 'use'** — Custom hook naming convention
4. **Keep hooks pure** — Same inputs = same outputs

```typescript
// ❌ Conditional hook call (all hooks except use())
function Component({ shouldFetch }: { shouldFetch: boolean }) {
  if (shouldFetch) {
    const data = useQuery(fetchData) // Error!
  }
}

// ✅ Always call, conditionally use
function Component({ shouldFetch }: { shouldFetch: boolean }) {
  const data = useQuery(fetchData, { enabled: shouldFetch })
}

// ✅ use() CAN be conditional (unique exception in React 19)
function Component({ showTheme }: { showTheme: boolean }) {
  if (showTheme) {
    const theme = use(ThemeContext) // ✅ allowed!
    return <div style={{ color: theme.primary }}>Themed</div>
  }
  return <div>Default</div>
}
```

---

## Testing Custom Hooks

```typescript
import { renderHook, act } from '@testing-library/react'
import { useToggle } from '../useToggle'

describe('useToggle', () => {
  it('initializes with false by default', () => {
    const { result } = renderHook(() => useToggle())

    expect(result.current.value).toBe(false)
  })

  it('toggles value', () => {
    const { result } = renderHook(() => useToggle())

    act(() => {
      result.current.toggle()
    })

    expect(result.current.value).toBe(true)
  })
})
```

---

## Best Practices Summary

1. **Use `use()` for promises and context** — Replaces `useContext`, enables conditional reads
2. **Use `useActionState` for async forms** — Replaces manual `useState` + `isLoading` + `error`
3. **Use `useOptimistic` for instant UI** — Built-in optimistic state updates
4. **Avoid `useEffect` for data fetching** — Use `use()` + Suspense or TanStack Query
5. **Extract reusable logic** — Create custom hooks
6. **Include all dependencies** — Let ESLint guide you
7. **Use stable references** — `useCallback`, `useMemo`, `useRef`
8. **Clean up effects** — Return cleanup function
9. **Avoid premature memoization** — Profile first
10. **Name with 'use' prefix** — Convention for custom hooks
11. **Keep hooks focused** — Single responsibility

## Notes

- Use TanStack Query for server state / data fetching (better than custom hooks)
- Use Zustand/Jotai for global state (instead of Context + hooks)
- `use()` replaces `useContext()` — prefer `use(Context)` for new code
- `forwardRef` is deprecated — pass `ref` as a regular prop
- `startTransition` now supports async functions in React 19
