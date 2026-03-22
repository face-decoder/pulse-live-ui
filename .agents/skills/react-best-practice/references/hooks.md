# Hooks — Rules, Patterns & Custom Hooks

---

## Rules of Hooks (Unchanged in React 19)

1. Only call hooks at the **top level** — never inside conditions, loops, or nested functions
2. Only call hooks from **React function components** or **custom hooks**
3. Custom hook names must **start with `use`**

Exception: `use()` is the only hook that can be called conditionally.

---

## `useState` — When and How

```tsx
// ✅ Simple scalar state
const [isOpen, setIsOpen] = useState(false)
const [count, setCount] = useState(0)
const [query, setQuery] = useState('')

// ✅ Functional updater for state that depends on previous value
setCount((prev) => prev + 1) // safe with concurrent rendering
setItems((prev) => [...prev, newItem]) // safe

// ❌ Stale closure — wrong
setCount(count + 1) // may read stale count in concurrent mode

// ✅ Lazy initialization for expensive initial state
const [data, setData] = useState(() =>
  JSON.parse(localStorage.getItem('data') ?? '[]'),
)
//                                ↑ function — runs only once, not on every render

// ❌ Don't store derived state
const [fullName, setFullName] = useState(`${firstName} ${lastName}`) // stale!
// ✅ Derive during render
const fullName = `${firstName} ${lastName}`
```

---

## `useReducer` — Complex State Logic

Use when: state has multiple sub-values, or next state depends on previous in complex ways.

```tsx
type State = {
  items: CartItem[]
  coupon: string | null
  isLoading: boolean
  error: string | null
}

type Action =
  | { type: 'ADD_ITEM'; item: CartItem }
  | { type: 'REMOVE_ITEM'; id: string }
  | { type: 'UPDATE_QTY'; id: string; qty: number }
  | { type: 'APPLY_COUPON'; code: string }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_ERROR'; error: string }

const initialState: State = {
  items: [],
  coupon: null,
  isLoading: false,
  error: null,
}

function cartReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_ITEM':
      return { ...state, items: [...state.items, action.item] }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((i) => i.id !== action.id) }
    case 'UPDATE_QTY':
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.id ? { ...i, qty: action.qty } : i,
        ),
      }
    case 'APPLY_COUPON':
      return { ...state, coupon: action.code }
    case 'SET_LOADING':
      return { ...state, isLoading: action.loading, error: null }
    case 'SET_ERROR':
      return { ...state, error: action.error, isLoading: false }
  }
}

function Cart() {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  const addItem = (item: CartItem) => dispatch({ type: 'ADD_ITEM', item })
  const removeItem = (id: string) => dispatch({ type: 'REMOVE_ITEM', id })

  return (
    <div>
      {state.items.map((item) => (
        <CartItem
          key={item.id}
          item={item}
          onRemove={() => removeItem(item.id)}
        />
      ))}
    </div>
  )
}
```

---

## `useEffect` — Use Sparingly

`useEffect` is for **synchronizing with external systems** — not for reacting to state changes.

### When to Use `useEffect`

- Subscribing to external events (WebSocket, EventEmitter, `window` events)
- Manually managing third-party DOM libraries
- Starting/stopping timers based on mount state

### When NOT to Use `useEffect`

| Anti-pattern                   | Right approach                         |
| ------------------------------ | -------------------------------------- |
| Fetching data on mount         | `use()` + Suspense, or React Query     |
| Computing derived state        | Compute during render / `useMemo`      |
| Reacting to user events        | Call logic directly in event handler   |
| Resetting state on prop change | Derive from props, or use `key` prop   |
| Syncing two states together    | Lift state up / single source of truth |

