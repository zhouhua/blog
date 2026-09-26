#!/usr/bin/env node
/**
 * Export diagram-design HTML → PNG of the first <svg>, using system Chrome CDP.
 * Usage: node export-png.mjs <src.html> <out.png> [scale=2]
 */
import { Buffer } from 'node:buffer';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import net from 'node:net';
import path from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';

const chrome
  = process.env.CHROME_PATH
    || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    http
      .get(url, (res) => {
        let d = '';
        res.on('data', c => (d += c));
        res.on('end', () => {
          try {
            resolve(JSON.parse(d));
          }
          catch (e) {
            reject(e);
          }
        });
      })
      .on('error', reject);
  });
}

function findFreePort() {
  return new Promise((resolve, reject) => {
    const s = net.createServer();
    s.listen(0, '127.0.0.1', () => {
      const { port } = s.address();
      s.close(() => resolve(port));
    });
    s.on('error', reject);
  });
}

class Cdp {
  constructor(url) {
    this.url = url;
    this.id = 0;
    this.pending = new Map();
  }

  close() {
    try {
      this.ws.close();
    }
    catch {}
  }

  async connect() {
    this.ws = new WebSocket(this.url);
    await new Promise((res, rej) => {
      this.ws.addEventListener('open', res);
      this.ws.addEventListener('error', rej);
    });
    this.ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { reject, resolve } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error)
          reject(new Error(JSON.stringify(msg.error)));
        else resolve(msg.result);
      }
    });
  }

  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { reject, resolve });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
}

async function main() {
  const src = process.argv[2];
  const out = process.argv[3];
  const scale = Number(process.argv[4] || 2);

  if (!src || !out) {
    console.error('Usage: node export-png.mjs <src.html> <out.png> [scale]');
    process.exit(1);
  }

  const port = await findFreePort();
  const userData = fs.mkdtempSync('/tmp/dd-chrome-');
  const child = spawn(
    chrome,
    [
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${userData}`,
      '--headless=new',
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check',
      'about:blank',
    ],
    { stdio: 'ignore' },
  );

  let ready = false;
  for (let i = 0; i < 50; i++) {
    try {
      await getJson(`http://127.0.0.1:${port}/json/version`);
      ready = true;
      break;
    }
    catch {
      await sleep(100);
    }
  }
  if (!ready) {
    child.kill();
    throw new Error('Chrome did not start');
  }

  const fileUrl = pathToFileURL(path.resolve(src)).href;
  await getJson(
    `http://127.0.0.1:${port}/json/new?${encodeURIComponent(fileUrl)}`,
  ).catch(() => null);

  let page;
  for (let i = 0; i < 40; i++) {
    const list = await getJson(`http://127.0.0.1:${port}/json/list`);
    page = list.find(t => t.type === 'page' && t.url && t.url.includes(path.basename(src)));
    if (!page)
      page = list.find(t => t.type === 'page' && t.webSocketDebuggerUrl);
    if (page?.webSocketDebuggerUrl)
      break;
    await sleep(100);
  }
  if (!page?.webSocketDebuggerUrl) {
    child.kill();
    throw new Error('No page websocket');
  }

  const cdp = new Cdp(page.webSocketDebuggerUrl);
  await cdp.connect();
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');

  const loaded = new Promise((resolve) => {
    const handler = (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.method === 'Page.loadEventFired') {
        cdp.ws.removeEventListener('message', handler);
        resolve();
      }
    };
    cdp.ws.addEventListener('message', handler);
  });
  await cdp.send('Page.navigate', { url: fileUrl });
  await Promise.race([loaded, sleep(5000)]);
  await sleep(500);
  await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    expression: 'document.fonts.ready.then(() => true)',
  });
  await sleep(400);

  const { result } = await cdp.send('Runtime.evaluate', {
    expression: `(() => {
    const el = document.querySelector('svg');
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.x, y: r.y, width: r.width, height: r.height, dpr: window.devicePixelRatio || 1 };
  })()`,
    returnByValue: true,
  });

  const box = result?.value;
  if (!box || !box.width) {
    cdp.close();
    child.kill();
    throw new Error('SVG not found or zero size');
  }

  await cdp.send('Emulation.setDeviceMetricsOverride', {
    deviceScaleFactor: scale,
    height: Math.ceil(box.y + box.height + 40),
    mobile: false,
    width: Math.ceil(box.x + box.width + 40),
  });
  await sleep(200);

  const shot = await cdp.send('Page.captureScreenshot', {
    captureBeyondViewport: true,
    clip: {
      height: box.height,
      scale: 1,
      width: box.width,
      x: box.x,
      y: box.y,
    },
    format: 'png',
    fromSurface: true,
  });

  fs.writeFileSync(out, Buffer.from(shot.data, 'base64'));
  console.warn('wrote', out, `${Math.round(box.width * scale)}x${Math.round(box.height * scale)}`);

  cdp.close();
  child.kill();
  try {
    fs.rmSync(userData, { force: true, recursive: true });
  }
  catch {}
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
