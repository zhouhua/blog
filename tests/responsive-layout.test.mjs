import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { load } from 'cheerio';
import { fetchPage, withAstroDevServer } from './helpers/astro-dev-server.mjs';

const CLASS_SPLIT_RE = /\s+/;
const DESKTOP_MENU_HREFS = ['/articles', '/projects', '/journals', '/photos', '/about'];
const MOBILE_MENU_SOURCE_PATH = new URL('../src/react/components/MobileMenu/index.tsx', import.meta.url);

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

function findSmallestMatchingElement($, rootSelector, predicate) {
  const candidates = $(rootSelector).find('*').toArray();
  const root = $(rootSelector).toArray();
  candidates.push(...root);

  return candidates
    .filter(predicate)
    .sort((left, right) => $(left).find('*').length - $(right).find('*').length)[0];
}

function hasSvgLogo($, element) {
  return $(element).find('img.svg-image[alt="logo"]').length > 0;
}

function findHeaderContainer($) {
  return findSmallestMatchingElement($, 'header', element => hasSvgLogo($, element) && hasMenuHrefSet($, element));
}

function findDesktopMenuContainer($) {
  return findSmallestMatchingElement($, 'header', element => hasMenuHrefSet($, element));
}

function extractClassNameFromSource(source, componentName) {
  const match = source.match(new RegExp(`<${componentName}\\b[^>]*className="([^"]+)"`, 's'));
  assert.ok(match, `Expected to find ${componentName} className in MobileMenu source`);
  return match[1];
}

test('homepage uses mobile-first shell classes', async () => {
  await withAstroDevServer(async ({ baseUrl }) => {
    const home = await fetchPage(baseUrl, '/');
    const $ = load(home);
    const mobileMenuSource = await readFile(MOBILE_MENU_SOURCE_PATH, 'utf8');

    const headerContainer = findHeaderContainer($);
    assert.ok(headerContainer, 'Expected to find the header container');

    expectClassesForElement($, headerContainer, ['px-5', 'sm:px-10'], 'header container');

    const desktopMenuContainer = findDesktopMenuContainer($);
    assert.ok(desktopMenuContainer, 'Expected to find the desktop menu container');
    expectClassesForElement($, desktopMenuContainer, ['hidden', 'sm:flex'], 'desktop menu container');

    const triggerClassName = extractClassNameFromSource(mobileMenuSource, 'DropdownMenuTrigger');
    const triggerTokens = classTokens(triggerClassName);
    assert.ok(triggerTokens.has('block'), 'Expected DropdownMenuTrigger to include block');
    assert.ok(triggerTokens.has('sm:hidden'), 'Expected DropdownMenuTrigger to include sm:hidden');
  });
});
