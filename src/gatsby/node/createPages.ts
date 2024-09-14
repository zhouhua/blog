import path from 'path';
import type { GatsbyNode } from 'gatsby';
import { config } from 'dotenv';
import { load } from 'cheerio';
import { pick, take, words } from 'lodash';
import type { PhotoProps } from 'react-photo-gallery';

config();

interface CustomPhotoType {
  image: Queries.ImageSharp;
  count: number;
  date: string;
  slug: string;
}

function simplifyList(list: Queries.MarkdownRemark[]): Queries.MarkdownRemark[] {
  return list.map<Queries.MarkdownRemark>(
    item =>
      pick(item, [
        'fields.slug',
        'frontmatter.title',
        'frontmatter.date',
        'frontmatter.hero',
        'timeToRead',
        'wordCount.words',
        'excerpt',
      ]),
  );
}
function simplifyArticle(item: Queries.MarkdownRemark): Queries.MarkdownRemark {
  return pick(item, [
    'fields.slug',
    'fields.tagSlugs',
    'frontmatter.title',
    'frontmatter.date',
    'frontmatter.tags',
    'frontmatter.layout',
    'frontmatter.hero',
    'timeToRead',
    'wordCount.words',
    'html',
  ]) as Queries.MarkdownRemark;
}

const log = (message: string, section: string) => {
  console.log(`\n\u001B[36m${message} \u001B[4m${section}\u001B[0m\u001B[0m\n`);
};

const templatesDirectory = path.resolve(__dirname, '../../templates');
const templates = {
  articles: path.resolve(templatesDirectory, 'articles.template.tsx'),
  article: path.resolve(templatesDirectory, 'article.template.tsx'),
  author: path.resolve(templatesDirectory, 'author.template.tsx'),
  journals: path.resolve(templatesDirectory, 'journals.template.tsx'),
  homepage: path.resolve(templatesDirectory, 'HomePage.tsx'),
  photos: path.resolve(templatesDirectory, 'photos.list.template.tsx'),
  photo: path.resolve(templatesDirectory, 'photo.group.template.tsx'),
};

