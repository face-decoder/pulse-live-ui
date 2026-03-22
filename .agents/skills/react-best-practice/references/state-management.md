# State Management in React 19

---

## The State Decision Tree

```
Where is this state needed?
│
├── Just this component?
│     └── useState / useReducer
│
├── A few nearby components?
│     └── Lift state up to nearest common parent
│
├── Across a whole feature subtree?
│     └── React Context
│
├── Globally across the entire app?
│     ├── Is it server/async data? → React Query / SWR
│     └── Is it client UI state?  → Zustand / Jotai
│
└── Should it survive page refresh?
      └── URL state (query params) or localStorage
```

---

## 1. Local State — `useState` & `useReducer`

### `useState` for Simple State

```tsx
// ✅ Simple values
const [isOpen, setIsOpen] = useState(false)
const [count, setCount] = useState(0)
const [name, setName] = useState('')

// ✅ Simple objects (keep flat when possible)
const [user, setUser] = useState<User | null>(null)

// ✅ Immutable updates for objects
setUser((prev) => (prev ? { ...prev, email: newEmail } : null))

// ✅ Immutable updates for arrays
setItems((prev) => [...prev, newItem]) // add
setItems((prev) => prev.filter((i) => i.id !== id)) // remove
setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...changes } : i))) // update
```

### `useReducer` for Complex State

```tsx
type FilterState = {
  search: string
  category: string
  priceRange: [number, number]
  sortBy: 'name' | 'price' | 'date'
  page: number
}

type FilterAction =
  | { type: 'SET_SEARCH'; search: string }
  | { type: 'SET_CATEGORY'; category: string }
  | { type: 'SET_PRICE_RANGE'; range: [number, number] }
  | { type: 'SET_SORT'; sortBy: FilterState['sortBy'] }
  | { type: 'SET_PAGE'; page: number }
  | { type: 'RESET' }

const defaultFilters: FilterState = {
  search: '',
  category: 'all',
  priceRange: [0, 1000],
  sortBy: 'date',
  page: 1,
}

function filterReducer(state: FilterState, action: FilterAction): FilterState {
  switch (action.type) {
    case 'SET_SEARCH':
      return { ...state, search: action.search, page: 1 }
    case 'SET_CATEGORY':
      return { ...state, category: action.category, page: 1 }
    case 'SET_PRICE_RANGE':
      return { ...state, priceRange: action.range, page: 1 }
    case 'SET_SORT':
      return { ...state, sortBy: action.sortBy }
    case 'SET_PAGE':
      return { ...state, page: action.page }
    case 'RESET':
      return defaultFilters
  }
}

function ProductFilters() {
  const [filters, dispatch] = useReducer(filterReducer, defaultFilters)
  // ...
}
```

---

## 2. Lifted State — Shared Between Siblings

```tsx
// ✅ Move state to nearest common parent
function SearchSection() {
  const [query, setQuery] = useState('') // owned here, shared down

  return (
    <div>
      <SearchInput value={query} onChange={setQuery} />
      <SearchResults query={query} /> {/* receives query as prop */}
    </div>
  )
}
```

---

## 3. React Context — Feature-Level State

Best for: theme, current user, locale, feature-scoped shared state.

```tsx
// contexts/notification.tsx
import { createContext, use, useCallback, useState } from 'react'

type Notification = {
  id: string
  type: 'success' | 'error' | 'info'
  message: string
}

interface NotificationContextValue {
  notifications: Notification[]
  notify: (type: Notification['type'], message: string) => void
  dismiss: (id: string) => void
}

const NotificationContext = createContext<NotificationContextValue | null>(null)

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const notify = useCallback((type: Notification['type'], message: string) => {
    const id = crypto.randomUUID()
    setNotifications((prev) => [...prev, { id, type, message }])
    setTimeout(() => dismiss(id), 5000) // auto-dismiss
  }, [])

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  return (
    // ✅ React 19 — no .Provider, value prop directly on context
    <NotificationContext value={{ notifications, notify, dismiss }}>
      {children}
    </NotificationContext>
  )
}

export function useNotifications() {
  const ctx = use(NotificationContext) // use() instead of useContext()
  if (!ctx)
    throw new Error('useNotifications must be used within NotificationProvider')
  return ctx
}

// Usage anywhere in the tree:
function SaveButton() {
  const { notify } = useNotifications()
  return (
    <button
      onClick={async () => {
        await saveData()
        notify('success', 'Saved successfully!')
      }}
    >
      Save
    </button>
  )
}
```

