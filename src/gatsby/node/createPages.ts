/* eslint-disable no-console, import/no-extraneous-dependencies, prefer-const, no-shadow */
import path from 'path';
import type { GatsbyNode } from 'gatsby';
import { config } from 'dotenv';
import { load } from 'cheerio';
import { words } from 'lodash';

config();

const log = (message: string, section: string) =>
  console.log(`\n\u001B[36m${message} \u001B[4m${section}\u001B[0m\u001B[0m\n`);

const templatesDirectory = path.resolve(__dirname, '../../templates');
const templates = {
  articles: path.resolve(templatesDirectory, 'articles.template.tsx'),
  article: path.resolve(templatesDirectory, 'article.template.tsx'),
  author: path.resolve(templatesDirectory, 'author.template.tsx'),
  journals: path.resolve(templatesDirectory, 'journals.template.tsx')
};

const createPages: GatsbyNode['createPages'] = async (
  { actions: { createPage }, graphql },
  themeOptions
) => {
  const { rootPath, basePath = '/', authorsPath = '/authors', authorsPage = true } = themeOptions;

  const { data } = await graphql(`
    query siteQuery {
      site {
        siteMetadata {
          siteUrl
        }
      }
    }
  `);

  let authors: Queries.AuthorsYaml[] = [];
  let articles: Queries.MarkdownRemark[] = [];
  if (rootPath) {
    log('Config rootPath', rootPath as string);
  } else {
    log('Config rootPath not set, using basePath instead =>', basePath as string);
  }

  log('Config basePath', basePath as string);
  if (authorsPage) {
    log('Config authorsPath', authorsPath as string);
  }

  try {
    const articlesQuery = await graphql(`
      query {
        articles: allMarkdownRemark(
          sort: { frontmatter: { date: DESC } }
          limit: 1000
          filter: { frontmatter: { date: { ne: null }, layout: { in: ["post", "journal"] } } }
        ) {
          edges {
            node {
              id
              fields {
                # categorySlug
                slug
                tagSlugs
              }
              frontmatter {
                title
                date
                draft
                tags
                layout
                hero {
                  childImageSharp {
                    gatsbyImageData(
                      width: 1560
                      layout: CONSTRAINED
                      placeholder: BLURRED
                      formats: [AUTO, WEBP]
                    )
                  }
                }
              }
              timeToRead
              wordCount {
                paragraphs
                sentences
                words
              }
              html
              excerpt(pruneLength: 120, truncate: true)
            }
          }
        }
      }
    `);
    const authorsQuery = await graphql(`
      {
        authors: allAuthorsYaml {
          edges {
            node {
              authorsPage
              bio
              id
              name
              featured
              social {
                url
              }
              avatar {
                childImageSharp {
                  gatsbyImageData(
                    layout: CONSTRAINED
                    width: 100
                    quality: 80
                    placeholder: DOMINANT_COLOR
                  )
                }
              }
            }
          }
        }
      }
    `);
    authors = ((authorsQuery.data as any).authors.edges as Queries.AuthorsYamlEdge[]).map(
      edge => edge.node
    );

    articles = ((articlesQuery.data as any).articles.edges as Queries.MarkdownRemarkEdge[]).map(
      edge => edge.node
    );
  } catch (error) {
    console.error(error);
  }

  articles.forEach(article => {
    const $ = load(article.html || '');
    const pureText = $.text();
    const wordCount =
      words(pureText).length +
      words(pureText, /[\p{sc=Katakana}\p{sc=Hiragana}\p{sc=Han}]/gu).length;
    const imagesCount = $('picture').length;
    const timeToRead = Math.ceil(wordCount / 275 + imagesCount / 12);
    // @ts-ignore
    article.wordCount.words = wordCount;
    // @ts-ignore
    article.timeToRead = timeToRead;
  });

  const articlesPublished = articles
    .filter(article => article.frontmatter.layout === 'post')
    .filter(article => !!article.frontmatter.title)
    .filter(article => !article.frontmatter?.draft);

  if (articles.length === 0 || authors.length === 0) {
    throw new Error('You must have at least one Author and Post. ');
  }

  const liteArticleList = articlesPublished.map(article => {
    const liteArticle = { ...article };
    liteArticle.html = '';
    return liteArticle;
  });

  createPage({
    path: '/articles',
    component: templates.articles,
    context: {
      articles: liteArticleList,
      authors: authors[0],
      basePath,
      permalink: '/articles',
      slug: '/articles'
    }
  });

  const journals = articles.filter(article => article.frontmatter.layout === 'journal');

  createPage({
    path: '/journals',
    component: templates.journals,
    context: {
      articles: journals,
      authors: authors[0],
      basePath,
      permalink: '/journals',
      slug: '/journals'
    }
  });

  /**
   * Once the list of articles have bene created, we need to make individual article posts.
   * To do this, we need to find the corresponding authors since we allow for co-authors.
   */
  log('Creating', 'article posts');
  const tagsMap = new Map<string, { slug: string; articles: Queries.MarkdownRemark[] }>();
  articles.forEach((article, index) => {
    /**
     * We need a way to find the next artiles to suggest at the bottom of the articles page.
     * To accomplish this there is some special logic surrounding what to show next.
     */
    let next = articlesPublished.slice(index + 1, index + 3);
    // If it's the last item in the list, there will be no articles. So grab the first 2
    if (next.length === 0) {
      next = articlesPublished.slice(0, 2);
    }
    // If there's 1 item in the list, grab the first article
    if (next.length === 1 && articlesPublished.length !== 2) {
      next = [...next, articlesPublished[0]];
    }
    if (articlesPublished.length === 1) {
      next = [];
    }

    createPage({
      path: article.fields.slug,
      component: templates.article,
      context: {
        article,
        author: authors[0],
        basePath,
        permalink: `${((data as any).site.siteMetadata as Queries.SiteSiteMetadata).siteUrl}${
          article.fields.slug
        }/`,
        slug: article.fields.slug,
        id: article.id,
        title: article.frontmatter.title,
        next
      }
    });

    // 处理 tag 列表
    article.frontmatter.tags?.forEach((tag, i) => {
      const cache = tagsMap.get(tag);
      if (!cache) {
        tagsMap.set(tag, { slug: article.fields.tagSlugs![i], articles: [article] });
      } else {
        cache.articles.push(article);
      }
    });
  });
  tagsMap.forEach(({ slug, articles: list }, tag) => {
    createPage({
      path: slug,
      component: templates.articles,
      context: {
        articles: list,
        authors: authors[0],
        tag,
        basePath,
        permalink: slug,
        slug
      }
    });
  });
};

export default createPages;
