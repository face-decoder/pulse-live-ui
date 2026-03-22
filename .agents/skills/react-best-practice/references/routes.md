# Routing — TanStack Router v1 + Vite

TanStack Router adalah type-safe router modern untuk React. Semua route, params,
dan search params sepenuhnya di-infer TypeScript secara otomatis — tanpa manual typing.

---

## Setup Awal

```bash
npm install @tanstack/react-router
npm install -D @tanstack/router-plugin @tanstack/router-devtools
```

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'

export default defineConfig({
  plugins: [
    TanStackRouterVite(), // ✅ generate routeTree.gen.ts otomatis
    react(),
  ],
})
```

---

## Dua Pendekatan: File-based vs Code-based

### ✅ File-based Routing (Direkomendasikan dengan Vite)

Plugin Vite membaca struktur folder `src/routes/` dan men-generate
`routeTree.gen.ts` secara otomatis. Tidak perlu daftarkan route secara manual.

```
src/routes/
├── __root.tsx              → Root layout (wraps semua route)
├── index.tsx               → /
├── about.tsx               → /about
├── posts/
│   ├── index.tsx           → /posts
│   ├── $postId.tsx         → /posts/:postId  (dynamic)
│   └── $postId.edit.tsx    → /posts/:postId/edit
├── dashboard/
│   ├── route.tsx           → /dashboard layout
│   ├── index.tsx           → /dashboard
│   └── settings.tsx        → /dashboard/settings
├── _auth/                  → Pathless layout (tidak muncul di URL)
│   ├── route.tsx           → Auth guard layout
│   ├── login.tsx           → /login
│   └── register.tsx        → /register
└── (public)/               → Route group (tidak muncul di URL)
    └── pricing.tsx         → /pricing
```

### Code-based Routing (Tanpa Plugin)

```ts
// src/router.ts
import {
  createRouter,
  createRoute,
  createRootRoute,
} from '@tanstack/react-router'

const rootRoute = createRootRoute({ component: RootLayout })
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
})
const postRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/posts/$postId',
  component: PostPage,
})

const routeTree = rootRoute.addChildren([indexRoute, postRoute])
export const router = createRouter({ routeTree })
```

---

## File-based Routing — Cara Membuat Route

### Root Layout (`__root.tsx`)

```tsx
// src/routes/__root.tsx
import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  return (
    <>
      <nav>
        <Link to="/" activeProps={{ className: 'active' }}>
          Home
        </Link>
        <Link to="/posts" activeProps={{ className: 'active' }}>
          Posts
        </Link>
        <Link to="/dashboard" activeProps={{ className: 'active' }}>
          Dashboard
        </Link>
      </nav>

      <main>
        <Outlet /> {/* child routes render di sini */}
      </main>

      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </>
  )
}
```

### Index Route (`index.tsx`)

```tsx
// src/routes/index.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return <h1>Welcome Home</h1>
}
```

### Dynamic Route (`$postId.tsx`)

```tsx
// src/routes/posts/$postId.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/posts/$postId')({
  component: PostPage,
})

function PostPage() {
  // ✅ params fully typed — TypeScript tahu postId: string
  const { postId } = Route.useParams()

  return <div>Post ID: {postId}</div>
}
```

### Layout Route (`dashboard/route.tsx`)

```tsx
// src/routes/dashboard/route.tsx
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard')({
  component: DashboardLayout,
})

function DashboardLayout() {
  return (
    <div className="dashboard">
      <aside>
        <DashboardSidebar />
      </aside>
      <section>
        <Outlet />
      </section>
    </div>
  )
}
```

---

## Entry Point — `main.tsx`

```tsx
// src/main.tsx
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen' // ✅ auto-generated oleh plugin

const router = createRouter({
  routeTree,
  defaultPreload: 'intent', // prefetch saat hover/focus link
  defaultPreloadDelay: 100, // delay sebelum prefetch (ms)
  defaultStaleTime: 5_000, // berapa lama data dianggap fresh
})

