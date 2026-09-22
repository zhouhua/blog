# Homepage Uses Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorder the homepage into 精选文章, 项目, 最新随笔, 在用, and show every uses group and item with the existing cards.

**Architecture:** Extract `prepareUseGroups` so `/uses` and the homepage share one filtering and numbering pass. Extract `UseGroupList.astro` for the group body. `/uses` keeps the page title, the empty state, and both anchor navs. The homepage renders the same list nested under a compact「在用」heading and does not render those navs. Article, journal, and project queries stay as they are.

**Tech Stack:** Astro, TypeScript, Vitest, Node test runner with the existing Astro dev-server helper.

**Spec:** `docs/superpowers/specs/2026-09-20-homepage-uses-design.md`

---

## File Map

- Create: `src/data/uses/prepare.ts` — drop empty groups and empty subgroups, then number the remaining groups `01`, `02`, … Do not truncate items.
- Create: `src/data/uses/prepare.test.ts` — Vitest coverage for that function.
- Create: `src/components/UseGroupList.astro` — group title, index, description, optional subgroup anchor nav, direct items, subgroup title, subgroup description, `UseItemList`.
- Modify: `src/styles/design-tokens.css` — apply the section-heading title style to both `h2` and `h3`. Homepage group titles are `h3` inside `.section-heading`, and the current rule only targets `h2`.
- Modify: `src/pages/uses.astro` — call `prepareUseGroups`, keep the group anchor nav here, pass `anchors` into `UseGroupList`.
- Modify: `src/pages/index.astro` — reorder the three existing sections and append「在用」when the prepared list is non-empty.
- Modify: `tests/dev-homepage.test.mjs` — assert homepage section order, nested headings, no uses anchor nav, and that `/uses` still has its anchor nav.
- Do not modify: `src/data/uses/index.ts`, `src/components/HomeProjects.astro`, `src/components/Header.astro`, `src/consts.ts`.

The worktree contains unrelated uncommitted files. Every `git add` below lists exact paths. Do not `git add -A`.

## Task 1: Prepare uses groups

**Files:**
- Create: `src/data/uses/prepare.ts`
- Test: `src/data/uses/prepare.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/data/uses/prepare.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import type { UseGroup, UseItem } from './index';
import { prepareUseGroups } from './prepare';

function item(name: string): UseItem {
  return { name, note: `${name} note` };
}

describe('prepareUseGroups', () => {
  it('drops empty groups, drops empty subgroups, keeps every remaining item, and renumbers', () => {
    const groups: UseGroup[] = [
      { description: 'nothing', id: 'empty', items: [], title: '空' },
      {
        description: 'direct items',
        id: 'a',
        items: [item('one'), item('two')],
        title: 'A',
      },
      {
        description: 'only subgroups',
        id: 'b',
        items: [],
        subgroups: [
          { id: 'b-empty', items: [], title: '空子类' },
          { id: 'b-x', items: [item('three')], title: 'X' },
        ],
        title: 'B',
      },
    ];

    const result = prepareUseGroups(groups);

    expect(result.map(group => group.id)).toEqual(['a', 'b']);
    expect(result.map(group => group.indexLabel)).toEqual(['01', '02']);
    expect(result[0]?.items.map(entry => entry.name)).toEqual(['one', 'two']);
    expect(result[1]?.subgroups.map(subgroup => subgroup.id)).toEqual(['b-x']);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test src/data/uses/prepare.test.ts`

Expected: FAIL because `./prepare` does not exist.

- [ ] **Step 3: Write the minimal implementation**

Create `src/data/uses/prepare.ts`:

```ts
import type { UseGroup, UseSubgroup } from './index';

export interface PreparedUseGroup extends Omit<UseGroup, 'subgroups'> {
  indexLabel: string;
  subgroups: UseSubgroup[];
}

export function prepareUseGroups(groups: UseGroup[]): PreparedUseGroup[] {
  return groups
    .map(group => ({
      ...group,
      subgroups: (group.subgroups ?? []).filter(subgroup => subgroup.items.length > 0),
    }))
    .filter(group => group.items.length > 0 || group.subgroups.length > 0)
    .map((group, index) => ({
      ...group,
      indexLabel: String(index + 1).padStart(2, '0'),
    }));
}
```

