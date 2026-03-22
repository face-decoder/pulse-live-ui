# Performance Optimization — React 19 + Vite

---

## The React 19 Compiler (React Forget) dengan Vite

React Compiler otomatis memoize komponen dan nilai — menghilangkan kebutuhan manual
`memo`, `useMemo`, dan `useCallback`. Setup di Vite berbeda dari Babel-based toolchain.

```bash
npm install -D babel-plugin-react-compiler @vitejs/plugin-react
```

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          [
            'babel-plugin-react-compiler',
            {
              // Opsional: target hanya folder tertentu dulu saat migrasi
              // sources: (filename) => filename.includes('src/components'),
            },
          ],
        ],
      },
    }),
  ],
})
```

> Ketika compiler aktif: **skip manual `memo`/`useMemo`/`useCallback`** — compiler
> yang menangani. Jika belum aktif, terapkan secara manual seperti di bawah.

---

## Vite Build Optimizations

### `vite.config.ts` — Konfigurasi Optimal

```ts
// vite.config.ts
import { defineConfig, splitVendorChunkPlugin } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    splitVendorChunkPlugin(), // pisahkan vendor chunk otomatis
  ],

  build: {
    // ✅ Target browser modern — bundle lebih kecil, tidak perlu polyfill lama
    target: 'es2022',

    // ✅ Pisahkan chunks secara manual untuk caching lebih optimal
    rollupOptions: {
      output: {
        manualChunks: {
          // Library yang jarang berubah → cache browser lebih lama
          'react-vendor': ['react', 'react-dom'],
          router: ['react-router-dom'],
          'ui-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
          ],
          query: ['@tanstack/react-query'],
          charts: ['recharts'], // hanya jika besar dan jarang dipakai semua user
        },
      },
    },

    // ✅ Naikkan warning limit jika perlu (default 500kb)
    chunkSizeWarningLimit: 600,

    // ✅ Source map hanya untuk staging — tidak perlu di production
    sourcemap: process.env.NODE_ENV === 'staging',
  },

  // ✅ Path alias — hindari ../../.. yang rawan typo
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@hooks': '/src/hooks',
      '@lib': '/src/lib',
    },
  },
})
```

---

## Analisis Bundle — Deteksi Masalah Nyata

Sebelum optimasi apapun, lihat dulu kondisi bundle — jangan optimasi yang tidak perlu.

```bash
npm install -D rollup-plugin-visualizer
```

```ts
// vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: 'dist/stats.html',
      open: true, // buka browser otomatis setelah build
      gzipSize: true, // tampilkan ukuran setelah gzip
      brotliSize: true, // tampilkan ukuran setelah brotli
    }),
  ],
})
```

```bash
npm run build
# → dist/stats.html terbuka otomatis — treemap visual semua chunk
```

**Yang perlu dicari di visualizer:**

| Temuan                          | Tindakan                           |
| ------------------------------- | ---------------------------------- |
| Library muncul di banyak chunk  | Pindah ke `manualChunks`           |
| `moment.js` atau `lodash` full  | Ganti `date-fns` / `lodash-es`     |
| Komponen halaman di main bundle | Pindah ke `lazy()`                 |
| Chunk > 300kb setelah gzip      | Pecah lebih kecil                  |
| Icon library full (semua icon)  | Impor per icon, bukan full package |

---

## Code Splitting dengan Dynamic Import (Vite Native)

Vite mendukung dynamic import secara native — tidak perlu konfigurasi tambahan,
setiap `import()` otomatis jadi chunk terpisah.

### Route-based Splitting (Paling Impactful)

```tsx
// router.tsx — setiap route jadi bundle tersendiri
import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

