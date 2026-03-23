import assert from 'node:assert/strict';
import test from 'node:test';
import { load } from 'cheerio';
import { fetchPage, withAstroDevServer } from './helpers/astro-dev-server.mjs';

const CLASS_SPLIT_RE = /\s+/;
const DESKTOP_MENU_HREFS = ['/articles', '/projects', '/journals', '/photos', '/about'];

function classTokens(className = '') {
  return new Set(className.split(CLASS_SPLIT_RE).filter(Boolean));
}

function expectClassesForElement($, element, requiredTokens, label) {
  const tokens = classTokens($(element).attr('class'));
  const matches = requiredTokens.every(token => tokens.has(token));

  assert.ok(matches, `Expected ${label} to include ${requiredTokens.join(' ')}`);
}

function hasMenuHrefSet($, element) {
  const hrefs = new Set(
    $(element)
      .find('a[href]')
      .toArray()
      .map(link => $(link).attr('href'))
      .filter(Boolean),
  );

  return DESKTOP_MENU_HREFS.every(href => hrefs.has(href));
}

function findHeaderContainer($) {
  return $('header > *').toArray().find((element) => {
    const root = $(element);
    return root.find('img.svg-image[alt="logo"]').length > 0 && hasMenuHrefSet($, element);
  });
}

function findDesktopMenuContainer($, headerContainer) {
  return $(headerContainer)
    .children('div')
    .toArray()
    .find(element => hasMenuHrefSet($, element));
}

test('homepage uses mobile-first shell classes', async () => {
  await withAstroDevServer(async ({ baseUrl }) => {
    const home = await fetchPage(baseUrl, '/');
    const $ = load(home);

    const headerContainer = findHeaderContainer($);
    assert.ok(headerContainer, 'Expected to find the header container');

    expectClassesForElement($, headerContainer, ['px-5', 'sm:px-10'], 'header container');

    const desktopMenuContainer = findDesktopMenuContainer($, headerContainer);
    assert.ok(desktopMenuContainer, 'Expected to find the desktop menu container');
    expectClassesForElement($, desktopMenuContainer, ['hidden', 'sm:flex'], 'desktop menu container');

    const svgLogo = $(headerContainer).find('img.svg-image[alt="logo"]').get(0);
    assert.ok(svgLogo, 'Expected to find the SVG logo');
    expectClassesForElement($, svgLogo, ['block', 'sm:hidden'], 'SVG logo');
  });
});
