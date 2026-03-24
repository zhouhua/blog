// @ts-check
import process from 'node:process';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import { transformerMetaHighlight } from '@shikijs/transformers';
import tailwindcss from '@tailwindcss/vite';
import mediaCard from '@zhouhua-dev/remark-media-card';
import pageInsight from 'astro-page-insight';
import remarkDescription from 'astro-remark-description';
import { defineConfig } from 'astro/config';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';

const DOUBLE_NEWLINE_RE = /\n\n/g;
const isDev = process.argv.includes('dev');

const integrations = [
  mdx(),
  sitemap(),
  react(),
  pageInsight(),
];

if (!isDev) {
  const { default: sentry } = await import('@sentry/astro');

  integrations.push(
    sentry({
      dsn: 'https://3980dc24dd4a6cbe00ad71338a2f834c@o56440.ingest.us.sentry.io/4508126150656000',
      sourceMapsUploadOptions: {
        authToken: process.env.SENTRY_AUTH_TOKEN || '',
        project: 'javascript-astro',
      },
    }),
  );
}

// https://astro.build/config
export default defineConfig({
  adapter: vercel({
    isr: {
      expiration: 7 * 60 * 60 * 24,
    },
    webAnalytics: {
      enabled: true,
    },
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
    plugins: [tailwindcss()],
  },
});
