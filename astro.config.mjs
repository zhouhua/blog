// @ts-check
import process from 'node:process';
import mdx from '@astrojs/mdx';
import node from '@astrojs/node';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';
import mediaCard from '@zhouhua-dev/remark-media-card';
import remarkDescription from 'astro-remark-description';
import { defineConfig } from 'astro/config';
import rehypeKatex from 'rehype-katex';
import rehypePrettyCode from 'rehype-pretty-code';
import remarkMath from 'remark-math';
import { visualizer } from 'rollup-plugin-visualizer';
import { getSingletonHighlighter } from 'shiki';

const isDev = process.argv.includes('dev');
const isVercelBuild = process.env.VERCEL === '1' || typeof process.env.VERCEL_ENV === 'string';
const sentryAuthToken = process.env.SENTRY_AUTH_TOKEN;
const hasSentryAuthToken = typeof sentryAuthToken === 'string' && sentryAuthToken.length > 0;
const VITE_CLIENT_ENV_IMPORT = 'import "@vite/env";';
const VITE_CLIENT_ENV_RELATIVE_IMPORT = 'import "./env.mjs";';

/** @type {{ enforce: 'pre', name: string, transform: (code: string, id: string) => string | null }} */
const fixViteClientEnvImport = {
  enforce: 'pre',
  name: 'fix-vite-client-env-import',
  /** @param {string} code @param {string} id */
  transform(code, id) {
    if (!id.includes('/vite/dist/client/client.mjs') || !code.includes(VITE_CLIENT_ENV_IMPORT)) {
      return null;
    }

    return code.replace(VITE_CLIENT_ENV_IMPORT, VITE_CLIENT_ENV_RELATIVE_IMPORT);
  },
};

const integrations = [mdx(), sitemap(), react()];

if (isDev) {
  const { default: pageInsight } = await import('astro-page-insight');
  integrations.push(pageInsight());
}

if (!isDev) {
  const { default: sentry } = await import('@sentry/astro');

  integrations.push(
    sentry({
      sourcemaps: {
        disable: !hasSentryAuthToken,
      },
      telemetry: false,
      ...(hasSentryAuthToken
        ? {
            sourceMapsUploadOptions: {
              authToken: sentryAuthToken,
              project: 'javascript-astro',
            },
          }
        : {}),
    }),
  );
}

const adapter = isVercelBuild
  ? vercel({
      imageService: true,
      webAnalytics: {
        enabled: true,
      },
    })
  : isDev
    ? node({ mode: 'standalone' })
    : null;

// https://astro.build/config
export default defineConfig({
  ...(adapter ? { adapter } : {}),
  base: '/',
  devToolbar: { enabled: false },
  integrations,
  markdown: {
    rehypePlugins: [
      rehypeKatex,
      [
        rehypePrettyCode,
        /** @type {import('rehype-pretty-code').Options} */
        ({
          defaultLang: 'plaintext',
          getHighlighter: options => getSingletonHighlighter(options),
          keepBackground: false,
          langs: [
            'html',
            'javascript',
            'js',
            'typescript',
            'tsx',
            'jsx',
            'css',
            'json',
            'bash',
            'sh',
            'cpp',
            'plaintext',
          ],
          theme: {
            dark: 'github-dark',
            light: 'github-light',
          },
        }),
      ],
    ],
    remarkPlugins: [mediaCard, remarkMath, [remarkDescription, { name: 'excerpt' }]],
    syntaxHighlight: false,
  },
  output: isDev ? 'server' : 'static',
  site: 'https://zhouhua.site/',
  trailingSlash: 'ignore',
  vite: {
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // Vendor chunks for large libraries
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom')) {
                return 'vendor-react';
              }
              if (id.includes('dayjs')) {
                return 'vendor-dayjs';
              }
              if (id.includes('yet-another-react-lightbox')) {
                return 'vendor-lightbox';
              }
              if (id.includes('mermaid')) {
                return 'vendor-mermaid';
              }
              if (id.includes('html2canvas')) {
                return 'vendor-html2canvas';
              }
              if (id.includes('xlsx')) {
                return 'vendor-xlsx';
              }
              // Other vendor code
              return 'vendor';
            }
            return undefined;
          },
        },
      },
    },
    optimizeDeps: {
      include: [
        '@giscus/react',
        'dayjs',
        'dayjs/locale/zh-cn',
        'dayjs/plugin/relativeTime',
        'medium-zoom/dist/pure',
        'rough-notation',
        'yet-another-react-lightbox',
        'yet-another-react-lightbox/plugins/captions',
        'yet-another-react-lightbox/plugins/counter',
        'yet-another-react-lightbox/plugins/fullscreen',
        'yet-another-react-lightbox/plugins/inline',
        'yet-another-react-lightbox/plugins/thumbnails',
        'yet-another-react-lightbox/plugins/zoom',
      ],
    },
    plugins: [
      fixViteClientEnvImport,
      tailwindcss(),
      // Bundle analyzer - only in production build with ANALYZE=true
      ...(process.env.ANALYZE === 'true' && !isDev
        ? /** @type {any} */ ([
            visualizer({
              emitFile: true,
              filename: 'stats.html',
              gzipSize: true,
              open: true,
            }),
          ])
        : []),
    ],
    resolve: {
      // Ensure all islands and prebundled deps share one React runtime.
      dedupe: ['react', 'react-dom'],
    },
    server: {
      watch: {
        ignored: ['**/.pnpm-store/**', '**/node_modules/**', '**/.git/**'],
      },
    },
  },
});
