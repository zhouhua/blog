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
      { name: '文章', path: '/articles' },
      { name: '随笔', path: '/journals' },
      { name: '照片', path: '/photos' },
      { name: '关于我', path: '/about' }
    ]
  },
  // If you use VSCode you can also use the GraphQL plugin
  // Learn more at: https://gatsby.dev/graphql-typegen
  graphqlTypegen: true,
  trailingSlash: 'ignore',
  jsxRuntime: 'automatic',
  plugins: [
    'gatsby-plugin-postcss',
    'gatsby-plugin-image',
    'gatsby-plugin-sitemap',
    'gatsby-plugin-sharp',
    'gatsby-transformer-sharp',
    'gatsby-transformer-yaml',
    'gatsby-plugin-pnpm',
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
              maxWidth: 800,
              linkImagesToOriginal: false,
              quality: 80,
              withWebp: true
            }
          },
          {
            resolve: 'gatsby-remark-responsive-iframe',
            options: { wrapperStyle: 'margin-bottom: 1.0725rem' }
          },
          // {
          //   resolve: '@raae/gatsby-remark-oembed',
          //   options: { providers: { include: ['Instagram'] } }
          // },
          {
            resolve: 'gatsby-remark-embed-video',
            options: {
              width: 680,
              ratio: 1.77, // Optional: Defaults to 16/9 = 1.77
              height: 400, // Optional: Overrides optional.ratio
              related: false,
              noIframeBorder: true, // Optional: Disable insertion of <style> border: 0
              urlOverrides: [
                {
                  id: 'youtube',
                  embedURL: (videoId: string) => `https://www.youtube-nocookie.com/embed/${videoId}`
                }
              ]
            }
          },
          {
            resolve: 'gatsby-remark-responsive-iframe',
            options: { wrapperStyle: 'margin-bottom: 1.0725rem' }
          },
          { resolve: 'gatsby-remark-numbered-footnotes' },
          { resolve: 'gatsby-remark-smartypants' },
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
          // 'gatsby-remark-smartypants',
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
        devMode: true,
        openAnalyzer: false,
        analyzerMode: 'server',
        analyzerPort: '8888',
        defaultSizes: 'gzip'
      }
    }
  ]
};

export default config;
