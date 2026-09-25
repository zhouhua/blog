# State Management

Most of the site has no client state. Pages are static HTML produced by Astro. Client state exists only inside React islands, and islands do not share a React tree.

## What goes where

| State | Where it lives | Example |
|-------|----------------|---------|
| Page content, nav labels, homepage counts | build-time data | `getCollection` in pages; `SITE` / `HOME` in `src/consts.ts`; `USES_GROUPS` in `src/data/uses.ts` |
| Widget-local UI | `useState` / `useReducer` inside that island | form state in `src/pages/projects/blurry/_index.tsx` |
| Theme, shared by every island that toggles it | `useColorMode` | `src/react/components/ColorMode.tsx` writes storage key `colorMode` and toggles the `dark` class on `<html>` |
| Values that must survive a reload and be visible to more than one island | `createGlobalStore` | `useRecentList` stores `recentSearch` |
| Language on demo pages | i18next, only under `Minimal.astro` | `src/i18n/config.ts`, `src/react/components/I18nProvider.tsx` |
| Short links | server, not client state | `src/pages/api/` |

There is no Redux, Zustand, Jotai, or React Query. Do not add one for a single island.

## Islands are separate stores

`PageLayout.astro` renders `<Header />`, `<main><slot /></main>`, and `<Footer />` as Astro. `Header.astro` then mounts `SearchButton`, `ColorMode`, and `MobileMenu` as three `client:only="react"` roots. A React context provider in one of them does not wrap the others.

The only provider that wraps page content is `I18nProvider` in `src/layouts/Minimal.astro`. It exists so project demos can call `useTranslation` from `react-i18next`. Locale detection is `i18next-browser-languagedetector`, with `fallbackLng: 'zh'`. `I18nProvider` also reapplies `localStorage` key `locale` on mount. Site chrome in `PageLayout` is Chinese copy written in the Astro file, not `t()` strings.

If two islands under `PageLayout` need the same value, use `createGlobalStore` or the existing `useColorMode` hook. Do not wrap `PageLayout` in a new client provider to "make context work". That would force the whole page to become one island.

## Persistence

Keys already in `localStorage`:

- `colorMode` — `'dark' | 'light'`, owned by `useColorMode`
- `recentSearch` — `IRecentItem[]`, owned by `useRecentList`, max 5
- `locale` — read by `I18nProvider`

`createGlobalStore` JSON-encodes the value and swallows storage exceptions. New persisted state should go through that helper so the cache key is shared across islands. Do not call `localStorage` ad hoc in a component if another island must read the same key.

## Server and content data

Blog, journal, and project content is validated by Zod in `src/content.config.ts` and read in Astro frontmatter. Do not re-fetch a post in `useEffect` to render it.

Client-only remote data is limited. Search uses Algolia (`src/lib/algolia.ts`). Link shortening uses `src/pages/api/`. New client reads should stay inside the island that displays them.

## Anti-patterns

- Do not lift demo form state into `src/react/hooks/` unless a second route needs it.
- Do not store content-collection entries in React state.
- Do not sync theme by adding `dark` on a wrapper `<div>`. `useColorMode` toggles the class on `<html>`, and Tailwind `dark:` variants depend on that.
- Do not introduce a global store for a value that only one component reads. `useState` is enough.