Use `import type` so this module does not load the logo images in `index.ts`.

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test src/data/uses/prepare.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/data/uses/prepare.ts src/data/uses/prepare.test.ts
git commit -m "$(cat <<'EOF'
feat: prepare uses groups before rendering

EOF
)"
```

## Task 2: Share the uses group list

**Files:**
- Create: `src/components/UseGroupList.astro`
- Modify: `src/pages/uses.astro`
- Modify: `src/styles/design-tokens.css`
- Test: `tests/dev-homepage.test.mjs`

This task must not change what `/uses` shows. The new test is a characterization test: it passes before the move and must still pass after.

- [ ] **Step 1: Add the characterization test**

Append this test to `tests/dev-homepage.test.mjs`:

```js
test('uses page keeps group and subgroup anchor navs', async () => {
  await withAstroDevServer(async ({ baseUrl }) => {
    const response = await fetch(new URL('/uses', baseUrl));
    const html = await response.text();

    assert.equal(response.status, 200);
    assert.match(html, /<nav[^>]*aria-label="分组"/);
    assert.match(html, /<nav[^>]*aria-label="Skill的子分类"/);
    assert.match(html, /<h2[^>]*>Skill<\/h2>/);
    assert.match(html, /<h3[^>]*>方法论<\/h3>/);
    assert.ok(html.includes('trellis'));
    assert.ok(html.includes('raycast'));
  });
}, 30000);
```

- [ ] **Step 2: Run the test to verify it passes on the current page**

Run: `node --test tests/dev-homepage.test.mjs`

Expected: PASS, including the new test. If the new test fails before any edit, the assertion does not match the current `/uses` markup. Fix the assertion, not the page.

- [ ] **Step 3: Add `UseGroupList.astro`**

Create `src/components/UseGroupList.astro`:

```astro
---
import type { PreparedUseGroup } from '@data/uses/prepare';
import UseItemList from '@components/UseItemList.astro';

interface Props {
  groups: PreparedUseGroup[];
  /** /uses passes this. Homepage must leave it off. */
  anchors?: boolean;
  /** Homepage passes this so groups sit under the「在用」h2. */
  nested?: boolean;
}

const { anchors = false, groups, nested = false } = Astro.props;
const GroupHeading = nested ? 'h3' : 'h2';
const SubgroupHeading = nested ? 'h4' : 'h3';
---

{groups.map(group => (
  <section class="scroll-mt-28" id={group.id}>
    <div class="section-heading section-heading-compact">
      <GroupHeading class="colorModeTransition">{group.title}</GroupHeading>
      <div class="section-heading-divider colorModeTransition" />
    </div>
    <p class="mb-6 max-w-2xl font-serif text-sm leading-6 text-muted-foreground">
      <span class="mr-2 font-sans text-xs tracking-widest">{group.indexLabel}</span>
      {group.description}
    </p>
    {anchors && group.subgroups.length > 1 && (
      <nav aria-label={`${group.title}的子分类`} class="mb-2 flex flex-wrap gap-x-4 gap-y-2">
        {group.subgroups.map(subgroup => (
          <a
            class="text-sm text-muted-foreground underline-offset-4 hover:text-accent-foreground hover:underline"
            href={`#${subgroup.id}`}
          >
            {subgroup.title}
          </a>
        ))}
      </nav>
    )}
    {group.items.length > 0 && <UseItemList items={group.items} />}
    {group.subgroups.map(subgroup => (
      <section class="mt-10 scroll-mt-28" id={subgroup.id}>
        <SubgroupHeading class="text-xl font-semibold leading-8">{subgroup.title}</SubgroupHeading>
        {subgroup.description && (
          <p class="mt-2 max-w-2xl font-serif text-sm leading-6 text-muted-foreground">
            {subgroup.description}
          </p>
        )}
        <div class="mt-4">
          <UseItemList items={subgroup.items} />
        </div>
      </section>
    ))}
  </section>
))}
```

The page-level group nav stays in `uses.astro`. Subgroup nav is inside this component because it sits between a group's description and its items. Only `/uses` sets `anchors`.

- [ ] **Step 4: Switch `/uses` to the shared list**

Replace `src/pages/uses.astro` with:

```astro
---
import Container from '@components/Container.astro';
import ListTitle from '@components/ListTitle.astro';
import UseGroupList from '@components/UseGroupList.astro';
import { USES } from '@consts';
import { USES_GROUPS } from '@data/uses';
import { prepareUseGroups } from '@data/uses/prepare';
import PageLayout from '@layouts/PageLayout.astro';

