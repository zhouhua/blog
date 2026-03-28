// @ts-check
import process from 'node:process';
import mdx from '@astrojs/mdx';
import node from '@astrojs/node';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import { transformerMetaHighlight } from '@shikijs/transformers';
import tailwindcss from '@tailwindcss/vite';
import mediaCard from '@zhouhua-dev/remark-media-card';
import remarkDescription from 'astro-remark-description';
import { defineConfig } from 'astro/config';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';

const DOUBLE_NEWLINE_RE = /\n\n/g;
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

const integrations = [
  mdx(),
  sitemap(),
  react(),
];

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

// https://astro.build/config
export default defineConfig({
  adapter: isVercelBuild
    ? vercel({
        imageService: true,
        isr: {
          expiration: 7 * 60 * 60 * 24,
        },
        webAnalytics: {
          enabled: true,
        },
      })
    : node({
        mode: 'standalone',
      }),
  base: '/',
  integrations,
  markdown: {
    rehypePlugins: [rehypeKatex],
    remarkPlugins: [
      mediaCard,
      remarkMath,
      [remarkDescription, { name: 'excerpt' }],
    ],
    shikiConfig: {
      transformers: [
        {
          /** @param {string} code */
          preprocess(code) {
            return code.trimEnd().replace(DOUBLE_NEWLINE_RE, '\n \n');
          },
        },
        transformerMetaHighlight(),
      ],
    },
  },
  output: 'server',
  site: 'https://zhouhua.site/',
  trailingSlash: 'ignore',
  vite: {
    optimizeDeps: {
      include: [
        '@giscus/react',
        'dayjs',
        'dayjs/locale/zh-cn',
        'dayjs/plugin/relativeTime',
        'medium-zoom/dist/pure',
        'mermaid',
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
    plugins: [fixViteClientEnvImport, tailwindcss()],
  },
});
