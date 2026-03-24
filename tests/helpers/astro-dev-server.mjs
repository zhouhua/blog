import { spawn } from 'node:child_process';
import { open, readFile, unlink } from 'node:fs/promises';
import net from 'node:net';
import process from 'node:process';
import { setTimeout as sleep } from 'node:timers/promises';

const cwd = new URL('../..', import.meta.url);
const lockPath = '/tmp/blog-astro-dev-server.lock';

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

async function acquireLock() {
  const deadline = Date.now() + 30000;

  while (true) {
    try {
      const handle = await open(lockPath, 'wx');
      await handle.writeFile(String(process.pid));

      return async () => {
        await handle.close();
        await unlink(lockPath).catch(() => {});
      };
    }
    catch (error) {
      if (error?.code !== 'EEXIST') {
        throw error;
      }

      const rawPid = await readFile(lockPath, 'utf8').catch(() => '');
      const pid = Number(rawPid.trim());

      if (Number.isFinite(pid) && pid > 0 && pid !== process.pid) {
        try {
          process.kill(pid, 0);
        }
        catch {
          await unlink(lockPath).catch(() => {});
          continue;
        }
      }

      if (Date.now() > deadline) {
        throw new Error('timed out waiting for astro dev lock');
      }

      await sleep(100);
    }
  }
}

function waitForExit(child, timeoutMs = 5000) {
  return Promise.race([
    new Promise((resolve) => {
      child.once('exit', resolve);
    }),
    sleep(timeoutMs).then(() => null),
  ]);
}

async function waitForReady(child, baseUrl) {
  const deadline = Date.now() + 30000;

  while (Date.now() < deadline) {
    if (child.exitCode !== null || child.signalCode !== null) {
      throw new Error(`astro dev exited early with code ${child.exitCode}`);
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2000);

    try {
      const response = await fetch(new URL('/', baseUrl), {
        signal: controller.signal,
      });

      if (response.ok) {
        return;
      }
    }
    catch {
      // Keep polling until Astro is ready or the process exits.
    }
    finally {
      clearTimeout(timer);
    }

    await sleep(150);
  }

  throw new Error('astro dev did not become ready in time');
}

function createStreamBuffer(child) {
  const chunks = [];

  const append = streamName => (chunk) => {
    chunks.push(`[${streamName}] ${chunk.toString()}`);
  };

  child.stdout.on('data', append('stdout'));
  child.stderr.on('data', append('stderr'));

  return {
    text() {
      return chunks.join('');
    },
  };
}

async function stopChild(child) {
  if (child.exitCode !== null || child.signalCode !== null) {
    return;
  }

  child.kill('SIGINT');
  const exited = await waitForExit(child, 5000);
  if (exited === null && child.exitCode === null && child.signalCode === null) {
    child.kill('SIGKILL');
    await waitForExit(child, 5000);
  }
}

export async function withAstroDevServer(run) {
  const releaseLock = await acquireLock();
  const port = await getFreePort();
  const child = spawn('pnpm', ['astro', 'dev', '--host', '127.0.0.1', '--port', String(port)], {
    cwd,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const streams = createStreamBuffer(child);

  try {
    await waitForReady(child, `http://127.0.0.1:${port}/`);
    return await run({ baseUrl: `http://127.0.0.1:${port}/`, port });
  }
  catch (error) {
    const logOutput = streams.text().trim();
    if (logOutput) {
      error.message = `${error.message}\n\nastro dev output:\n${logOutput}`;
    }
    throw error;
  }
  finally {
    await stopChild(child);
    await releaseLock();
  }
}

export async function fetchPage(baseUrl, pathname) {
  const response = await fetch(new URL(pathname, baseUrl));
  const body = await response.text();

  if (!response.ok) {
    throw new Error(`request for ${pathname} failed with ${response.status}: ${body.slice(0, 200)}`);
  }

  return body;
}
