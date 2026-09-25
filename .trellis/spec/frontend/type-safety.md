# Type Safety

`tsconfig.json` extends `astro/tsconfigs/strictest`, with `strictNullChecks`, `verbatimModuleSyntax`, and `jsx: react-jsx`. `src/react/ui/` is excluded. Do not weaken the config to make a primitive type-check.

Type checking is `pnpm build` (`astro check` then `astro build`). There is no `typecheck` script.

## Where types live

| Scope | Location | Example |
|-------|----------|---------|
| Site-wide contracts | `src/types.ts` | `Site`, `Metadata`, `Socials`, `Menu` |
| Section data that satisfies those contracts | `src/consts.ts` | `SITE: Site`, `HOME: Metadata` |
| Content frontmatter | Zod schema in `src/content.config.ts` | `blog`, `journals`, `projects` |
| One page's data | next to the data | `UseItem` and `UseGroup` in `src/data/uses.ts` |
| One demo's pure logic | next to the logic | `BlurryType` in `src/pages/projects/blurry/_logic.ts` |
| Ambient browser types | `src/env.d.ts` | `ColorMode`, `Window.gtag` |

`ColorMode` is a global type in `src/env.d.ts` (`'dark' | 'light'`). `useColorMode.ts` uses it without an import. Do not redeclare it in the hook file.

If a type is only used by one module, keep it there. Add it to `src/types.ts` only when Astro pages and React islands both need it. `Menu` is the case that is shared; `UseItem` is not.

## Imports

`verbatimModuleSyntax` is on. Type-only imports must be `import type`. ESLint enforces `import/consistent-type-specifier-style: prefer-top-level`, so write:

```ts
import type { Metadata, Site, Socials } from '@types';
```

not an inline `import { type Metadata }`. `src/consts.ts` is the reference.

Prefer `T[]` over `Array<T>`. `ts/array-type` is an error with `default: 'array'`. `Socials` in `src/types.ts` is already an array type alias.

## Runtime validation

Content that comes from Markdown is validated with Zod in `src/content.config.ts`, not with a hand-written type guard. Required blog fields are `category`, `date`, `hero`, `tags`, and `title`. Optional fields stay optional in the schema (`description`, `featured`, `heroCopyright`, `type`).

Client forms in demos use Zod too. `src/pages/projects/blurry/_index.tsx` defines `formSchema` and passes it through `zodResolver`. Share the inferred type with the form instead of duplicating a parallel interface.

API request bodies are a separate layer: `src/pages/api/_schemas.ts`. Do not import those schemas into Astro pages to type content.

## React props

Export a named interface when the component takes props (`I18nProviderProps`). Extend DOM attributes only in `src/react/ui/`, where `ButtonProps` extends `React.ButtonHTMLAttributes<HTMLButtonElement>` and `VariantProps<typeof buttonVariants>`. Feature islands should not copy that `forwardRef` boilerplate unless they wrap a DOM node the same way.

`React.ReactNode` is the children type (`I18nProviderProps`). Globals such as `React.FC` are used in feature components (`ColorMode`). Either is acceptable. Class components and PropTypes are not.

## Anti-patterns

- Do not `as any` a content entry to skip the Zod schema. Add the field to `src/content.config.ts`.
- Do not import from `src/react/ui/` and then expect `astro check` to type-check those primitive internals. They are excluded. Type-check the feature file that imports them.
- Do not add a second `ColorMode` type.
- Caught errors may be unused (`unused-imports/no-unused-vars` sets `caughtErrors: 'none'`). Unused function args must be named `_arg`.
