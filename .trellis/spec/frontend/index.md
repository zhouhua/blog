# Frontend Development Guidelines

This site is an Astro content site with React islands. Static pages, layouts, and article chrome live in Astro. Interactive UI lives in React and is mounted with `client:only="react"`.

Read the guide that matches the file you are about to change. Do not apply `src/react/ui/` rules to feature code, or the reverse.

## Guidelines Index

| Guide | Description |
|-------|-------------|
| [Directory Structure](./directory-structure.md) | Where pages, islands, content, and project demos live |
| [Component Guidelines](./component-guidelines.md) | Astro components vs React islands vs shadcn primitives |
| [Hook Guidelines](./hook-guidelines.md) | Custom hooks and the few shared stores |
| [State Management](./state-management.md) | What is static, what is per-island, what is in localStorage |
| [Type Safety](./type-safety.md) | TypeScript, Zod content schemas, `import type` |
| [Quality Guidelines](./quality-guidelines.md) | Lint, tests, and the checks that actually run |

## Stack

- Astro for pages and content collections (`src/content.config.ts`)
- React 19 islands, Tailwind CSS v4, DaisyUI classes prefixed `daisy-*`
- shadcn/ui primitives in `src/react/ui/` (Radix + `class-variance-authority`)
- Path alias: `tsconfig.json` maps `@*` to `./src/*`, so `@components/...` and `@react/...` both work
- Package manager: pnpm

`src/react/ui/` is excluded from `tsconfig.json` and from ESLint. Treat it as generated primitives, not as the house style.
