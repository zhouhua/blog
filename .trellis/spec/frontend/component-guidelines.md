# Component Guidelines

There are three component kinds. Pick one before writing the file.

| Kind | Location | Rendered by | Styling attribute |
|------|----------|-------------|-------------------|
| Astro component | `src/components/`, `src/layouts/`, `src/pages/` | server, at build time | `class` |
| React island | `src/react/components/`, project `_index.tsx` | browser only | `className` |
| shadcn primitive | `src/react/ui/` | imported by islands | `className`, `cn()`, `cva` |

## Astro components

Props are a frontmatter `type Props`. Destructure `Astro.props`. Children go through `<slot />`.

`src/layouts/PageLayout.astro`:

```astro
type Props = {
  title: string;
  description: string;
};

const { description, title } = Astro.props;
```

Site pages pass `title` and `description` from `src/consts.ts` (`HOME`, `BLOG`, `USES`, and so on) into `PageLayout`. `Head.astro` turns that into `` `${title} | ${SITE.NAME}` ``.

Use `class`, not `className`, on HTML elements in `.astro` files. React children embedded in Astro still use `className`, because they are React. `src/components/Header.astro` does both: the `<header>` uses `class`, and the Lucide icon uses `className`.

## React islands

Mount interactive components with `client:only="react"`. This codebase does not use `client:load`, `client:idle`, or `client:visible`. Islands are not server-rendered, so they must tolerate a missing `window` only if the module itself runs during import. Prefer reading `window` / `localStorage` inside functions, as `src/react/hooks/useColorMode.ts` does in `setup()`.

Examples:

- `src/components/Header.astro` mounts `ColorMode` and `MobileMenu`
- `src/pages/projects/blurry/index.astro` mounts `Blurry` inside `Minimal`
- `src/pages/[...slug].astro` mounts `Comment` and `TracingBeam`

Each `client:only` directive is its own React root. A hook or context in one island is invisible to another. Shared browser state goes through the stores in [State Management](./state-management.md), not through a provider wrapped around `PageLayout`.

`Minimal.astro` is the exception: `<I18nProvider client:only="react">` wraps `<slot />`, so demo pages inside that slot can call `useTranslation`. `PageLayout` does not do this. Do not add `useTranslation` to header islands and expect it to work.

Feature components are function components. ESLint rule `react/no-class-component` is an error. Default export is the common shape (`export default ColorMode` in `src/react/components/ColorMode.tsx`). Named exports are also used (`I18nProvider`, `HelpDrawer`). Folder islands re-export from `index.ts`.

Props for a small island can be `React.FC` with no props (`ColorMode`). When there are props, use a named interface next to the component (`I18nProviderProps` in `src/react/components/I18nProvider.tsx`). Do not use PropTypes (`react/no-prop-types` is an error).

Form-heavy demos keep the schema next to the component and the pure updates in `_logic.ts`. `src/pages/projects/blurry/_index.tsx` defines a Zod `formSchema`, uses `react-hook-form`, and imports `getBackgroundValueUpdate` from `./_logic`.

## shadcn primitives

`src/react/ui/button.tsx` is the pattern: `cva` variants, `React.forwardRef`, `asChild` via Radix `Slot`, and `cn()` from `@lib/utils`. These files use double quotes and are ignored by ESLint (`eslint.config.mjs` ignores `src/react/ui/**/*`) and by `tsconfig.json` (`exclude: ["src/react/ui/"]`).

When a feature needs a button, import `{ Button, buttonVariants }` from `@react/ui/button`. Do not copy the primitive into `src/react/components/`. Do not reformat `src/react/ui/` to single quotes as a drive-by change.

DaisyUI is used as class names on feature markup, prefixed `daisy-` (`daisy-swap`, `daisy-theme-controller` in `ColorMode.tsx`). Do not import DaisyUI React components. There are none in this repo.

## Styling

- Feature TypeScript uses the `@antfu/eslint-config` style: semicolons, single quotes, 2-space indent, max line length 120 (`eslint.config.mjs`).
- Merge Tailwind classes with `cn()` from `src/lib/utils.ts` (`clsx` + `tailwind-merge`). Do not concatenate class strings when both sides may set the same utility.
- Icons in Astro templates are `lucide-react` (or `react-icons`) elements with `client:only="react"`.
- Global visual tokens and article styles belong in `src/styles/`, not in a one-off `<style>` block, unless the rule is local to one Astro component the way `.logo-container` is local to `Header.astro`.

## Anti-patterns

- Do not server-render a React island. If it touches `document` or `localStorage` at render time, `client:load` will break the build. Follow the existing `client:only="react"` usage.
- Do not define a component inside another component (`react/no-nested-component-definitions`).
- Do not pass `children` as a prop (`react/no-children-prop`).
- Do not use `class` on a React component or `className` on a plain HTML tag in an `.astro` file.