const createPages: GatsbyNode['createPages'] = async (
  { actions: { createPage }, graphql },
  themeOptions,
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
  let photos: Queries.photo[] = [];
  if (rootPath) {
    log('Config rootPath', rootPath as string);
  }
  else {
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
                featured
                hero {
                  childImageSharp {
                    gatsbyImageData(
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
        authors: allAuthor {
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
    const photosQeury = await graphql(`
      {
        photos: allPhoto(sort: { date: DESC }, limit: 1000) {
          edges {
            node {
              title
              date
              fields {
                slug
              }
              list {
                description
                featured
                picture {
                  childImageSharp {
                    fields {
                      exif {
                        raw {
                          image {
                            Make
                            Model
                            Orientation
                          }
                          exif {
                            ExposureBiasValue
                            ExposureTime
                            FNumber
                            FocalLength
                            FocalLengthIn35mmFormat
                            ISO
                            PixelXDimension
                            PixelYDimension
                            DateTimeOriginal
                          }
                        }
                      }
                    }
                    gatsbyImageData(
                      layout: CONSTRAINED
                      quality: 80
                      placeholder: DOMINANT_COLOR
                      breakpoints: [200, 650, 1280, 1800, 2000]
                    )
                  }
                }
              }
            }
          }
        }
      }
    `);
    authors = ((authorsQuery.data as any).authors.edges as Queries.AuthorsYamlEdge[]).map(
      edge => edge.node,
    );

    articles = ((articlesQuery.data as any).articles.edges as Queries.MarkdownRemarkEdge[]).map(
      edge => edge.node,
    );
    photos = ((photosQeury.data as any).photos.edges as Queries.photoEdge[]).map(edge => edge.node);
  }
  catch (error) {
    console.error(error);
  }

  articles.forEach(article => {
    const $ = load(article.html || '');
    const pureText = $.text();
    const wordCount
      = words(pureText).length
      + words(pureText, /[\p{sc=Katakana}\p{sc=Hiragana}\p{sc=Han}]/gu).length;
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
    .filter(article => !article.frontmatter.draft);

  if (articles.length === 0 || authors.length === 0) {
    throw new Error('You must have at least one Author and Post. ');
  }

  createPage({
    path: '/articles',
    component: templates.articles,
    context: {
      articles: simplifyList(articlesPublished),
      authors: authors[0],
      basePath,
      permalink: '/articles',
      slug: '/articles',
    },
  });

  const journals = articles.filter(article => article.frontmatter.layout === 'journal');

  createPage({
    path: '/journals',
    component: templates.journals,
    context: {
      articles: journals.map(simplifyArticle),
      authors: authors[0],
      basePath,
      permalink: '/journals',
      slug: '/journals',
    },
  });

  /**
   * Once the list of articles have bene created, we need to make individual article posts.
   * To do this, we need to find the corresponding authors since we allow for co-authors.
   */
  log('Creating', 'article posts');
  const tagsMap = new Map<string, { slug: string; articles: Queries.MarkdownRemark[]; }>();
  articlesPublished.forEach((article, index) => {
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
        article: simplifyArticle(article),
        author: authors[0],
        basePath,
        permalink: `${((data as any).site.siteMetadata as Queries.SiteSiteMetadata).siteUrl}${
          article.fields.slug
        }/`,
        slug: article.fields.slug,
        id: article.id,
        title: article.frontmatter.title,
        next,
      },
    });

    // 处理 tag 列表
    article.frontmatter.tags?.forEach((tag, i) => {
      const cache = tagsMap.get(tag);
      if (!cache) {
        tagsMap.set(tag, { slug: article.fields.tagSlugs![i], articles: [article] });
      }
      else {
        cache.articles.push(article);
      }
    });
  });
  log('Creating', 'journal pages');
  journals.forEach(article => {
    const slug = article.fields.slug.replace(/.+?#/, '/');
    const title = `随笔 🗓️ ${article.fields.slug.split('#journal').pop()}`;
    // @ts-ignore
    article.frontmatter.title = title;
    createPage({
      path: slug,
      component: templates.article,
      context: {
        article: simplifyArticle(article),
        author: authors[0],
        basePath,
        permalink: `${
          ((data as any).site.siteMetadata as Queries.SiteSiteMetadata).siteUrl
        }${slug}/`,
        slug,
        id: article.id,
        title,
      },
    });

    // 处理 tag 列表
    article.frontmatter.tags?.forEach((tag, i) => {
      const cache = tagsMap.get(tag);
      if (!cache) {
        tagsMap.set(tag, { slug: article.fields.tagSlugs![i], articles: [article] });
      }
      else {
        cache.articles.push(article);
      }
    });
  });
  tagsMap.forEach(({ slug, articles: list }, tag) => {
    createPage({
      path: slug,
      component: templates.articles,
      context: {
        articles: simplifyList(list),
        authors: authors[0],
        tag,
        basePath,
        permalink: slug,
        slug,
      },
    });
  });

  const photoList: PhotoProps<CustomPhotoType>[] = [];
  photos.forEach(({ list, title: alt, date, fields }) => {
    const [{ picture }] = [...list.filter(({ featured }) => !!featured), list[0]];
    const { width, height } = picture!.childImageSharp!.gatsbyImageData;
    const { fallback } = picture?.childImageSharp?.gatsbyImageData.images || {};
    photoList.push({
      src: fallback!.src,
      width,
      height,
      alt,
      image: picture!.childImageSharp!,
      count: list.length,
      date: date,
      slug: fields.slug,
    });
  });
  const featuredList: PhotoProps<CustomPhotoType>[] = [];
  photos.forEach(({ list, title: alt, date, fields }) => {
    const featuredPictures = [...list.filter(({ featured }) => !!featured)];
    if (featuredPictures.length) {
      const [{ picture }] = featuredPictures;
      const { width, height } = picture!.childImageSharp!.gatsbyImageData;
      const { fallback } = picture?.childImageSharp?.gatsbyImageData.images || {};
      featuredList.push({
        src: fallback!.src,
        width,
        height,
        alt,
        image: picture!.childImageSharp!,
        count: list.length,
        date: date,
        slug: fields.slug,
      });
    }
  });
  createPage({
    path: '/photos',
    component: templates.photos,
    context: {
      author: authors[0],
      photos: photoList,
      basePath,
      permalink: '/photos',
      slug: '/photos',
    },
  });
  photos.forEach(photo => {
    createPage({
      path: photo.fields.slug,
      component: templates.photo,
      context: {
        author: authors[0],
        photoPost: photo,
        featuredList: featuredList.filter(item => item.slug !== photo.fields.slug),
        basePath,
        permalink: photo.fields.slug,
        slug: photo.fields.slug,
      },
    });
  });

  // make homepage
  const articleNumber = articlesPublished.length;
  const journalNumber = journals.length;
  const photoNumber = photos.length;
  const articleWordCount = articlesPublished.reduce(
    (prev, article) => prev + (article.wordCount?.words || 0),
    0,
  );
  const journalWordCount = journals.reduce(
    (prev, journal) => prev + (journal.wordCount?.words || 0),
    0,
  );
  const allPhotoCount = photos.reduce((prev, { list }) => prev + list.length, 0);
  const featuredArticles = simplifyList(
    articlesPublished.filter(article => article.frontmatter.featured),
  );
  const allFeaturedImage: PhotoProps<CustomPhotoType>[] = [];
  photos.forEach(photo => {
    photo.list.forEach(({ featured, picture }) => {
      if (featured) {
        const { width, height } = picture!.childImageSharp!.gatsbyImageData;
        const { fallback } = picture?.childImageSharp?.gatsbyImageData.images || {};
        allFeaturedImage.push({
          src: fallback!.src,
          width,
          height,
          alt: photo.title,
          count: 0,
          image: picture!.childImageSharp!,
          date: photo.date,
          slug: photo.fields.slug,
        });
      }
    });
  });
  const newestJournals = take(journals, 5).map(simplifyArticle);
  createPage({
    path: '/',
    component: templates.homepage,
    context: {
      author: authors[0],
      journalWordCount,
      articleWordCount,
      articleNumber,
      photoNumber,
      journalNumber,
      allPhotoCount,
      allFeaturedImage,
      basePath,
      featuredArticles,
      newestJournals,
      permalink: '/',
      slug: '/',
    },
  });
};

export default createPages;
