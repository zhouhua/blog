module.exports = {
    siteMetadata: {
        url: 'https://www.zhouhua.site',
        title: 'Step Over',
        subtitle: '有趣的灵魂终会相遇',
        copyright: '© All rights reserved.',
        menu: [
            {
                label: '文章',
                path: '/'
            },
            {
                label: '关于我',
                path: '/about/'
            },
            {
                label: '联系我',
                path: '/contact/'
            }
        ],
        author: {
            name: '周骅',
            email: 'zhou--hua@163.com',
            github: 'zhouhua-js',
            rss: '#'
        }
    },
    plugins: [
        {
            resolve: 'gatsby-source-filesystem',
            options: {
                path: `${__dirname}/src/pages`,
                name: 'pages'
            }
        },
        {
            resolve: 'gatsby-plugin-feed',
            options: {
                query: `
          {
            site {
              siteMetadata {
                url
                title
                subtitle
              }
            }
          }
        `,
                feeds: [
                    {
                        serialize: ({ query: { site, allMarkdownRemark } }) => (
                            allMarkdownRemark.edges.map(edge =>
                                Object.assign({}, edge.node.frontmatter, {
                                    description: edge.node.excerpt,
                                    date: edge.node.frontmatter.date,
                                    url: site.siteMetadata.url + edge.node.fields.slug,
                                    guid: site.siteMetadata.url + edge.node.fields.slug,
                                    custom_elements: [{ 'content:encoded': edge.node.html }]
                                }))
                        ),
                        query: `
              {
                allMarkdownRemark(
                  limit: 1000,
                  sort: { order: DESC, fields: [frontmatter___date] },
                  filter: { frontmatter: { layout: { eq: "post" }, draft: { ne: true } } }
                ) {
                  edges {
                    node {
                      excerpt(pruneLength: 150)
                      html
                      fields {
                        slug
                      }
                      frontmatter {
                        title
                        date
                        layout
                        draft
                      }
                    }
                  }
                }
              }
            `,
                        output: '/rss.xml'
                    }
                ]
            }
        },
        {
            resolve: 'gatsby-transformer-remark',
            options: {
                plugins: [
                    {
                        resolve: 'gatsby-remark-images',
                        options: { maxWidth: 960 }
                    },
                    {
                        resolve: 'gatsby-remark-responsive-iframe',
                        options: { wrapperStyle: 'margin-bottom: 1.0725rem' }
                    },
                    {
                        resolve: 'gatsby-remark-external-links',
                        options: {
                            target: '_blank',
                            rel: 'nofollow'
                        }
                    },
                    {
                        resolve: 'gatsby-remark-flowchart',
                        options: {
                            // see more details on https://github.com/adrai/flowchart.js
                            'fill': 'white',
                            'line-color': 'black'
                        }
                    },
                    'gatsby-remark-prismjs',
                    'gatsby-remark-copy-linked-files',
                    'gatsby-remark-smartypants',
                    'gatsby-remark-katex',
                    'gatsby-remark-autolink-headers'
                ]
            }
        },
        'gatsby-transformer-sharp',
        'gatsby-plugin-sharp',
        {
            resolve: 'gatsby-plugin-google-analytics',
            options: { trackingId: 'UA-35493639-1' }
        },
        {
            resolve: 'gatsby-plugin-google-fonts',
            options: { fonts: ['roboto:400,400i,500,700'] }
        },
        {
            resolve: 'gatsby-plugin-sitemap',
            options: {
                query: `
            {
              site {
                siteMetadata {
                  url
                }
              }
              allSitePage(
                filter: {
                  path: { regex: "/^(?!/404/|/404.html|/dev-404-page/)/" }
                }
              ) {
                edges {
                  node {
                    path
                  }
                }
              }
          }`,
                output: '/sitemap.xml',
                serialize: ({ site, allSitePage }) =>
                    allSitePage.edges.map(edge => {
                        return {
                            url: site.siteMetadata.url + edge.node.path,
                            changefreq: 'daily',
                            priority: 0.7
                        };
                    })
            }
        },
        {
            resolve: 'gatsby-plugin-accessibilityjs',
            options: {
                injectStyles: false,
                errorClassName: false
            }
        }, {
            resolve: 'gatsby-plugin-favicon',
            options: {
                logo: './src/pages/photo.jpg',
                injectHTML: true,
                icons: {
                    android: true,
                    appleIcon: true,
                    appleStartup: true,
                    favicons: true,
                    firefox: true,
                    windows: true
                }
            }
        },
        'gatsby-plugin-offline',
        'gatsby-plugin-catch-links',
        'gatsby-plugin-react-next',
        'gatsby-plugin-react-helmet',
        'gatsby-plugin-postcss-sass',
        'gatsby-plugin-stylus'
    ]
};
