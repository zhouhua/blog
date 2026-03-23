import assert from 'node:assert/strict';
import test from 'node:test';
import { fetchPage, withAstroDevServer } from './helpers/astro-dev-server.mjs';

const mobileDesktopNavRegex = /hidden sm:flex/;
const mobileMenuRegex = /block sm:hidden/;
const mobilePaddingRegex = /px-5 sm:px-10/;

test('homepage uses mobile-first shell classes', async () => {
  await withAstroDevServer(async ({ baseUrl }) => {
    const home = await fetchPage(baseUrl, '/');
    assert.match(home, mobileDesktopNavRegex);
    assert.match(home, mobileMenuRegex);
    assert.match(home, mobilePaddingRegex);
  });
});
