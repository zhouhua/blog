# Quality Guidelines

Match the checks the repo already runs. Do not add a second formatter or a new test runner.

## Commands

```bash
pnpm lint          # eslint, zero warnings policy is not configured; warnings exist
pnpm lint:fix      # eslint --fix
pnpm test          # vitest run, jsdom, src/**/*.test.ts and src/**/*.test.tsx
pnpm build         # astro check, then astro build
```

`pnpm build` is the type check. Pre-commit runs `eslint --fix` through lint-staged on staged files.

Vitest config is `vitest.config.ts`: environment `jsdom`, setup file `vitest.setup.ts`, include only tests under `src/`. Files in `tests/*.test.mjs` are not part of that include list. `tests/responsive-layout.test.mjs` is a source-text assertion over Astro/TSX class names, not a browser test. Follow that style only when you are locking a class string; otherwise use a `src/**/*.test.ts` unit test.

## Lint

Config is `eslint.config.mjs`, based on `@antfu/eslint-config`, with Astro and React enabled and Vue disabled. Markdown lint is off.

Ignored:

- `src/react/ui/**/*`
- `dist/**/*`, `public/**/*`, `.astro/**/*`

Rules that change how feature code is written:

- Semicolons required, max line length 120.
- `no-console` is a warning. Do not leave `console.log` in islands.
- `react/no-class-component`, `react/no-prop-types`, `react/jsx-no-comment-textnodes`, `react/no-useless-fragment` are errors.
- `react-dom/no-unsafe-target-blank` is an error on React JSX. New React links with `target="_blank"` must satisfy that rule. Astro templates do not: `src/components/Footer.astro` and the Ko-fi link in `src/layouts/Minimal.astro` use `target="_blank"` with no `rel`. Leave those unless the task is about that link. The `eslint-disable` in `Minimal.astro` is for an Astro expression the React parser still sees; do not copy it into `.tsx` files.
- `perfectionist/sort-objects` and related sort rules are warnings. `sort-variable-declarations` uses line length. Let lint-staged rewrite order instead of hand-sorting in a way that fights the rule.

## Tests

Extract pure logic and test that, instead of rendering the whole island.

- `src/pages/projects/blurry/_logic.test.ts` tests `getBackgroundValueUpdate` with `describe` / `it` / `expect` from Vitest.
- `src/lib/html.test.ts` is the model for a shared helper.
- `src/pages/projects/blurry/_index.test.tsx` exists for component behavior. Prefer a `_logic.ts` test when the bug is in a calculation.

Test names state the observable result ("does not request an update when type1 background already matches"), not the function call.

A change to article layout classes should update `tests/responsive-layout.test.mjs` if that file already asserts the class string. Do not invent a new Playwright suite for a class tweak.

## Accessibility

The site is not running an a11y linter beyond the React DOM rules above. Follow the patterns that are already present:

- `<html lang="zh-Hans">` in both layouts.
- Images passed to `astro:assets` `Image` include `alt` (`Header.astro`).
- The theme control is a `<label>` wrapping a checkbox (`ColorMode.tsx`), not a clickable `<div>`.
- Icon-only links need an accessible name. Do not ship a Lucide icon as the only content of an `<a>` without text or `aria-label`.

Do not add `eslint-plugin-jsx-a11y` as part of an unrelated change.

## Anti-patterns

- Do not lint-fix `src/react/ui/`. It is ignored, and reformatting it creates noise.
- Do not satisfy `astro check` by excluding a feature file. The exclude list is only `src/react/ui/`.
- Do not mock `localStorage` in a test of a pure function. Move the pure part into `_logic.ts` first, the way blurry does.
