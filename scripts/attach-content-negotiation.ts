import { readdirSync } from 'node:fs';
import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { withNegotiationRoute } from '../src/lib/vercel-output.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const configPath = join(root, '.vercel/output/config.json');
const functionDir = join(root, '.vercel/output/functions/_markdown.func');

async function exists(path: string) {
  try {
    await access(path);
    return true;
  }
  catch {
    return false;
  }
}

async function main() {
  if (!(await exists(configPath))) {
    // eslint-disable-next-line no-console
    console.info('skip content negotiation middleware: .vercel/output/config.json is absent');
    return;
  }

  const esbuildDir = readdirSync(join(root, 'node_modules/.pnpm'))
    .find(name => name.startsWith('esbuild@'));
  if (!esbuildDir) {
    throw new Error('esbuild is not installed');
  }

  const require = createRequire(import.meta.url);
  const esbuild = require(join(root, 'node_modules/.pnpm', esbuildDir, 'node_modules/esbuild')) as {
    build: (options: Record<string, unknown>) => Promise<void>;
  };

  await mkdir(functionDir, { recursive: true });
  await esbuild.build({
    absWorkingDir: root,
    bundle: true,
    conditions: ['edge-light', 'workerd', 'worker'],
    entryPoints: ['src/edge/markdown-negotiate.ts'],
    format: 'esm',
    outfile: join(functionDir, 'index.js'),
    platform: 'browser',
    target: 'esnext',
  });
  await writeFile(join(functionDir, '.vc-config.json'), `${JSON.stringify({
    entrypoint: 'index.js',
    runtime: 'edge',
  }, null, 2)}\n`);

  const config = JSON.parse(await readFile(configPath, 'utf8')) as { routes?: unknown[] };
  await writeFile(configPath, `${JSON.stringify(withNegotiationRoute(config), null, 2)}\n`);
  // eslint-disable-next-line no-console
  console.info('attached content negotiation middleware');
}

const isDirectRun = process.argv[1] !== undefined && fileURLToPath(import.meta.url) === process.argv[1];
if (isDirectRun) {
  await main();
}
