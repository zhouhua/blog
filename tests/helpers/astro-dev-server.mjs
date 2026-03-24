import { spawn } from 'node:child_process';
import { open, readFile, unlink } from 'node:fs/promises';
import net from 'node:net';
import process from 'node:process';
import { setTimeout as sleep } from 'node:timers/promises';

const cwd = new URL('../..', import.meta.url);
const lockPath = '/tmp/blog-astro-dev-server.lock';
const READY_SIGNAL_RE = /\bready in\b/i;
const LOCAL_URL_RE = /\blocal\s+http:\/\/127\.0\.0\.1:/i;

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
  const deadline = Date.now() + 60000;

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

function hasReadySignal(output) {
  return READY_SIGNAL_RE.test(output) && LOCAL_URL_RE.test(output);
}

function canConnect(port, timeoutMs = 1000) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host: '127.0.0.1', port });
    const timer = setTimeout(() => {
      socket.destroy();
      resolve(false);
    }, timeoutMs);

    socket.once('connect', () => {
      clearTimeout(timer);
      socket.end();
      resolve(true);
    });

    socket.once('error', () => {
      clearTimeout(timer);
      resolve(false);
    });
  });
}

async function waitForReady(child, port, streams) {
  const deadline = Date.now() + 60000;
  let sawReadySignal = false;

  while (Date.now() < deadline) {
    if (child.exitCode !== null || child.signalCode !== null) {
      throw new Error(`astro dev exited early with code ${child.exitCode ?? 'null'} and signal ${child.signalCode ?? 'null'}`);
    }

    sawReadySignal ||= hasReadySignal(streams.text());

    if (sawReadySignal && await canConnect(port)) {
      return;
    }

    await sleep(150);
  }

  throw new Error(
    sawReadySignal
      ? 'astro dev reported ready but never accepted TCP connections'
      : 'astro dev did not report ready in time',
  );
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
    await waitForReady(child, port, streams);
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
