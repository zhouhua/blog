import type { FC } from 'react';
import Seo from '@components/SEO';
import useSiteMetadata from '@hooks/useSiteMetaData';
import type { IArticle, IAuthor } from '../../types';

interface ArticleSEOProps {
  article: IArticle;
  author: IAuthor;
  location: Location;
  imagelocation?: string;
}

const ArticleSEO: FC<ArticleSEOProps> = ({ article, author, location, imagelocation }) => {
  const { siteUrl } = useSiteMetadata();

  imagelocation = siteUrl
  + (article.frontmatter.hero?.childImageSharp?.gatsbyImageData.images.fallback?.src || '');

  return (
    <Seo
      isBlogPost
      authorName={author.name}
      authorsBio={author.bio}
      authorsSlug={author.authorsPage}
      canonicalUrl={siteUrl + location.pathname}
      dateforSEO={article.frontmatter.date}
      description={article.excerpt || ''}
      image={imagelocation}
      articlepathName={siteUrl + location.pathname}
      pathname={location.pathname}
      published={article.frontmatter.date}
      title={article.frontmatter.title}
    />
  );
};

export default ArticleSEO;
