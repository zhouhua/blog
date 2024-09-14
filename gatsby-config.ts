import type { GatsbyConfig } from 'gatsby';
import dotenv from 'dotenv';
import query from './src/gatsby/algolia/query';

dotenv.config();

const config: GatsbyConfig = {
  siteMetadata: {
    title: '周骅的博客',
    siteUrl: 'https://www.zhouhua.site',
    subtitle: '有趣的灵魂终会相遇',
    copyright: '© All rights reserved.',
    hero: {
      heading: '周骅的博客',
      maxWidth: 800,
    },
    menu: [
      { name: '文章', path: '/articles', icon: 'pen-fancy' },
      { name: '项目', path: '/projects', icon: 'project' },
      { name: '随笔', path: '/journals', icon: 'message' },
      { name: '照片', path: '/photos', icon: 'image' },
      { name: '关于我', path: '/about', icon: 'address-card' },
    ],
  },
  // If you use VSCode you can also use the GraphQL plugin
  // Learn more at: https://gatsby.dev/graphql-typegen
  graphqlTypegen: true,
  trailingSlash: 'always',
  jsxRuntime: 'automatic',
  flags: {
    DEV_SSR: true,

    // GATSBY_EXPERIMENTAL_QUERY_CONCURRENCY: true
    FAST_DEV: true,
    PARALLEL_SOURCING: true,
    DETECT_NODE_MUTATIONS: true,
  },
  plugins: [
    'gatsby-plugin-postcss',
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'authors',
        path: `${__dirname}/src/authors`,
      },
    },
    {
      resolve: 'gatsby-transformer-yaml',
      options: {
        typeName: ({ object }: { object?: { layout: string; }; }) => object?.layout,
      },
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'articles',
        path: `${__dirname}/src/pages/articles`,
      },
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'journals',
        path: `${__dirname}/src/pages/journals`,
      },
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'photos',
        path: `${__dirname}/src/pages/photos`,
      },
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'images',
        path: `${__dirname}/src/images`,
      },
    },
    'gatsby-plugin-image',
    'gatsby-plugin-sitemap',
    {
      resolve: 'gatsby-plugin-sharp',
      options: {
        failOn: 'none',
      },
    },
    'gatsby-transformer-sharp',
    'gatsby-plugin-pnpm-gatsby-5',
    {
      resolve: '@zhouhua-dev/gatsby-plugin-sharp-exif',
      options: {
        includes: ['src/pages/photos/**/*.{jpg,png,jpeg,gif,webp}'],
      },
    },
    {
      resolve: 'gatsby-plugin-anchor-links',
      options: {
        duration: 500,
      },
    },
    {
      resolve: 'gatsby-transformer-remark',
      options: {
        plugins: [
          '@zhouhua-dev/remark-media-card-gatsby',
          'gatsby-remark-prismjs-copy-button',
          {
            resolve: 'gatsby-remark-images',
            options: {
              maxWidth: 650,
              linkImagesToOriginal: false,
              quality: 80,
              withWebp: true,
              srcSetBreakpoints: [200, 360, 650, 1280, 1800, 2600],
            },
          },
          { resolve: 'gatsby-remark-numbered-footnotes' },
          {
            resolve: 'gatsby-remark-external-links',
            options: {
              target: '_blank',
              rel: 'nofollow',
            },
          },
          {
            resolve: `gatsby-remark-mermaid`,
            options: /** @type {import('gatsby-remark-mermaid').Options} */ ({
              mermaidConfig: {
                theme: 'default',
              },
            }),
          },
          {
            resolve: 'gatsby-remark-prismjs',
            options: {
              showLineNumbers: true,
              inlineCodeMarker: '±',
            },
          },
          'gatsby-remark-copy-linked-files',
          { resolve: 'gatsby-remark-katex', options: { output: 'html', strict: 'ignore' } },
          // 'gatsby-remark-autolink-headers'
        ],
      },
    },
    {
      resolve: 'gatsby-plugin-manifest',
      options: {
        icon: 'src/images/logo.png',
      },
    },
    {
      resolve: 'gatsby-plugin-algolia',
      options: {
        appId: process.env.GATSBY_ALGOLIA_APP_ID,
        apiKey: process.env.ALGOLIA_ADMIN_KEY,
        queries: query,
      },
    },
    // {
    //   resolve: 'gatsby-plugin-webpack-bundle-analyser-v2',
    //   options: {
    //     openAnalyzer: true,
    //     analyzerMode: 'server',
    //     analyzerPort: '8888',
    //     defaultSizes: 'gzip',

    //   }
    // },
    'gatsby-plugin-emotion',
    'gatsby-plugin-material-ui',
  ],
};

export default config;
