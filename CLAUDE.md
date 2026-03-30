# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
pnpm dev              # Start dev server (8 GB heap)
pnpm build            # Type-check then build for production
pnpm preview          # Preview production build

# Code quality
pnpm lint             # ESLint
pnpm lint:fix         # ESLint with auto-fix

# Testing
pnpm test             # Run all tests once (Vitest)
pnpm test src/lib/html.test.ts   # Run a single test file
```

Note: There is no separate `typecheck` script — type checking runs as part of `pnpm build` via `astro check`.

Pre-commit hook runs `eslint --fix` via lint-staged on staged files.

## Architecture

### Stack
Astro (SSG/SSR) + React islands + Tailwind CSS v4 + shadcn/ui (Radix UI primitives). Deployed to Vercel. Package manager: pnpm workspace.

### Path Aliases (tsconfig / vitest)
| Alias | Resolves to |
|---|---|
| `@components` | `src/components/` |
| `@consts` | `src/consts.tsx` |
| `@layouts` | `src/layouts/` |
| `@lib` | `src/lib/` |
| `@react` | `src/react/` |
| `@styles` | `src/styles/` |
| `@types` | `src/types.ts` |
| `@content` | `src/content/` |

### Content Collections (`src/content/`)
Typed via Zod schemas in `src/content/config.ts`. Collections: `blog`, `journals`, `photos`, `projects`. Blog posts and journals are Markdown/MDX. Photos use a YAML/frontmatter list with image references.

### Pages & Routing (`src/pages/`)
File-based Astro routing. Key routes:
- `[...slug].astro` — blog post pages
- `[journal].astro` — individual journal entries
- `photo/[...slug].astro` — photo album pages
- `projects/*/index.astro` — project demo pages, each wrapping a React component (`_index.tsx`)
- `api/` — Vercel serverless API routes (link shortener backed by `@vercel/postgres` + Kysely)
- `i/[key].ts` — short-link redirect endpoint

### Project Demo Pattern
Each interactive project under `src/pages/projects/<name>/` follows this convention:
- `index.astro` — Astro shell using `Minimal.astro` layout
- `_index.tsx` — React component with the actual demo UI
- `_logic.ts` (optional) — pure business logic, independently testable
- `_logic.test.ts` / `_index.test.tsx` (optional) — Vitest unit/component tests

### Layouts
- `PageLayout.astro` — full site layout (Header, Footer, SEO head, KaTeX CSS, medium-zoom, mermaid, rough-notation for article annotations)
- `Minimal.astro` — bare layout for project demos

### React Components
- `src/react/components/` — feature-level components (photo gallery with lightbox, project list, Docker-style dock, etc.)
- `src/react/ui/` — shadcn/ui primitives (excluded from `tsconfig.json` strict checks)

### Utilities (`src/lib/`)
- `html.ts` — reading time, word count, excerpt extraction, image path resolution for content images
- `algolia.mjs` — Algolia search index helpers

### Styling
- Tailwind CSS v4 (via `@tailwindcss/vite`). Global styles in `src/styles/global.css`.
- DaisyUI v5 for stat/badge/drawer primitives (prefixed `daisy-*`).
- Iconify icons used inline as `<span class="iconify <collection>--<name>" />`.

### Site Config
`src/consts.tsx` — site name, per-section metadata, navigation menu items.