// ✅ Type registration — aktifkan global type inference
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
```

---

## Loader — Data Fetching Per Route

TanStack Router punya built-in `loader` yang fetch data **sebelum** komponen dirender.
Ini lebih baik dari `useEffect` karena data tersedia saat render pertama.

```tsx
// src/routes/posts/$postId.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/posts/$postId')({
  // ✅ Loader dipanggil sebelum komponen render
  loader: async ({ params }) => {
    const post = await fetchPost(params.postId) // params fully typed
    return { post }
  },

  // ✅ Tampilkan saat data sedang di-fetch (streaming)
  pendingComponent: PostSkeleton,

  // ✅ Tampilkan saat loader throw error
  errorComponent: PostError,

  component: PostPage,
})

function PostPage() {
  // ✅ Data sudah tersedia — tidak perlu loading state
  const { post } = Route.useLoaderData()

  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  )
}

function PostSkeleton() {
  return <div className="animate-pulse h-64 bg-gray-200 rounded" />
}

function PostError({ error }: { error: Error }) {
  return <div className="error">Failed to load: {error.message}</div>
}
```

### Loader dengan React Query (Direkomendasikan)

Kombinasi TanStack Router loader + React Query untuk caching optimal:

```tsx
// src/routes/posts/$postId.tsx
import { createFileRoute } from '@tanstack/react-router'
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'

// ✅ Definisikan query options sekali, pakai di loader dan komponen
const postQueryOptions = (postId: string) =>
  queryOptions({
    queryKey: ['posts', postId],
    queryFn: () => fetchPost(postId),
    staleTime: 5_000,
  })

export const Route = createFileRoute('/posts/$postId')({
  // ✅ Loader memastikan data ada di cache sebelum komponen render
  loader: ({ params, context: { queryClient } }) =>
    queryClient.ensureQueryData(postQueryOptions(params.postId)),

  pendingComponent: PostSkeleton,
  errorComponent: PostError,
  component: PostPage,
})

function PostPage() {
  const { postId } = Route.useParams()
  // ✅ useSuspenseQuery — data pasti ada (loader sudah ensure)
  const { data: post } = useSuspenseQuery(postQueryOptions(postId))

  return (
    <article>
      <h1>{post.title}</h1>
    </article>
  )
}
```

```tsx
// src/main.tsx — inject queryClient ke router context
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

const router = createRouter({
  routeTree,
  context: { queryClient }, // ✅ tersedia di semua loader
})

// Type augmentation
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// ✅ Wrap dengan QueryClientProvider
ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={router} context={{ queryClient }} />
  </QueryClientProvider>,
)
```

---

## Search Params — Type-safe Query String

```tsx
// src/routes/posts/index.tsx
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

// ✅ Definisikan schema search params dengan Zod
const PostsSearchSchema = z.object({
  page: z.number().int().min(1).default(1),
  category: z.string().optional(),
  sort: z.enum(['newest', 'popular', 'oldest']).default('newest'),
  q: z.string().optional(),
})

export const Route = createFileRoute('/posts/')({
  validateSearch: PostsSearchSchema, // ✅ otomatis parse & validasi

  loader: ({ search }) =>
    fetchPosts({
      page: search.page,
      category: search.category,
      sort: search.sort,
      q: search.q,
    }),

  component: PostsPage,
})

function PostsPage() {
  // ✅ search fully typed sesuai schema Zod
  const { page, category, sort, q } = Route.useSearch()
  const navigate = Route.useNavigate()

  function handleCategoryChange(newCategory: string) {
    navigate({
      search: (prev) => ({ ...prev, category: newCategory, page: 1 }),
    })
  }

  function handlePageChange(newPage: number) {
    navigate({ search: (prev) => ({ ...prev, page: newPage }) })
  }

  const { posts } = Route.useLoaderData()

  return (
    <div>
      <select
        value={category ?? ''}
        onChange={(e) => handleCategoryChange(e.target.value)}
      >
        <option value="">All Categories</option>
        <option value="tech">Tech</option>
        <option value="design">Design</option>
      </select>

      <PostList posts={posts} />
      <Pagination current={page} onChange={handlePageChange} />
    </div>
  )
}
```

---

## Navigasi

### `<Link>` Component

```tsx
import { Link } from '@tanstack/react-router'

// ✅ Navigasi ke route statis
<Link to="/about">About</Link>

// ✅ Navigasi ke dynamic route — params di-type check
<Link to="/posts/$postId" params={{ postId: post.id }}>
  {post.title}
</Link>

// ✅ Navigasi dengan search params
<Link to="/posts" search={{ category: 'tech', sort: 'newest', page: 1 }}>
  Tech Posts
</Link>

