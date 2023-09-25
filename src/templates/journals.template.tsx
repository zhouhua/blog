import type { FC } from 'react';
import type { PageProps } from 'gatsby';
import Section from '@components/Section';
import SEO from '@components/SEO';
import Layout from '@components/Layout';
import useSiteMetadata from '@hooks/useSiteMetaData';
import JounalsList from '../sections/journals/Journals.List';
import type { IArticle } from '../types/index';
import ArticlesHero from '../sections/articles/Articles.Hero';

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
        title={`${title} - 所有随笔`}
        description="随手记录不成熟的想法"
      />
      <Section narrow>
        <JounalsList articles={pageContext.articles} />
      </Section>
    </Layout>
  );
};

export default ArticlesPage;
