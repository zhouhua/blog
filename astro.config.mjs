// @ts-check
import process from 'node:process';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel/serverless';
import sentry from '@sentry/astro';
import { transformerMetaHighlight } from '@shikijs/transformers';
import swup, { Theme } from '@swup/astro';
import mediaCard from '@zhouhua-dev/remark-media-card';
import { defineConfig } from 'astro/config';
import devtoolBreakpoints from 'astro-devtool-breakpoints';
import pageInsight from 'astro-page-insight';
import remarkDescription from 'astro-remark-description';
import tailwindConfigViewer from 'astro-tailwind-config-viewer';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';

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
  integrations: [
    mdx(),
    swup({
      accessibility: false,
      cache: true,
      globalInstance: true,
      theme: [Theme.overlay, { color: '#000', direction: 'to-right', duration: '0.2s' }],
      updateHead: true,
    }),
    sitemap(),
    tailwind({
      applyBaseStyles: false,
    }),
    react({
      include: ['**/react/*'],
    }),
    pageInsight(),
    devtoolBreakpoints(),
    tailwindConfigViewer(),
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