// ✅ Active state styling
<Link
  to="/dashboard"
  activeProps={{ className: 'text-blue-500 font-bold' }}
  inactiveProps={{ className: 'text-gray-600' }}
>
  Dashboard
</Link>

// ✅ Exact active (hanya /posts, bukan /posts/123)
<Link to="/posts" activeOptions={{ exact: true }}>Posts</Link>
```

### `useNavigate` — Programmatic Navigation

```tsx
import { useNavigate } from '@tanstack/react-router'

function LoginForm() {
  const navigate = useNavigate()

  async function handleLogin(credentials: Credentials) {
    await api.login(credentials)

    // ✅ Navigate ke route — fully typed
    navigate({ to: '/dashboard' })

    // ✅ Navigate dengan params
    navigate({ to: '/posts/$postId', params: { postId: '123' } })

    // ✅ Navigate dengan search params
    navigate({
      to: '/posts',
      search: { category: 'tech', page: 1, sort: 'newest' },
    })

    // ✅ Replace history (tidak bisa back ke halaman ini)
    navigate({ to: '/dashboard', replace: true })
  }
}
```

---

## Auth Guard — Pathless Layout Route

```tsx
// src/routes/_auth/route.tsx — pathless layout, tidak muncul di URL
import { createFileRoute, redirect, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth')({
  beforeLoad: async ({ context, location }) => {
    // ✅ Cek auth sebelum render route manapun di bawah _auth/
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href }, // simpan tujuan asal
      })
    }
  },
  component: () => <Outlet />,
})

// src/routes/_auth/dashboard/index.tsx — otomatis terlindungi
export const Route = createFileRoute('/_auth/dashboard/')({
  component: DashboardPage,
})
```

---

## Error Handling

```tsx
// src/routes/posts/$postId.tsx
import { createFileRoute, ErrorComponent } from '@tanstack/react-router'

export const Route = createFileRoute('/posts/$postId')({
  loader: async ({ params }) => {
    const post = await fetchPost(params.postId)
    if (!post) throw new Error('Post not found') // ✅ throw untuk trigger errorComponent
    return { post }
  },

  // ✅ Error component menerima error + tombol retry
  errorComponent: function PostError({ error, reset }) {
    return (
      <div className="error-container">
        <h2>Failed to load post</h2>
        <p>{error.message}</p>
        <button onClick={reset}>Try again</button>
      </div>
    )
  },

  component: PostPage,
})
```

---

## Lazy Loading Route Components

```tsx
// ✅ Lazy load komponen route — Vite otomatis buat chunk terpisah
export const Route = createFileRoute('/dashboard/analytics')({
  component: lazyRouteComponent(
    () => import('../components/AnalyticsDashboard'),
    'AnalyticsDashboard',
  ),
})

// Atau dengan React.lazy biasa
const HeavyComponent = lazy(() => import('./HeavyComponent'))

export const Route = createFileRoute('/heavy')({
  component: function HeavyPage() {
    return (
      <Suspense fallback={<Skeleton />}>
        <HeavyComponent />
      </Suspense>
    )
  },
})
```

---

## DevTools

```tsx
// src/routes/__root.tsx
import { TanStackRouterDevtools } from '@tanstack/router-devtools'

function RootLayout() {
  return (
    <>
      <Outlet />
      {/* ✅ Hanya tampil di development */}
      {import.meta.env.DEV && (
        <TanStackRouterDevtools position="bottom-right" initialIsOpen={false} />
      )}
    </>
  )
}
```

---

## Referensi Cepat

| Kebutuhan              | API                                         |
| ---------------------- | ------------------------------------------- |
| Baca route params      | `Route.useParams()`                         |
| Baca search params     | `Route.useSearch()`                         |
| Baca loader data       | `Route.useLoaderData()`                     |
| Navigasi programmatic  | `useNavigate()`                             |
| Link ke route          | `<Link to="..." params={...} search={...}>` |
| Active link style      | `activeProps` / `inactiveProps`             |
| Guard auth             | `beforeLoad` + `throw redirect(...)`        |
| Fetch sebelum render   | `loader` function                           |
| Validasi search params | `validateSearch` + Zod schema               |
| Error handling         | `errorComponent`                            |
| Loading state          | `pendingComponent`                          |
| Lazy route component   | `lazyRouteComponent()`                      |
