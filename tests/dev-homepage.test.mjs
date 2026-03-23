import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';

const cwd = new URL('..', import.meta.url);

function waitForReady(child, port) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('astro dev did not become ready in time'));
    }, 20000);

    const onData = chunk => {
      const text = chunk.toString();
      if (text.includes(`:${port}/`)) {
        clearTimeout(timeout);
        child.stdout.off('data', onData);
        child.stderr.off('data', onData);
        resolve();
      }
    };

    child.stdout.on('data', onData);
    child.stderr.on('data', onData);
    child.once('exit', code => {
      clearTimeout(timeout);
      reject(new Error(`astro dev exited early with code ${code}`));
    });
  });
}

test('dev homepage responds successfully', async () => {
  const port = 4325;
  const child = spawn(
    'pnpm',
    ['astro', 'dev', '--host', '127.0.0.1', '--port', String(port)],
    {
      cwd,
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );

  try {
    await waitForReady(child, port);

    const response = await fetch(`http://127.0.0.1:${port}/`);
    const html = await response.text();

    assert.equal(response.status, 200);
    assert.ok(!html.includes('<title>ReferenceError</title>'));
  } finally {
    child.kill('SIGINT');
    await new Promise(resolve => child.once('exit', resolve));
  }
}, 30000);
