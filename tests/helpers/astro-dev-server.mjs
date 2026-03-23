import { spawn } from 'node:child_process';
import net from 'node:net';

const cwd = new URL('../..', import.meta.url);

function getFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();

    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      server.close((closeError) => {
        if (closeError) {
          reject(closeError);
          return;
        }

        resolve(port);
      });
    });
  });
}

function waitForReady(child, port) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('astro dev did not become ready in time'));
    }, 20000);

    const onData = (chunk) => {
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
    child.once('exit', (code) => {
      clearTimeout(timeout);
      reject(new Error(`astro dev exited early with code ${code}`));
    });
  });
}

export async function withAstroDevServer(run) {
  const port = await getFreePort();
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
    return await run({ baseUrl: `http://127.0.0.1:${port}/`, port });
  }
  finally {
    if (child.exitCode === null && child.signalCode === null) {
      child.kill('SIGINT');
      await new Promise((resolve) => {
        child.once('exit', resolve);
      });
    }
  }
}

export async function fetchPage(baseUrl, pathname) {
  const response = await fetch(new URL(pathname, baseUrl));
  return await response.text();
}
