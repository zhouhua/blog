import assert from 'node:assert/strict';
import test from 'node:test';
import { load } from 'cheerio';
import { fetchPage, withAstroDevServer } from './helpers/astro-dev-server.mjs';

const CLASS_SPLIT_RE = /\s+/;

function classTokens(className = '') {
  return new Set(className.split(CLASS_SPLIT_RE).filter(Boolean));
}

function expectClasses($, selector, requiredTokens) {
  const matches = $(selector).toArray().some((element) => {
    const tokens = classTokens($(element).attr('class'));
    return requiredTokens.every(token => tokens.has(token));
  });

  assert.ok(matches, `Expected ${selector} to include ${requiredTokens.join(' ')}`);
}

test('homepage uses mobile-first shell classes', async () => {
  await withAstroDevServer(async ({ baseUrl }) => {
    const home = await fetchPage(baseUrl, '/');
    const $ = load(home);

    expectClasses($, 'header a[href="/"] + div', ['hidden', 'sm:flex']);
    expectClasses($, 'header [class*="h-10"][class*="w-10"][class*="text-primary"]', ['block', 'sm:hidden']);
    expectClasses($, 'div[class*="max-w-screen-sm"][class*="min-w-[360px]"]', ['px-5', 'sm:px-10']);
  });
});
