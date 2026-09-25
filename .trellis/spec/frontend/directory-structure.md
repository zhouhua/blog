# Directory Structure

New UI follows the split already in `src/`. Astro owns the document. React owns islands. Do not put a new page component under `src/react/` just because it uses Tailwind.

## Directory Layout

```
src/
├── pages/                  # Astro routes. One file per URL.
│   ├── [...slug].astro     # blog posts
│   ├── [journal].astro     # journal entries
│   ├── api/                # Vercel serverless routes (not UI)
│   ├── i/[key].ts          # short-link redirect
│   └── projects/<name>/    # interactive demos (see below)
├── layouts/
│   ├── PageLayout.astro    # site chrome: Head, Header, Footer
│   └── Minimal.astro       # bare shell for project demos
├── components/             # Astro-only shared chrome and list markup
├── react/
│   ├── components/         # React islands used by Astro pages
│   ├── hooks/              # custom hooks
│   └── ui/                 # shadcn primitives. Excluded from lint and tsconfig.
├── content/                # Markdown/MDX and content-collection files
├── content.config.ts       # Zod schemas for collections
├── data/                   # hand-written static data, e.g. src/data/uses.ts
├── i18n/                   # i18next config and locale objects
├── lib/                    # framework-agnostic helpers
├── consts.ts               # SITE, section metadata, nav data
├── types.ts                # shared site types
├── styles/                 # global CSS
└── assets/                 # imported images and icons
```

Reference files:

- `src/layouts/PageLayout.astro`
- `src/layouts/Minimal.astro`
- `src/pages/uses.astro`
- `src/pages/projects/blurry/index.astro`

## Where a new feature goes

| Kind of change | Put it in |
|----------------|-----------|
| New URL | `src/pages/<route>.astro`, wrapped in `PageLayout` unless it is a full-screen demo |
| Shared header, footer, list row, article chrome | `src/components/*.astro` |
| Widget that needs click, state, or browser APIs | `src/react/components/`, then mount it from Astro |
| shadcn primitive (Button, Dialog, Form) | `src/react/ui/`. Do not restyle these files to match feature-code formatting. |
| Pure function with no DOM | `src/lib/` if it is shared, or `_logic.ts` next to a project demo |
| Blog post, journal, project write-up | `src/content/` and the matching schema in `src/content.config.ts` |
| Page copy that is data, not a component | `src/data/` plus a `Metadata` entry in `src/consts.ts` |

`src/pages/api/` and `src/pages/i/` are server endpoints. Do not import React components into them.

## Project demo pattern

Interactive demos under `src/pages/projects/<name>/` use this layout:

- `index.astro` — Astro shell. Full-screen toys use `Minimal.astro`. Demos that should keep the site header use `PageLayout.astro` (see `src/pages/projects/es-toolkit-benchmark/index.astro`).
- `_index.tsx` — the React UI. The leading underscore keeps it out of Astro's route table.
- `_logic.ts` — optional pure logic, imported by the component and by tests.
- `_logic.test.ts` / `_index.test.tsx` — optional Vitest files next to the code.

`src/pages/projects/blurry/` is the reference: `index.astro` renders `<Blurry client:only="react" />`, and `_logic.ts` holds `getBackgroundValueUpdate`.

A multi-file island can live in a folder with a barrel file. `src/react/components/Search/index.ts` re-exports `SearchButton` and `SearchPanel`.

## Naming

- Astro components and React components: `PascalCase.astro` / `PascalCase.tsx`. ESLint enforces `react-naming-convention/component-name`.
- Route files stay lowercase or match Astro's dynamic pattern: `uses.astro`, `[...slug].astro`.
- Colocated non-route modules in `src/pages/` start with `_` so Astro does not treat them as pages.
- Hooks: `useX.ts` in `src/react/hooks/`. `use-mobile.ts` is the existing kebab-case exception; new hooks use camelCase filenames (`useColorMode.ts`, `useRecentList.ts`).
- Import with the `@` prefix: `@components/Container.astro`, `@react/components/ColorMode`, `@lib/utils`, `@consts`.

## Assets and content

Import images through Astro, do not hard-code `/public` paths when the file lives in `src/assets/`. `src/components/Header.astro` imports `@assets/icon/logo.svg` and passes it to `astro:assets` `Image`.

Content collections currently defined in `src/content.config.ts`:

- `blog` — `src/content/blog/**/*.md`
- `journals` — `src/content/journals/**/*.{md,mdx}`
- `projects` — content collection with `name`, `description`, `link`, `type`

Files starting with `_` are excluded from the blog and journal loaders (`**/[^_]*`).

## Anti-patterns

- Do not add a React page that reimplements `Header` / `Footer`. Those are Astro components in `PageLayout.astro`.
- Do not put feature logic in `src/react/ui/`.
- Do not create `src/pages/projects/<name>/index.tsx`. The route file is `index.astro`.
- Vitest's alias map in `vitest.config.ts` still points `@consts` at `src/consts.tsx`. The real file is `src/consts.ts`. App code relies on the `tsconfig.json` `@*` wildcard. Do not "fix" imports to `.tsx` to match the stale alias.
