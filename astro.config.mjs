// @ts-check
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel/serverless';
import sentry from '@sentry/astro';
import { transformerMetaHighlight } from '@shikijs/transformers';
import spotlightjs from '@spotlightjs/astro';
import mediaCard from '@zhouhua-dev/remark-media-card';
import { defineConfig } from 'astro/config';
import devtoolBreakpoints from 'astro-devtool-breakpoints';
import icon from 'astro-icon';
import metaTags from 'astro-meta-tags';
import pageInsight from 'astro-page-insight';
import tailwindConfigViewer from 'astro-tailwind-config-viewer';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';

// https://astro.build/config
export default defineConfig({
  adapter: vercel(),
  base: '/',
  integrations: [
    mdx(),
    icon({
      iconDir: 'src/assets/icon',
      include: {
        'fa6-solid': ['pen-fancy', 'code', 'message', 'image', 'address-card'],
      },
    }),
    sitemap(),
    tailwind({
      applyBaseStyles: false,
    }),
    react({
      include: ['**/react/*'],
    }),
    sentry(),
    spotlightjs(),
    metaTags(),
    pageInsight(),
    devtoolBreakpoints(),
    tailwindConfigViewer(),
  ],
  markdown: {
    rehypePlugins: [rehypeKatex],
    remarkPlugins: [
      mediaCard,
      remarkMath,
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
