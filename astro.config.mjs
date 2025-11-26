// @ts-check
import process from 'node:process';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import sentry from '@sentry/astro';
import { transformerMetaHighlight } from '@shikijs/transformers';
import mediaCard from '@zhouhua-dev/remark-media-card';
import pageInsight from 'astro-page-insight';
import remarkDescription from 'astro-remark-description';
import { defineConfig } from 'astro/config';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  adapter: vercel({
    isr: {
      expiration: 7 * 60 * 60 * 24,
    },
    webAnalytics: {
      enabled: true,
    },
  }),
  base: '/',
  integrations: [
    mdx(),
    sitemap(),
    react({
      include: ['**/react/*'],
    }),
    pageInsight(),
    sentry({
      dsn: 'https://3980dc24dd4a6cbe00ad71338a2f834c@o56440.ingest.us.sentry.io/4508126150656000',
      sourceMapsUploadOptions: {
        authToken: process.env.SENTRY_AUTH_TOKEN || '',
        project: 'javascript-astro',
      },
    }),
  ],
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
          preprocess(code) {
            return code.trimEnd().replace(/\n\n/g, '\n \n');
          },
        },
        transformerMetaHighlight(),
      ],
    },
  },
  output: 'server',
  site: 'https://zhouhua.site/',
  trailingSlash: 'ignore',
});
