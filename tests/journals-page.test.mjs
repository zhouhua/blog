import assert from 'node:assert/strict';
import test from 'node:test';
import { withAstroDevServer } from './helpers/astro-dev-server.mjs';

test('journals page responds successfully', async () => {
  await withAstroDevServer(async ({ baseUrl }) => {
    const response = await fetch(new URL('/journals', baseUrl));
    const html = await response.text();

    assert.equal(response.status, 200);
    assert.ok(!html.includes('<title>TypeError</title>'));
    assert.ok(!html.includes('toSorted is not a function'));
    assert.ok(html.includes('<title>随笔 | 周骅的博客</title>'));
  });
}, 30000);

test('journals page renders year-grouped content cards', async () => {
  await withAstroDevServer(async ({ baseUrl }) => {
    const response = await fetch(new URL('/journals', baseUrl));
    const html = await response.text();

    assert.equal(response.status, 200);
    assert.ok(html.includes('id="journal2023-06-07"'));
    assert.ok(html.includes('journalYearSection'));
    assert.ok(html.includes('journalYearHeading'));
    assert.ok(html.includes('journalCard'));
    assert.ok(html.includes('journalCardHeader'));
    assert.ok(html.includes('journalCardBody'));
  });
}, 30000);