const groups = prepareUseGroups(USES_GROUPS);
---

<PageLayout description={USES.DESCRIPTION} title={USES.TITLE}>
  <ListTitle
    description={USES.DESCRIPTION}
    title={`周骅的博客 - ${USES.TITLE}`}
  />
  <Container>
    {groups.length === 0 && (
      <p class="font-serif text-muted-foreground">还没有条目。</p>
    )}
    {groups.length > 1 && (
      <nav aria-label="分组" class="mb-4 flex flex-wrap gap-x-5 gap-y-2">
        {groups.map(group => (
          <a
            class="text-sm text-muted-foreground underline-offset-4 hover:text-accent-foreground hover:underline"
            href={`#${group.id}`}
          >
            {group.title}
          </a>
        ))}
      </nav>
    )}
    <UseGroupList anchors groups={groups} />
  </Container>
</PageLayout>
```

- [ ] **Step 5: Run the characterization test again**

Run: `node --test tests/dev-homepage.test.mjs`

Expected: PASS. `/uses` still has `aria-label="分组"`, `aria-label="Skill的子分类"`, an `h2` of Skill, an `h3` of 方法论, and the item names.

- [ ] **Step 6: Extend section-heading title styles to `h3`**

Homepage group titles are `h3` elements inside `.section-heading`. Subgroup titles are outside `.section-heading`, so they must not pick up this rule.

First append this test to `tests/dev-homepage.test.mjs`. Import `readFile` from `node:fs/promises`. This file currently imports only `node:assert/strict`, `node:test`, and the dev-server helper.

```js
test('section heading title style covers h2 and h3', async () => {
  const css = await readFile(new URL('../src/styles/design-tokens.css', import.meta.url), 'utf8');

  assert.match(css, /\.section-heading\s+:is\(h2,\s*h3\)/);
  assert.doesNotMatch(css, /\.section-heading\s+h2\s*\{/);
});
```

Run: `node --test tests/dev-homepage.test.mjs`

Expected: FAIL on this new test because `src/styles/design-tokens.css` still has `.section-heading h2`. The uses-page test from Step 5 still passes.

Then in `src/styles/design-tokens.css`, replace:

```css
  .section-heading h2 {
    font-weight: normal;
    opacity: var(--section-heading-opacity);
    white-space: nowrap;
  }
```

with:

```css
  .section-heading :is(h2, h3) {
    font-weight: normal;
    opacity: var(--section-heading-opacity);
    white-space: nowrap;
  }
```

Update the usage comment above that rule so it no longer says the heading is only an `h2`.

Run: `node --test tests/dev-homepage.test.mjs`

Expected: PASS. `/uses` group titles stay `h2` and keep the same compact look. The selector is in place before Task 3 renders homepage groups as `h3`.

- [ ] **Step 7: Commit**

```bash
git add src/components/UseGroupList.astro src/pages/uses.astro src/styles/design-tokens.css tests/dev-homepage.test.mjs
git commit -m "$(cat <<'EOF'
refactor: share the uses group list between pages

EOF
)"
```

## Task 3: Reorder the homepage and add 在用

**Files:**
- Modify: `src/pages/index.astro`
- Modify: `tests/dev-homepage.test.mjs`

Do not change the featured-blog query, the `slice(0, 9)` cap, the journal `slice(0, 5)`, the 220-character excerpt, `ArticlesPair`, the journal card markup, or `HomeProjects`.

- [ ] **Step 1: Write the failing homepage test**

Append this test to `tests/dev-homepage.test.mjs`:

```js
function headingIndex(html, title) {
  const match = new RegExp(`<h2[^>]*>${title}</h2>`).exec(html);
  return match?.index ?? -1;
}

