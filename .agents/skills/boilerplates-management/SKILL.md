---
name: boilerplates-management
description: Provides standard templates, folder structures, and conventions for generating new files, components, features, and modules. Use this skill when scaffolding new code or creating files from scratch.
---

# Boilerplates Management Skill

This skill defines the standard boilerplates and structures you must follow when creating new files or features. Always adhere to these templates to maintain codebase consistency.

## 📁 Project Structure (Feature-Sliced Design)

The project follows a modular, feature-based architecture.

```text
src/
  ├── components/      # Global shared UI components (buttons, inputs)
  ├── features/        # Feature-specific modules (auth, users, products)
  ├── hooks/           # Global shared React hooks
  ├── lib/             # Third-party library configurations (axios, query client)
  ├── stores/          # Global state (Zustand)
  ├── types/           # Global TypeScript types (API responses, generic models)
  └── utils/           # Global utility functions (formatting, validation)
```

Inside `features/[feature-name]/`:

```text
features/[feature-name]/
  ├── api/             # API request functions / React Query hooks specific to feature
  ├── components/      # Feature-specific components
  ├── hooks/           # Hooks that encapsuate feature-specific logic
  ├── types/           # Types specific to this feature
  └── utils/           # Utility functions specific to this feature
```

---

## 🏗️ Standard Boilerplates

### 1. React Component (Function Component)

Follow React 19 best practices: `ref` as a prop, explicit `children`, `memo` for reusable UI.

```tsx
import { memo } from 'react'

export interface MyComponentProps {
  title: string
  children?: React.ReactNode
  ref?: React.Ref<HTMLDivElement>
  className?: string
}

function MyComponent({ title, children, ref, className }: MyComponentProps) {
  return (
    <div ref={ref} className={className}>
      <h2>{title}</h2>
      {children}
    </div>
  )
}

export default memo(MyComponent)
```

### 2. Custom Hook

```typescript
import { useState, useCallback } from 'react'

export interface UseMyCustomLogicReturn {
  isActive: boolean
  toggle: () => void
}

export function useMyCustomLogic(
  initialState: boolean = false,
): UseMyCustomLogicReturn {
  const [isActive, setIsActive] = useState(initialState)

  const toggle = useCallback(() => {
    setIsActive((prev) => !prev)
  }, [])

  return { isActive, toggle }
}
```

### 3. TanStack Query Fetch Hook (in `features/[name]/api/`)

```typescript
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { MyData } from '../types'

export const getMyDataKey = (id: string) => ['my-data', id]

async function fetchMyData({ queryKey }: any): Promise<MyData> {
  const [_key, id] = queryKey
  const response = await apiClient.get<MyData>(`/api/data/${id}`)
  return response.data
}

export function useMyData(id: string) {
  return useQuery({
    queryKey: getMyDataKey(id),
    queryFn: fetchMyData,
    enabled: !!id,
  })
}
```

### 4. TanStack Query Mutation Hook (in `features/[name]/api/`)

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { CreateDto, MyData } from '../types'

async function createData(data: CreateDto): Promise<MyData> {
  const response = await apiClient.post<MyData>('/api/data', data)
  return response.data
}

export function useCreateData() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createData,
    onSuccess: (newData) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['my-data-list'] })
    },
  })
}
```

### 5. Zustand Global Store

```typescript
import { create } from 'zustand'

interface AppState {
  theme: 'light' | 'dark'
  setTheme: (theme: 'light' | 'dark') => void
  toggleTheme: () => void
}

export const useAppStore = create<AppState>((set) => ({
  theme: 'light',
  setTheme: (theme) => set({ theme }),
  toggleTheme: () =>
    set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
}))
```

### 6. Utility Function

```typescript
/**
 * Formats a given number into a currency string representation.
 *
 * @param value The raw numerical value
 * @param currency The currency code (default: 'IDR')
 * @returns Formatted currency string
 */
export function formatCurrency(
  value: number,
  currency: string = 'IDR',
): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(value)
}
```

---

## 💡 Rules & Conventions

1. **Exports**: Prefer named exports for functions, hooks, and utilities. Use default export OR named export for React components depending on the project style (usually default export for pages/routes, named exports for UI components, but be consistent with existing files).
2. **File Naming**:
   - Components & Hooks: `kebab-case.tsx` or `kebab-case.ts` (e.g., `user-profile.tsx`, `use-auth.ts`)
   - Interfaces & Types: Put in `types.ts` or `[feature].types.ts`
3. **Imports**: Prefer absolute imports (`@/...`) over complex relative paths (`../../..`).
4. **Types**: Always type function parameters and return values (especially for hooks and API calls). Do not use `any` unless absolutely necessary.
5. **Colocation**: Keep components, tests, styles, and utilities as close to their usage as possible. Extract to generic folders (`src/components` or `src/utils`) only if reused across multiple features.
