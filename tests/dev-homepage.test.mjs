import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { withAstroDevServer } from './helpers/astro-dev-server.mjs';

const VITE_CLIENT_RUNTIME_RE = /createHotContext|updateStyle|removeStyle/;
const USES_GROUP_NAV_RE = /<nav[^>]*aria-label="分组"/;
const USES_SUBGROUP_NAV_RE = /<nav[^>]*aria-label="Skill的子分类"/;
const USES_SKILL_H2_RE = /<h2[^>]*>Skill<\/h2>/;
const USES_METHOD_H3_RE = /<h3[^>]*>方法论<\/h3>/;
const HOME_ARTICLES_H2_RE = /<h2[^>]*>精选文章<\/h2>/;
const HOME_PROJECTS_H2_RE = /<h2[^>]*>项目<\/h2>/;
const HOME_JOURNALS_H2_RE = /<h2[^>]*>最新随笔<\/h2>/;
const HOME_USES_H2_RE = /<h2[^>]*>在用<\/h2>/;
const HOME_SKILL_H3_RE = /<h3[^>]*>Skill<\/h3>/;
const HOME_METHOD_H4_RE = /<h4[^>]*>方法论<\/h4>/;
const ANY_SUBGROUP_NAV_RE = /aria-label="[^"]*的子分类"/;

function headingIndex(html, pattern) {
  const match = pattern.exec(html);
  return match?.index ?? -1;
}

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

test('homepage sections follow the header order and include every uses item', async () => {
  await withAstroDevServer(async ({ baseUrl }) => {
    const response = await fetch(new URL('/', baseUrl));
    const html = await response.text();
    const articles = headingIndex(html, HOME_ARTICLES_H2_RE);
    const projects = headingIndex(html, HOME_PROJECTS_H2_RE);
    const journals = headingIndex(html, HOME_JOURNALS_H2_RE);
    const uses = headingIndex(html, HOME_USES_H2_RE);

    assert.equal(response.status, 200);
    assert.ok(articles >= 0 && projects > articles && journals > projects && uses > journals);
    assert.match(html, HOME_SKILL_H3_RE);
    assert.match(html, HOME_METHOD_H4_RE);
    assert.doesNotMatch(html, USES_SKILL_H2_RE);
    assert.doesNotMatch(html, USES_GROUP_NAV_RE);
    assert.doesNotMatch(html, ANY_SUBGROUP_NAV_RE);
    assert.ok(html.includes('trellis'));
    assert.ok(html.includes('archify'));
    assert.ok(html.includes('raycast'));
    assert.ok(html.includes('chrome'));
    assert.ok(html.includes('查看所有文章'));
    assert.ok(html.includes('查看全部项目'));
    assert.ok(html.includes('查看更多随笔'));
  });
}, 30000);
