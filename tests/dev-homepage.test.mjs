import assert from 'node:assert/strict';
import test from 'node:test';
import { fetchPage, withAstroDevServer } from './helpers/astro-dev-server.mjs';

test('dev homepage responds successfully', async () => {
  await withAstroDevServer(async ({ baseUrl }) => {
    const response = await fetch(new URL('/', baseUrl));
    const html = await fetchPage(baseUrl, '/');

    assert.equal(response.status, 200);
    assert.ok(!html.includes('<title>ReferenceError</title>'));
  });
}, 30000);