```tsx
// ❌ useEffect for derived state — unnecessary render cycle
const [fullName, setFullName] = useState('')
useEffect(() => {
  setFullName(`${firstName} ${lastName}`)
}, [firstName, lastName])

// ✅ Derive directly during render
const fullName = `${firstName} ${lastName}`

// ❌ useEffect for event-driven logic
useEffect(() => {
  if (submitted) {
    sendAnalytics('form_submitted')
    resetForm()
  }
}, [submitted])

// ✅ Call in the event handler
function handleSubmit() {
  sendAnalytics('form_submitted')
  resetForm()
  setSubmitted(true)
}

// ✅ Legitimate useEffect — external subscription
useEffect(() => {
  const ws = new WebSocket('wss://api.example.com/live')
  ws.onmessage = (e) => setMessage(JSON.parse(e.data))
  return () => ws.close() // cleanup is required
}, [])
```

### Cleanup Is Required

```tsx
// ✅ Always clean up subscriptions, timers, and observers
useEffect(() => {
  const controller = new AbortController()

  fetch('/api/data', { signal: controller.signal })
    .then((r) => r.json())
    .then(setData)
    .catch((err) => {
      if (err.name !== 'AbortError') setError(err.message)
    })

  return () => controller.abort() // cleanup on unmount / re-run
}, [])

useEffect(() => {
  const id = setInterval(() => setTick((t) => t + 1), 1000)
  return () => clearInterval(id)
}, [])

useEffect(() => {
  const observer = new ResizeObserver((entries) =>
    setSize(entries[0].contentRect),
  )
  observer.observe(elementRef.current!)
  return () => observer.disconnect()
}, [])
```

---

## `useRef` — Beyond DOM Refs

```tsx
// ✅ DOM reference
const inputRef = useRef<HTMLInputElement>(null)
<input ref={inputRef} />
inputRef.current?.focus()

// ✅ Mutable value that doesn't trigger re-render
const renderCount = useRef(0)
renderCount.current++  // no re-render

// ✅ Store previous value
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>()
  useEffect(() => { ref.current = value })
  return ref.current
}

// ✅ Store latest callback (avoids stale closures in effects)
function useEvent<T extends (...args: unknown[]) => unknown>(fn: T): T {
  const ref = useRef(fn)
  useEffect(() => { ref.current = fn })
  return useCallback((...args: unknown[]) => ref.current(...args), []) as T
}
```

---

## `useId` — Accessible IDs

```tsx
import { useId } from 'react'

// ✅ Stable, unique IDs for accessibility — safe for SSR
function FormField({ label, type = 'text' }: { label: string; type?: string }) {
  const id = useId() // generates ':r0:', ':r1:', etc.

  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input id={id} type={type} aria-describedby={`${id}-hint`} />
      <span id={`${id}-hint`}>Enter your {label.toLowerCase()}</span>
    </div>
  )
}
// ❌ Never use Math.random() or Date.now() for HTML IDs — breaks SSR hydration
```

---

## Custom Hooks — Patterns

### Encapsulate Logic + State Together

```tsx
// hooks/use-toggle.ts
export function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue)
  const toggle = useCallback(() => setValue((v) => !v), [])
  const setTrue = useCallback(() => setValue(true), [])
  const setFalse = useCallback(() => setValue(false), [])
  return { value, toggle, setTrue, setFalse }
}

// hooks/use-debounce.ts
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debouncedValue
}

// hooks/use-local-storage.ts
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

// hooks/use-async.ts — for client-side async operations
export function useAsync<T>(fn: () => Promise<T>, deps: React.DependencyList) {
  const [state, setState] = useState<{
    data: T | null
    error: Error | null
    isLoading: boolean
  }>({ data: null, error: null, isLoading: true })

  useEffect(() => {
    let cancelled = false
    setState((s) => ({ ...s, isLoading: true }))
    fn()
      .then((data) => {
        if (!cancelled) setState({ data, error: null, isLoading: false })
      })
      .catch((error) => {
        if (!cancelled) setState({ data: null, error, isLoading: false })
      })
    return () => {
      cancelled = true
    }
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps

  return state
}
```

### Co-locate Hook with Feature

```
features/
└── [key]/
    ├── components/
    │   └── [key]-xxx.tsx
    ├── constants/
    │   └── index.ts
    ├── services/
    │   └── use-get-[key].ts
    ├── schemas/
    │   └── [key].schema.ts
    ├── hooks/
    │   └── use-[key].ts  // hook lives next to the feature that uses it
    └── types/
        └── index.ts
```
