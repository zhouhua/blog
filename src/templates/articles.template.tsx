import type { FC } from 'react';
import type { PageProps } from 'gatsby';
import Section from '@components/Section';
import SEO from '@components/SEO';
import Layout from '@components/Layout';
import useSiteMetadata from '@hooks/useSiteMetaData';
import type { IArticle } from '../types/index';
import ArticlesHero from '../sections/articles/Articles.Hero';
import ArticlesList from '../sections/articles/Articles.List';

const ArticlesPage: FC<PageProps<object, { articles: IArticle[]; tag?: string }>> = ({
  location,
  pageContext
}) => {
  const { title } = useSiteMetadata();
  return (
    <Layout>
      <SEO pathname={location.pathname} isBlogPost={false} title={title} />
      <ArticlesHero
        tag={pageContext.tag}
        showLayout
        title={`${title} - 所有文章`}
        description="胡言乱语"
      />
      <Section narrow>
        <ArticlesList articles={pageContext.articles} />
      </Section>
    </Layout>
  );
};

export default ArticlesPage;
