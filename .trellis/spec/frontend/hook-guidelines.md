# Hook Guidelines

Custom hooks live in `src/react/hooks/`. The directory is small on purpose. Content pages do not fetch data in hooks; Astro loads content at build time.

## Existing hooks

| Hook | File | Use it for |
|------|------|------------|
| `useColorMode` | `src/react/hooks/useColorMode.ts` | Read or set `'dark' \| 'light'`. Writes `document.documentElement` class `dark` and `localStorage` key `colorMode`. |
| `useRecentList` | `src/react/hooks/useRecentList.ts` | Search recents. Caps the list at 5. Storage key `recentSearch`. |
| `useIsMobile` | `src/react/hooks/use-mobile.ts` | Viewport below 640px. Returns `false` during SSR via `getServerSnapshot`. |
| `createGlobalStore` | `src/react/hooks/createGlobalStore.ts` | Build another localStorage-backed store. Do not call this from render for a one-off value. |

`useColorMode` and `useRecentList` are default exports. `useIsMobile` and `MOBILE_BREAKPOINT` are named exports. Match the file you are extending.

## When to add a hook

Add a hook when the same browser subscription or storage update is needed by more than one island, or when the component is mostly that subscription.

Keep it in the component when it is used once. `src/pages/projects/blurry/_index.tsx` calls `useState`, `useReducer`, `useForm`, and `useWindowSize` directly. That is the right place for demo-local state.

Do not add a hook that wraps a single `useState`. ESLint errors on unnecessary `useCallback` and `useMemo` (`react/no-unnecessary-use-callback`, `react/no-unnecessary-use-memo` in `eslint.config.mjs`). `react-hooks/exhaustive-deps` is a warning. The empty-deps `eslint-disable` in `createGlobalStore.ts` is a known exception; do not copy it into new hooks.

## Patterns that are already in the repo

**Media-query subscription.** `useIsMobile` uses `useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)`. New viewport or `matchMedia` hooks should follow that shape so the server snapshot is explicit. `useColorMode` listens to `prefers-color-scheme` in `useEffect` instead, because it also writes `localStorage` and the `dark` class.

**localStorage-backed global state.** `createGlobalStore(key)` returns a hook backed by `react-use`'s `createGlobalState`. The module-level `globalStoreCache` makes the same key return the same hook, which is how separate `client:only` islands see the same value. `useRecentList` is the example of a domain hook on top of it: it slices to `max`, dedupes, and returns `{ recentList, addRecent, removeRecent, updateRecentList, clearRencenList }`. The `clearRencenList` typo is the current export name. Keep it if you call the existing function. Do not rename it in a drive-by refactor.

**Color mode is not `createGlobalStore`.** It needs to touch `document` and the `html` class, so it has its own `applyChange`. Theme toggles go through `useColorMode`, not a new store.

## Data fetching

There is no SWR or React Query. Article and journal data comes from `astro:content` in `.astro` pages. Client search talks to Algolia from the Search island (`src/lib/algolia.ts`), not from a shared query hook.

If a new island needs request state, keep it local with `useState` unless a second island must observe the same request.

## Anti-patterns

- Do not read `localStorage` or `window` at module scope in a file imported by an Astro page. `useColorMode`'s `setup()` guards with `typeof window === 'undefined'`.
- Do not put hooks in `src/lib/`. That folder is imported by Astro and by tests and must stay free of React.
- Do not create `src/react/hooks/use-*.ts` kebab-case files. `use-mobile.ts` is the only one.
- Do not share state between islands by importing a `useState` hook that is not backed by `createGlobalState`. Each island has its own React tree, so a plain hook would reset.