### Splitting Context for Performance

```tsx
// ❌ One fat context — any change re-renders ALL consumers
const AppContext = createContext({ user, cart, theme, filters })

// ✅ Split by update frequency
const UserContext = createContext<User | null>(null) // rarely changes
const CartContext = createContext<CartState | null>(null) // changes often
const ThemeContext = createContext<'light' | 'dark'>('light') // rarely changes
```

---

## 4. Zustand — Simple Global Client State

Best for: cross-component UI state, app-level state that doesn't need server sync.

```ts
// stores/cart.store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CartItem { id: string; name: string; price: number; qty: number }

interface CartStore {
  items: CartItem[]
  add: (item: CartItem) => void
  remove: (id: string) => void
  updateQty: (id: string, qty: number) => void
  clear: () => void
  total: () => number
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item) => set(state => ({
        items: state.items.find(i => i.id === item.id)
          ? state.items.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i)
          : [...state.items, item]
      })),
      remove: (id) => set(state => ({ items: state.items.filter(i => i.id !== id) })),
      updateQty: (id, qty) => set(state => ({
        items: qty <= 0
          ? state.items.filter(i => i.id !== id)
          : state.items.map(i => i.id === id ? { ...i, qty } : i)
      })),
      clear: () => set({ items: [] }),
      total: () => get().items.reduce((sum, i) => sum + i.price * i.qty, 0),
    }),
    { name: 'cart-storage' }  // persists to localStorage
  )
)

// Usage — no Provider needed
function CartIcon() {
  const items = useCart(state => state.items)  // ✅ subscribe to specific slice
  return <span>{items.length} items</span>
}

function AddToCartButton({ product }: { product: Product }) {
  const add = useCart(state => state.add)  // ✅ stable reference — no re-renders
  return <button onClick={() => add({ ...product, qty: 1 })}>Add</button>
}
```

---

## 5. React Query — Server State & Async Data

```tsx
// Wrap app with QueryClientProvider
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 5 * 60 * 1000, retry: 2 } },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
    </QueryClientProvider>
  )
}

// Fetch with caching, background refresh, and deduplication
function UserProfile({ userId }: { userId: string }) {
  const {
    data: user,
    isPending,
    error,
  } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => api.getUser(userId),
  })

  if (isPending) return <UserSkeleton />
  if (error) return <ErrorMessage error={error} />
  return <UserCard user={user} />
}

// Mutation with cache invalidation
function EditProfileForm({ userId }: { userId: string }) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: Partial<User>) => api.updateUser(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', userId] })
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        mutation.mutate({ name: formData.get('name') as string })
      }}
    >
      <input name="name" />
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Saving...' : 'Save'}
      </button>
    </form>
  )
}
```

---

## State Anti-Patterns

```tsx
// ❌ Syncing state from props
const [name, setName] = useState(user.name) // stale after prop update
// ✅ Derive from props directly
function Component({ user }) {
  return <span>{user.name}</span>
}

// ❌ Storing derived state
const [total, setTotal] = useState(0)
useEffect(() => setTotal(items.reduce((s, i) => s + i.price, 0)), [items])
// ✅ Compute during render (or useMemo if expensive)
const total = items.reduce((s, i) => s + i.price, 0)

// ❌ Mirror server state into local state
const [serverUser, setServerUser] = useState(null)
useEffect(() => {
  fetchUser().then(setServerUser)
}, [])
// ✅ React Query handles server state
const { data: user } = useQuery({ queryKey: ['user'], queryFn: fetchUser })
```