const HomePage = lazy(() => import('@/pages/home-page'))
const ProfilePage = lazy(() => import('@/pages/profile-page'))
const SettingsPage = lazy(() => import('@/pages/settings-page'))
const AdminPage = lazy(() => import('@/pages/admin-page'))

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Suspense fallback={<PageSkeleton />}>
        <HomePage />
      </Suspense>
    ),
  },
  {
    path: '/profile',
    element: (
      <Suspense fallback={<PageSkeleton />}>
        <ProfilePage />
      </Suspense>
    ),
  },
  {
    path: '/settings',
    element: (
      <Suspense fallback={<PageSkeleton />}>
        <SettingsPage />
      </Suspense>
    ),
  },
  {
    path: '/admin',
    element: (
      <Suspense fallback={<PageSkeleton />}>
        <AdminPage />
      </Suspense>
    ),
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
```

### Component-level Splitting

```tsx
// ✅ Heavy components — load only when needed
const RichTextEditor = lazy(() => import('@/components/rich-text-editor'))
const DataChart = lazy(() => import('@/components/data-chart'))
const PdfViewer = lazy(() => import('@/components/pdf-viewer'))
const VideoPlayer = lazy(() => import('@/components/video-player'))

// ✅ Load on interaction — tidak download sampai user klik
function PostEditor() {
  const [showEditor, setShowEditor] = useState(false)

  return (
    <div>
      <button onClick={() => setShowEditor(true)}>Open Editor</button>
      {showEditor && (
        <Suspense fallback={<EditorSkeleton />}>
          <RichTextEditor />
        </Suspense>
      )}
    </div>
  )
}
```

### Vite Magic Comments — Prefetch & Preload

```tsx
// ✅ Prefetch — download di idle time, tampil instan saat dibutuhkan
// Cocok untuk halaman yang kemungkinan besar dikunjungi berikutnya
const CheckoutPage = lazy(
  () => import(/* @vite-prefetch */ '@/pages/CheckoutPage'),
)

// ✅ Preload — prioritas lebih tinggi, download segera
// Cocok untuk modal/dialog yang hampir pasti dibuka
const ConfirmModal = lazy(
  () => import(/* @vite-preload */ '@/components/ConfirmModal'),
)
```

---

## Lazy Loading Gambar

Vite tidak punya `next/image`. Gunakan pendekatan ini:

```tsx
// ✅ Native lazy loading — didukung semua browser modern
<img
  src="/images/product.webp"
  alt="Product"
  loading="lazy"          // browser native lazy load
  decoding="async"        // decode tidak block main thread
  width={800}
  height={600}            // WAJIB tentukan untuk hindari CLS
/>

// ✅ LCP element (gambar terbesar above-the-fold) — JANGAN lazy
<img
  src="/images/hero.webp"
  alt="Hero banner"
  loading="eager"
  fetchpriority="high"    // browser prioritaskan fetch
  width={1200}
  height={500}
/>
```

### Optimasi Gambar dengan vite-imagetools

```bash
npm install -D vite-imagetools
```

```ts
// vite.config.ts
import { imagetools } from 'vite-imagetools'
export default defineConfig({ plugins: [react(), imagetools()] })
```

```tsx
// ✅ Konversi otomatis ke WebP, resize, dan optimize saat build
import heroUrl from '@/assets/hero.jpg?format=webp&width=1200&quality=80'
import thumbUrl from '@/assets/hero.jpg?format=webp&width=400'

// ✅ Responsive images dengan srcset
import hero800 from '@/assets/hero.jpg?format=webp&width=800'
import hero1200 from '@/assets/hero.jpg?format=webp&width=1200'
import hero1600 from '@/assets/hero.jpg?format=webp&width=1600'

function HeroBanner() {
  return (
    <img
      src={hero1200}
      srcSet={`${hero800} 800w, ${hero1200} 1200w, ${hero1600} 1600w`}
      sizes="(max-width: 800px) 800px, (max-width: 1200px) 1200px, 1600px"
      alt="Hero"
      fetchpriority="high"
      width={1200}
      height={500}
    />
  )
}
```

---

## Dev Server Performance

```ts
// vite.config.ts
export default defineConfig({
  server: {
    // ✅ Warmup file yang sering dibuka — HMR lebih cepat dari awal
    warmup: {
      clientFiles: [
        './src/app.tsx',
        './src/components/ui/button.tsx',
        './src/components/ui/input.tsx',
        './src/components/layout/navbar.tsx',
      ],
    },
  },

  // ✅ Pre-bundle dependency — vite dev startup jauh lebih cepat
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'zustand',
      'clsx',
      'tailwind-merge',
    ],
  },
})
```

**Tips HMR cepat:**

- Hindari barrel exports (`index.ts` yang re-export semuanya) — Vite harus
  resolve seluruh tree untuk HMR
- Pecah file yang terlalu besar (> 500 baris) — HMR lebih granular
- Gunakan path alias `@/` agar Vite tidak perlu resolve relative path panjang

---

## React-Level Performance (Tidak Bergantung Bundler)

### `memo` — Cegah Re-render Tidak Perlu

```tsx
const UserCard = memo(function UserCard({ user }: { user: User }) {
  return (
    <div>
      <img src={user.avatar} loading="lazy" />
      <h3>{user.name}</h3>
    </div>
  )
})

