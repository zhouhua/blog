import assert from 'node:assert/strict';
import test from 'node:test';
import { withAstroDevServer } from './helpers/astro-dev-server.mjs';

const VITE_CLIENT_RUNTIME_RE = /createHotContext|updateStyle|removeStyle/;

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
