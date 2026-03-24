import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { load } from 'cheerio';
import { fetchPage, withAstroDevServer } from './helpers/astro-dev-server.mjs';

const CLASS_SPLIT_RE = /\s+/;
const DESKTOP_MENU_HREFS = ['/articles', '/projects', '/journals', '/photos', '/about'];
const MOBILE_MENU_SOURCE_PATH = new URL('../src/react/components/MobileMenu/index.tsx', import.meta.url);
const HEADER_SOURCE_PATH = new URL('../src/components/Header.astro', import.meta.url);

function classTokens(className = '') {
  return new Set(className.split(CLASS_SPLIT_RE).filter(Boolean));
}

function findHeader($) {
  const header = $('header').first();
  assert.ok(header.length > 0, 'Expected a header element on the homepage');
  return header;
}

function findHeaderShellContainer($, header) {
  const shell = header.children('[class]').first();
  assert.ok(shell.length > 0, 'Expected the header to render a direct shell container');
  return shell.get(0);
}

function getMenuContainers($, header) {
  return header.find('*').toArray().filter((element) => {
    const hrefs = new Set(
      $(element)
        .find('a[href]')
        .toArray()
        .map(link => $(link).attr('href'))
        .filter(Boolean),
    );

    return hrefs.size === DESKTOP_MENU_HREFS.length
      && DESKTOP_MENU_HREFS.every(href => hrefs.has(href));
  });
}

function expectClassCombination(classNames, requiredTokens, label) {
  const match = classNames.find((className) => {
    const tokens = classTokens(className);
    return requiredTokens.every(token => tokens.has(token));
  });

  assert.ok(
    match,
    `Expected ${label} to include ${requiredTokens.join(' ')}, got:\n${classNames.join('\n')}`,
  );
}

function expectClassTokens(className, requiredTokens, label) {
  expectClassCombination([className], requiredTokens, label);
}

function expectNoClassTokens(className, forbiddenTokens, label) {
  const tokens = classTokens(className);
  const present = forbiddenTokens.filter(token => tokens.has(token));

  assert.equal(
    present.length,
    0,
    `Expected ${label} to exclude ${forbiddenTokens.join(' ')}, got: ${className}`,
  );
}

function extractClassNameFromSource(source, componentName) {
  const match = source.match(new RegExp(`<${componentName}\\b[^>]*className="([^"]+)"`, 's'));
  assert.ok(match, `Expected to find ${componentName} className in source`);
  return match[1];
}

function extractSelfClosingTag(source, tagName) {
  const start = source.indexOf(`<${tagName}`);
  assert.ok(start >= 0, `Expected to find <${tagName} in source`);

  const end = source.indexOf('/>', start);
  assert.ok(end >= 0, `Expected <${tagName} to be self closing in source`);

  return source.slice(start, end + 2);
}

test('responsive shell and mobile menu contract', async () => {
  await withAstroDevServer(async ({ baseUrl }) => {
    const home = await fetchPage(baseUrl, '/');
    const $ = load(home);
    const header = findHeader($);
    const headerShellContainer = findHeaderShellContainer($, header);
    const headerShellClassName = $(headerShellContainer).attr('class') ?? '';

    const menuContainers = getMenuContainers($, header);
    assert.ok(
      menuContainers.length > 0,
      `Expected to find a desktop nav container in the header, got ${header.html().slice(0, 500)}`,
    );
    const desktopMenuClassName = $(menuContainers[0]).attr('class') ?? '';
    expectClassTokens(desktopMenuClassName, ['hidden', 'sm:flex'], 'desktop nav container');
    expectNoClassTokens(desktopMenuClassName, ['sm:hidden'], 'desktop nav container');
    expectClassTokens(headerShellClassName, ['px-5', 'sm:px-10'], 'header shell classes');
    expectNoClassTokens(headerShellClassName, ['sm:px-5', 'px-10'], 'header shell classes');

    const headerSource = await readFile(HEADER_SOURCE_PATH, 'utf8');
    const mobileMenuTag = extractSelfClosingTag(headerSource, 'MobileMenu');
    assert.ok(
      mobileMenuTag.includes('client:only="react"'),
      `Expected Header.astro to mount MobileMenu as client-only, got:\n${mobileMenuTag}`,
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
    assert.ok(
      !triggerTokens.has('hidden') && !triggerTokens.has('sm:block'),
      `Expected DropdownMenuTrigger to exclude hidden and sm:block, got: ${triggerClassName}`,
    );
  });
});