// ❌ Jangan memo semua — hanya yang sering re-render dengan props sama
// ❌ Jangan memo komponen yang selalu menerima props baru
```

### `useMemo` & `useCallback`

```tsx
// ✅ Kalkulasi mahal — memoize
const processedRows = useMemo(() =>
  rows.filter(...).sort(...),
  [rows, filters, sortConfig]
)

// ✅ Stable callback untuk child yang di-memo
const handleSelect = useCallback((id: string) => onSelect(id), [onSelect])

// ❌ Terlalu murah — tidak perlu useMemo
const label = useMemo(() => `Hello, ${name}`, [name])
// ✅ Cukup inline
const label = `Hello, ${name}`
```

### `useTransition` & `useDeferredValue`

```tsx
// ✅ useTransition — update filter tidak freeze input
const [isPending, startTransition] = useTransition()
function handleChange(e) {
  setQuery(e.target.value)                // urgent
  startTransition(() => setFiltered(...)) // non-urgent, bisa di-interrupt
}

// ✅ useDeferredValue — untuk komponen yang sudah di-memo
const deferredQuery = useDeferredValue(query)
const isStale = query !== deferredQuery
<div style={{ opacity: isStale ? 0.5 : 1 }}>
  <MemoizedSlowList query={deferredQuery} />
</div>
```

---

## Checklist Performance — React 19 + Vite

### Build & Bundle

- [ ] Bundle dianalisis dengan `rollup-plugin-visualizer` sebelum deploy pertama
- [ ] `manualChunks` dikonfigurasi untuk library besar
- [ ] `target: 'es2022'` untuk output lebih kecil
- [ ] Tidak ada library duplikat atau bundle full yang seharusnya di-tree-shake
- [ ] Format gambar modern dipakai (WebP/AVIF)

### Code Splitting

- [ ] Setiap route di-`lazy()` — route-based splitting wajib
- [ ] Komponen besar yang tidak selalu tampil di-`lazy()`
- [ ] `Suspense` boundary granular — beberapa kecil lebih baik dari satu besar

### Gambar & Asset

- [ ] Gambar pakai `loading="lazy"` kecuali LCP element
- [ ] LCP element pakai `fetchpriority="high"`
- [ ] `width` dan `height` selalu ada untuk hindari CLS
- [ ] Gambar dioptimasi dengan `vite-imagetools` (resize + WebP)

### React

- [ ] Kalkulasi mahal di render pakai `useMemo`
- [ ] Callback ke child yang di-`memo` pakai `useCallback`
- [ ] Filter/search berat pakai `useTransition` atau `useDeferredValue`
- [ ] React DevTools Profiler dipakai untuk verifikasi re-render

### Dev Experience

- [ ] `optimizeDeps.include` berisi library yang sering dipakai
- [ ] `server.warmup.clientFiles` berisi file yang sering dibuka
- [ ] Tidak ada barrel export yang besar-besaran

---

## Referensi Cepat — Situasi vs Solusi

| Situasi                        | Solusi Vite                                   |
| ------------------------------ | --------------------------------------------- |
| Bundle terlalu besar           | `visualizer` audit → `manualChunks`           |
| Route lambat pertama kali      | `lazy()` per route                            |
| Komponen berat jarang tampil   | `lazy()` + load on interaction                |
| Halaman berikutnya perlu cepat | `/* @vite-prefetch */`                        |
| Gambar lambat                  | `loading="lazy"` + WebP via `vite-imagetools` |
| LCP score buruk                | `fetchpriority="high"` + tidak lazy           |
| Dev server lambat start        | `optimizeDeps.include`                        |
| HMR lambat                     | Kurangi barrel exports, pecah file besar      |
| Re-render tidak perlu          | `memo` + props stable                         |
| UI freeze saat filter          | `useTransition` / `useDeferredValue`          |
| Kalkulasi mahal di render      | `useMemo`                                     |
