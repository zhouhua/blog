import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { load } from 'cheerio';
import { fetchPage, withAstroDevServer } from './helpers/astro-dev-server.mjs';

const CLASS_SPLIT_RE = /\s+/;
const DESKTOP_MENU_HREFS = ['/articles', '/projects', '/journals', '/photos', '/about'];
const MOBILE_MENU_SOURCE_PATH = new URL('../src/react/components/MobileMenu/index.tsx', import.meta.url);
const HEADER_SOURCE_PATH = new URL('../src/components/Header.astro', import.meta.url);
const MOBILE_MENU_MOUNT_RE = /<MobileMenu\s+client:only="react"\s*\/>/;

function classTokens(className = '') {
  return new Set(className.split(CLASS_SPLIT_RE).filter(Boolean));
}

function formatHtmlSnippet(html, pattern) {
  const index = html.indexOf(pattern);
  if (index < 0) {
    return html.slice(0, 300);
  }

  const start = Math.max(0, index - 120);
  const end = Math.min(html.length, index + pattern.length + 180);
  return html.slice(start, end);
}

function findHeader($) {
  const header = $('header').first();
  assert.ok(header.length > 0, 'Expected a header element on the homepage');
  return header;
}

function getMenuContainers($, header) {
  return header
    .find('div')
    .toArray()
    .filter((element) => {
      const hrefs = new Set(
        $(element)
          .find('a[href]')
          .toArray()
          .map(link => $(link).attr('href'))
          .filter(Boolean),
      );

      return DESKTOP_MENU_HREFS.every(href => hrefs.has(href));
    });
}

function extractClassNameFromSource(source, componentName) {
  const match = source.match(new RegExp(`<${componentName}\\b[^>]*className="([^"]+)"`, 's'));
  assert.ok(match, `Expected to find ${componentName} className in source`);
  return match[1];
}

test('responsive shell and mobile menu contract', async () => {
  await withAstroDevServer(async ({ baseUrl }) => {
    const home = await fetchPage(baseUrl, '/');
    const $ = load(home);
    const header = findHeader($);

    const menuContainers = getMenuContainers($, header);
    assert.ok(
      menuContainers.length > 0,
      `Expected to find a desktop nav container in the header, got ${header.html().slice(0, 500)}`,
    );

    const headerSource = await readFile(HEADER_SOURCE_PATH, 'utf8');
    assert.match(
      headerSource,
      MOBILE_MENU_MOUNT_RE,
      `Expected Header.astro to mount MobileMenu, got:\n${formatHtmlSnippet(headerSource, 'MobileMenu')}`,
    );

    const mobileMenuSource = await readFile(MOBILE_MENU_SOURCE_PATH, 'utf8');
    const triggerClassName = extractClassNameFromSource(mobileMenuSource, 'DropdownMenuTrigger');
    const triggerTokens = classTokens(triggerClassName);

    assert.ok(
      triggerTokens.has('block'),
      `Expected DropdownMenuTrigger to include block, got: ${triggerClassName}`,
    );
    assert.ok(
      triggerTokens.has('sm:hidden'),
      `Expected DropdownMenuTrigger to include sm:hidden, got: ${triggerClassName}`,
    );
  });
});
