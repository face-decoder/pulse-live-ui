# React 19 New APIs

---

## `useActionState` — Async Action State

Replaces the `useState` + manual `isLoading` + `error` pattern for any async action.

```tsx
import { useActionState } from 'react'

type State = { error?: string; success?: boolean }

async function submitForm(
  prevState: State,
  formData: FormData,
): Promise<State> {
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
- `prevState` receives the previous returned value — useful for accumulating messages
- Works with any async function, not just server actions

---

## `useOptimistic` — Optimistic UI

Show immediate feedback before async operation confirms.

```tsx
import { useOptimistic, useTransition } from 'react'

export interface Todo {
  id: string
  text: string
  completed: boolean
}

export interface TodoListProps {
  initialTodos: Array<Todo>
}

export function TodoList({ initialTodos }: TodoListProps) {
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

## `use()` — Read Promises and Context

`use()` is a new hook that can be called conditionally (unlike all other hooks).

### Reading a Promise (with Suspense)

```tsx
import { use, Suspense } from 'react'

export interface User {
  id: string
  name: string
  email: string
}

export interface UserPageProps {
  userId: string
}

// Fetch at parent level, pass promise down
export function UserPage({ userId }: UserPageProps) {
  const userPromise = fetchUser(userId) // no await — start fetch, pass promise

  return (
    <Suspense fallback={<UserSkeleton />}>
      <UserProfile userPromise={userPromise} />
    </Suspense>
  )
}

export interface UserProfileProps {
  user: Promise<User>
}

// Child suspends until promise resolves
export function UserProfile({ user: userPromise }: UserProfileProps) {
  const user = use(user) // suspends here until resolved

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  )
}
```

### Reading Context Conditionally

```tsx
import { use } from 'react'
import { ThemeContext } from './ThemeContext'

export interface ThemeButtonProps {
  isThemed: boolean
  children: React.ReactNode
}

// use() can be called inside conditions — unlike useContext()
function ThemedButton({ isThemed, children }: ThemeButtonProps) {
  if (isThemed) {
    const theme = use(ThemeContext) // ✅ conditional use() is allowed
    return <button style={{ background: theme.primary }}>{children}</button>
  }
  return <button>{children}</button>
}
```

---

## `ref` as a Regular Prop — No More `forwardRef`

`forwardRef` is deprecated in React 19. Pass `ref` as a normal prop.

```tsx
// ❌ React 18 — required forwardRef wrapper
const Input = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => (
  <input ref={ref} {...props} />
))
Input.displayName = 'Input'

// ✅ React 19 — ref is just another prop
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  ref?: React.Ref<HTMLInputElement>
  label?: string
}

function Input({ ref, label, ...props }: InputProps) {
  return (
    <div>
      {label && <label>{label}</label>}
      <input ref={ref} {...props} />
    </div>
  )
}

// Consuming — identical to before
const inputRef = useRef<HTMLInputElement>(null)
<Input ref={inputRef} label="Email" type="email" />
```

---

## `useFormStatus` — Parent Form Pending State

Read pending state of the enclosing `<form>` from any child component.

```tsx
import { useFormStatus } from 'react-dom'

export interface SubmitButtonProps {
  label: string
}

// Must be a CHILD of <form> — cannot be in the same component as the form
function SubmitButton({ label }: SubmitButtonProps) {
  const { pending, data, method } = useFormStatus()

  return (
    <button type="submit" disabled={pending}>
      {pending ? (
        <span className="flex items-center gap-2">
          <Spinner size="sm" /> Submitting...
        </span>
      ) : (
        label
      )}
    </button>
  )
}

// Parent form
function ContactForm() {
  return (
    <form action={submitContact}>
      <input name="email" type="email" />
      <textarea name="message" />
      <SubmitButton label="Send Message" /> {/* reads form's pending state */}
    </form>
  )
}
```

---

## `startTransition` — Now Supports Async

React 19 allows `async` functions inside `startTransition`.

```tsx
import { useTransition, useState } from 'react'

function SearchResults() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Result[]>([])
  const [isPending, startTransition] = useTransition()

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    setQuery(value) // urgent — update input immediately

    startTransition(async () => {
      // non-urgent — React can interrupt this for more urgent updates
      const data = await searchApi(value) // ✅ async in startTransition (React 19)
      setResults(data)
    })
  }

  return (
    <div>
      <input value={query} onChange={handleSearch} placeholder="Search..." />
      <div style={{ opacity: isPending ? 0.5 : 1 }}>
        {results.map((r) => (
          <ResultItem key={r.id} result={r} />
        ))}
      </div>
    </div>
  )
}
```

---

## Document Metadata — Native Support

React 19 supports `<title>`, `<meta>`, and `<link>` directly in components.
They hoist to `<head>` automatically.

```tsx
export interface Product {
  name: string
  description: string
  imageUrl: string
  slug: string
}

export interface ProductPageProps {
  product: Product
}

function ProductPage({ product }: ProductPageProps) {
  return (
    <>
      {/* These hoist to <head> automatically */}
      <title>{product.name} — Shop</title>
      <meta name="description" content={product.description} />
      <meta property="og:image" content={product.imageUrl} />
      <link
        rel="canonical"
        href={`https://example.com/products/${product.slug}`}
      />

      {/* Page content */}
      <main>
        <h1>{product.name}</h1>
      </main>
    </>
  )
}
```

---

## Stylesheet Loading

React 19 manages stylesheet precedence and deduplication automatically.

```tsx
export interface CardProps {
  children: React.ReactNode
}

function Card({ children }: CardProps) {
  return (
    <>
      {/* Deduplicated — only one instance loaded even if Card renders many times */}
      <link rel="stylesheet" href="/styles/card.css" precedence="component" />
      <div className="card">{children}</div>
    </>
  )
}
```
