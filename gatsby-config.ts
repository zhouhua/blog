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
      maxWidth: 800
    },
    menu: [
      { name: '文章', path: '/articles', icon: 'pen-fancy' },
      { name: '随笔', path: '/journals', icon: 'message' },
      // { name: '照片', path: '/photos' },
      { name: '关于我', path: '/about', icon: 'address-card' }
    ]
  },
  // If you use VSCode you can also use the GraphQL plugin
  // Learn more at: https://gatsby.dev/graphql-typegen
  graphqlTypegen: true,
  trailingSlash: 'always',
  jsxRuntime: 'automatic',
  flags: {
    DEV_SSR: true
  },
  plugins: [
    'gatsby-plugin-postcss',
    'gatsby-plugin-image',
    'gatsby-plugin-sitemap',
    'gatsby-plugin-sharp',
    'gatsby-transformer-sharp',
    'gatsby-transformer-yaml',
    'gatsby-plugin-pnpm',
    'gatsby-plugin-netlify',
    // {
    //   resolve: 'gatsby-plugin-transition-link',
    //   options: {
    //     layout: require.resolve('./src/components/Layout/Layout.tsx')
    //   }
    // },
    {
      resolve: 'gatsby-plugin-anchor-links',
      options: {
        duration: 500
      }
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'authors',
        path: `${__dirname}/src/authors`
      }
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'pages',
        path: `${__dirname}/src/pages`
      }
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'images',
        path: `${__dirname}/src/images`
      }
    },
    {
      resolve: 'gatsby-transformer-remark',
      options: {
        plugins: [
          'gatsby-remark-prismjs-copy-button',
          {
            resolve: 'gatsby-remark-images',
            options: {
              maxWidth: 650,
              linkImagesToOriginal: false,
              quality: 80,
              withWebp: true,
              srcSetBreakpoints: [200, 360, 500, 650, 1300, 2600]
            }
          },
          { resolve: 'gatsby-remark-numbered-footnotes' },
          {
            resolve: 'gatsby-remark-external-links',
            options: {
              target: '_blank',
              rel: 'nofollow'
            }
          },
          {
            resolve: 'gatsby-remark-prismjs',
            options: {
              showLineNumbers: true,
              inlineCodeMarker: '±'
            }
          },
          'gatsby-remark-copy-linked-files',
          'gatsby-remark-katex'
          // 'gatsby-remark-autolink-headers'
        ]
      }
    },
    {
      resolve: 'gatsby-plugin-manifest',
      options: {
        icon: 'src/images/logo.png'
      }
    },
    {
      resolve: 'gatsby-plugin-algolia',
      options: {
        appId: process.env.GATSBY_ALGOLIA_APP_ID,
        apiKey: process.env.ALGOLIA_ADMIN_KEY,
        queries: query
      }
    },
    {
      resolve: 'gatsby-plugin-webpack-bundle-analyser-v2',
      options: {
        openAnalyzer: false,
        analyzerMode: 'server',
        analyzerPort: '8888',
        defaultSizes: 'gzip'
      }
    }
  ]
};

export default config;