test('homepage sections follow the header order and include every uses item', async () => {
  await withAstroDevServer(async ({ baseUrl }) => {
    const response = await fetch(new URL('/', baseUrl));
    const html = await response.text();
    const articles = headingIndex(html, '精选文章');
    const projects = headingIndex(html, '项目');
    const journals = headingIndex(html, '最新随笔');
    const uses = headingIndex(html, '在用');

    assert.equal(response.status, 200);
    assert.ok(articles >= 0 && projects > articles && journals > projects && uses > journals);
    assert.match(html, /<h3[^>]*>Skill<\/h3>/);
    assert.match(html, /<h4[^>]*>方法论<\/h4>/);
    assert.doesNotMatch(html, /<h2[^>]*>Skill<\/h2>/);
    assert.doesNotMatch(html, /aria-label="分组"/);
    assert.doesNotMatch(html, /aria-label="[^"]*的子分类"/);
    assert.ok(html.includes('trellis'));
    assert.ok(html.includes('archify'));
    assert.ok(html.includes('raycast'));
    assert.ok(html.includes('chrome'));
    assert.ok(html.includes('查看所有文章'));
    assert.ok(html.includes('查看全部项目'));
    assert.ok(html.includes('查看更多随笔'));
  });
}, 30000);
```

`trellis` is the first skill, `archify` is the last skill subgroup item, `raycast` is the first Mac app, and `chrome` is the last Mac app. Together they show the homepage did not keep only two items.

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tests/dev-homepage.test.mjs`

Expected: FAIL because `在用` is missing and `最新随笔` still comes before `项目`. The Task 2 uses-page test still passes.

- [ ] **Step 3: Reorder `src/pages/index.astro` and append 在用**

Add these imports next to the existing component imports:

```ts
import UseGroupList from '@components/UseGroupList.astro';
import { USES_GROUPS } from '@data/uses';
import { prepareUseGroups } from '@data/uses/prepare';
```

After the existing `pairs` calculation, add:

```ts
const useGroups = prepareUseGroups(USES_GROUPS);
```

Leave `algolia()`, the journal `<style>`, and the frontmatter queries untouched apart from that one const.

In the template, keep `<ListTitle />` first. Then render the existing blocks in this order:

1. The current 精选文章 `<Container>`, unchanged.
2. The current 项目 `<Container>`, unchanged, including `section-heading section-heading-compact` and `<HomeProjects />`.
3. The current 最新随笔 `<Container>`, unchanged.
4. This block last:

```astro
{useGroups.length > 0 && (
  <Container>
    <div class="section-heading section-heading-compact">
      <h2 class="colorModeTransition">在用</h2>
      <div class="section-heading-divider colorModeTransition" />
    </div>
    <UseGroupList groups={useGroups} nested />
  </Container>
)}
```

Do not pass `anchors`. Do not render「还没有条目。」on the homepage. An empty prepared list omits the whole section.

- [ ] **Step 4: Run the homepage test**

Run: `node --test tests/dev-homepage.test.mjs`

Expected: PASS. Also run `pnpm test src/data/uses/prepare.test.ts` and expect PASS.

- [ ] **Step 5: Commit**

```bash
git add src/pages/index.astro tests/dev-homepage.test.mjs
git commit -m "$(cat <<'EOF'
feat: show the uses catalog on the homepage

EOF
)"
```
