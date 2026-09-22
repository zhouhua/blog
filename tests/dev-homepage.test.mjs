import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { withAstroDevServer } from './helpers/astro-dev-server.mjs';

const VITE_CLIENT_RUNTIME_RE = /createHotContext|updateStyle|removeStyle/;
const USES_GROUP_NAV_RE = /<nav[^>]*aria-label="分组"/;
const USES_SUBGROUP_NAV_RE = /<nav[^>]*aria-label="Skill的子分类"/;
const USES_SKILL_H2_RE = /<h2[^>]*>Skill<\/h2>/;
const USES_METHOD_H3_RE = /<h3[^>]*>方法论<\/h3>/;

test('dev homepage responds successfully', async () => {
  await withAstroDevServer(async ({ baseUrl }) => {
    const response = await fetch(new URL('/', baseUrl));
    const html = await response.text();

    assert.equal(response.status, 200);
    assert.ok(!html.includes('<title>ReferenceError</title>'));
  });
}, 30000);

test('dev server serves vite client and non-homepage routes', async () => {
  await withAstroDevServer(async ({ baseUrl }) => {
    const viteClientResponse = await fetch(new URL('/@vite/client', baseUrl));
    const viteClientSource = await viteClientResponse.text();

    assert.equal(viteClientResponse.status, 200);
    assert.ok(!viteClientSource.includes('<title>Error</title>'), 'expected vite client to return JavaScript instead of an error document');
    assert.match(viteClientSource, VITE_CLIENT_RUNTIME_RE);

    for (const pathname of ['/about', '/photo/2022']) {
      const response = await fetch(new URL(pathname, baseUrl));
      const html = await response.text();

      assert.equal(response.status, 200, `expected ${pathname} to respond successfully`);
      assert.ok(!html.includes('Failed to resolve import'), `expected ${pathname} to render without vite import failures`);
      assert.ok(!html.includes('<title>Error</title>'), `expected ${pathname} to render page content`);
    }
  });
}, 30000);

test('uses page keeps group and subgroup anchor navs', async () => {
  await withAstroDevServer(async ({ baseUrl }) => {
    const response = await fetch(new URL('/uses', baseUrl));
    const html = await response.text();

    assert.equal(response.status, 200);
    assert.match(html, USES_GROUP_NAV_RE);
    assert.match(html, USES_SUBGROUP_NAV_RE);
    assert.match(html, USES_SKILL_H2_RE);
    assert.match(html, USES_METHOD_H3_RE);
    assert.ok(html.includes('trellis'));
    assert.ok(html.includes('raycast'));
  });
}, 30000);

test('section heading title style covers h2 and h3', async () => {
  const css = await readFile(new URL('../src/styles/design-tokens.css', import.meta.url), 'utf8');

  assert.ok(css.includes('.section-heading :is(h2, h3)'));
  assert.ok(!css.includes('.section-heading h2 {'));
});
