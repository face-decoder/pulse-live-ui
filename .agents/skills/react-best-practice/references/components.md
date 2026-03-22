# Components, Composition & Context

---

## Component Design Principles

### Single Responsibility

Each component does one thing. If you need "and" to describe it, split it.

```tsx
// ❌ Does too much
function UserDashboard() {
  const [user, setUser] = useState(null)
  const [posts, setPosts] = useState([])
  useEffect(() => {
    fetchUser().then(setUser)
  }, [])
  useEffect(() => {
    fetchPosts().then(setPosts)
  }, [])
  return (
    <div>
      <img src={user?.avatar} />
      <h1>{user?.name}</h1>
      {posts.map((p) => (
        <article key={p.id}>{p.title}</article>
      ))}
    </div>
  )
}

// ✅ Each component owns one concern and can be composed together
export interface UserAvatarProps {
  src: string
  name: string
}

export function UserAvatar({ src, name }: UserAvatarProps) {
  return <img src={src} alt={name} className="rounded-full w-12 h-12" />
}

export interface PostListProps {
  posts: Post[]
}

export function PostList({ posts }: PostListProps) {
  return (
    <ul>
      {posts.map((p) => (
        <PostItem key={p.id} post={p} />
      ))}
    </ul>
  )
}
```

---

## Composition over Configuration

Prefer composing components together rather than adding props to control internal behavior.

```tsx
// ❌ Configuration via props — explodes as requirements grow
<Card
  hasHeader
  hasFooter
  headerTitle="Profile"
  footerButtonLabel="Save"
  headerIcon="user"
  isCollapsible
/>

// ✅ Composition — flexible, predictable
<Card>
  <Card.Header>
    <UserIcon /> Profile
  </Card.Header>
  <Card.Body>
    <ProfileForm />
  </Card.Body>
  <Card.Footer>
    <Button variant="primary">Save</Button>
  </Card.Footer>
</Card>

// Implementation using dot notation

export interface CardProps {
  children: React.ReactNode
}

export function Card({ children }: CardProps) {
  return <div className="card">{children}</div>
}

export interface CardHeaderProps {
  children: React.ReactNode
}

export function CardHeader({ children }: CardHeaderProps) {
  return <div className="card-header">{children}</div>
}

export interface CardBodyProps {
  children: React.ReactNode
}

export function CardBody({ children }: CardBodyProps) {
  return <div className="card-body">{children}</div>
}

export interface CardFooterProps {
  children: React.ReactNode
}

export function CardFooter({ children }: CardFooterProps) {
  return <div className="card-footer">{children}</div>
}
```

---

## The `children` Pattern — Inversion of Control

```tsx
// ❌ Parent controls everything inside — inflexible
function Modal({ title, content, onClose }: ModalProps) {
  return (
    <div className="modal">
      <h2>{title}</h2>
      <p>{content}</p>
      <button onClick={onClose}>Close</button>
    </div>
  )
}

// ✅ Consumer controls content — flexible
export interface ModalProps {
  children: React.ReactNode
  onClose: () => void
}

export function Modal({ children, onClose }: ModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        {children}
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
      </div>
    </div>
  )
}

// Consumer decides what goes inside:
;<Modal onClose={handleClose}>
  <h2>Confirm Delete</h2>
  <p>This cannot be undone.</p>
  <Button variant="danger" onClick={confirmDelete}>
    Delete
  </Button>
</Modal>
```

---

## Refs in React 19 — No `forwardRef`

```tsx
// ✅ React 19 — ref is a plain prop, no wrapper needed
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  ref?: React.Ref<HTMLInputElement>
  label: string
  error?: string
}

function Input({ ref, label, error, id, ...props }: InputProps) {
  const inputId = id ?? useId()

  return (
    <div className="field">
      <label htmlFor={inputId}>{label}</label>
      <input id={inputId} ref={ref} aria-invalid={!!error} {...props} />
      {error && (
        <span className="error-msg" role="alert">
          {error}
        </span>
      )}
    </div>
  )
}

// Usage — identical to before
function LoginForm() {
  const emailRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    emailRef.current?.focus() // focus on mount
  }, [])

  return <Input ref={emailRef} label="Email" type="email" />
}
```

### `useImperativeHandle` with React 19

```tsx
// Expose controlled API from a component
interface VideoPlayerHandle {
  play: () => void
  pause: () => void
  seek: (seconds: number) => void
}

interface VideoPlayerProps {
  src: string
  ref?: React.Ref<VideoPlayerHandle>
}

function VideoPlayer({ src, ref }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useImperativeHandle(ref, () => ({
    play: () => videoRef.current?.play(),
    pause: () => videoRef.current?.pause(),
    seek: (s) => { if (videoRef.current) videoRef.current.currentTime = s },
  }))

  return <video ref={videoRef} src={src} />
}

// Consumer gets typed API
const playerRef = useRef<VideoPlayerHandle>(null)
<VideoPlayer ref={playerRef} src="/video.mp4" />
<button onClick={() => playerRef.current?.play()}>Play</button>
```

---

## Context — Modern Patterns

### Creating Context

```tsx
// contexts/theme.tsx
import { createContext, use, useState } from 'react'

type Theme = 'light' | 'dark'
interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggle: () => void
}

// ✅ Initialize with null, validate in hook
const ThemeContext = createContext<ThemeContextValue | null>(null)

export interface ThemeProviderProps {
  children: React.ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>('light')

  const value: ThemeContextValue = {
    theme,
    setTheme,
    toggle: () => setTheme((t) => (t === 'light' ? 'dark' : 'light')),
  }

  return <ThemeContext value={value}>{children}</ThemeContext>
  //                   ↑ React 19: no more .Provider — value prop directly on context
}

// ✅ Custom hook with validation
export function useTheme(): ThemeContextValue {
  const ctx = use(ThemeContext) // use() instead of useContext()
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
```

### React 19 Context Syntax

```tsx
// ❌ React 18 — .Provider syntax
<ThemeContext.Provider value={value}>
  {children}
</ThemeContext.Provider>

// ✅ React 19 — direct value prop on context
<ThemeContext value={value}>
  {children}
</ThemeContext>
```

### Splitting Context for Performance

```tsx
// ❌ One big context — any change re-renders all consumers
const AppContext = createContext({ user, cart, theme, notifications })

// ✅ Split by update frequency — minimize re-renders
const UserContext = createContext<User | null>(null) // changes rarely
const CartContext = createContext<CartState | null>(null) // changes often
const ThemeContext = createContext<Theme>('light') // changes rarely
```

---

## Component Anti-Patterns

### Prop Drilling (solve with Context or Composition)

```tsx
// ❌ Drilling userId 4 levels deep
<Page userId={userId}>
  <Layout userId={userId}>
    <Sidebar userId={userId}>
      <UserAvatar userId={userId} />
    </Sidebar>
  </Layout>
</Page>

// ✅ Context for cross-cutting concerns
<UserProvider user={user}>
  <Page>
    <Layout>
      <Sidebar>
        <UserAvatar />  {/* reads from context */}
      </Sidebar>
    </Layout>
  </Page>
</UserProvider>
```

### Rendering Inside Render

```tsx
// ❌ Defining components inside render — recreated every render
function Parent() {
  function Child() {
    return <div>Child</div>
  } // new function reference each render!
  return <Child />
}

// ✅ Define outside
function Child() {
  return <div>Child</div>
}
function Parent() {
  return <Child />
}
```
