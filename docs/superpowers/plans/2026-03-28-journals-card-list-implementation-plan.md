# Journals Card List Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the `/journals` timeline layout with a year-grouped single-column card list that renders full journal content inline.

**Architecture:** Keep the existing data loading and grouped-by-year rendering flow in `src/pages/journals/index.astro`, but replace the timeline-oriented DOM and inline styles with a year section plus card stack structure. Update the page test to describe and assert card-list semantics instead of timeline semantics while preserving the existing compatibility regression check for `toSorted`.

**Tech Stack:** Astro, TypeScript, Tailwind utilities via `@apply`, Node test runner, fetch-based dev-server page tests

---

## File Map

- Modify: `src/pages/journals/index.astro`
  - Keep collection loading, year grouping, read-info calculation, and current `sort` compatibility fix.
  - Replace timeline classes, pseudo-elements, and absolute layout with year sections and card layout classes.
- Modify: `tests/journals-page.test.mjs`
  - Keep page-response regression coverage.
  - Replace timeline-specific test naming and assertions with card-list structure assertions.
- Reference: `docs/superpowers/specs/2026-03-28-journals-card-list-design.md`

### Task 1: Lock in the new page contract with a failing test

**Files:**
- Modify: `tests/journals-page.test.mjs`
- Reference: `src/pages/journals/index.astro`

- [ ] **Step 1: Write the failing test**

Add or update a test that checks for the new structure:
- year section marker exists, such as `id="journals2023"`
- card container class exists, such as `journalYearSection` or `journalCard`
- card header class exists, such as `journalCardHeader`
- old timeline-specific expectation names are removed

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/journals-page.test.mjs`
Expected: FAIL because the page still renders timeline structure rather than the new card-list classes.

- [ ] **Step 3: Write minimal implementation**

Update `src/pages/journals/index.astro` so the rendered HTML satisfies the new card-list structure while preserving data behavior.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/journals-page.test.mjs`
Expected: PASS for the updated journals page tests.

### Task 2: Replace timeline DOM and styles with year-grouped cards

**Files:**
- Modify: `src/pages/journals/index.astro`
- Test: `tests/journals-page.test.mjs`

- [ ] **Step 1: Remove timeline-specific styling**

Delete timeline pseudo-elements and classes tied to:
- vertical line
- point markers
- connector lines
- absolute offsets used only by timeline layout

- [ ] **Step 2: Build year section structure**

Render each year as a normal flow section with:
- year heading block
- list of cards beneath it

- [ ] **Step 3: Build card structure**

Each card should render:
- header row with linked date on the left
- word count and reading time on the right
- divider or spacing between header and article body
- full journal `Content` inside the card body

- [ ] **Step 4: Constrain rich content safely**

Keep a sane max width and overflow handling so wide images or media do not break the card layout.

- [ ] **Step 5: Run targeted tests**

Run: `node --test tests/journals-page.test.mjs`
Expected: PASS

### Task 3: Regression verification

**Files:**
- Modify: `src/pages/journals/index.astro`
- Modify: `tests/journals-page.test.mjs`

- [ ] **Step 1: Run full relevant verification**

Run: `node --test tests/journals-page.test.mjs`
Expected: 2 passing tests, 0 failures

- [ ] **Step 2: Run lint on touched files if practical**

Run: `pnpm eslint src/pages/journals/index.astro tests/journals-page.test.mjs`
Expected: 0 errors

- [ ] **Step 3: Sanity-check the page in Astro build pipeline if practical**

Run: `pnpm astro check`
Expected: exit code 0
