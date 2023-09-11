import type { FC } from 'react';
import type { PageProps } from 'gatsby';
import Section from '@components/Section';
// import SEO from '@components/SEO';
import Layout from '@components/Layout';
// import AuthorHero from '../sections/author/Author.Hero';
// import AuthorArticles from '../sections/author/Author.Articles';
import * as styles from './index.module.css';

const ArticlesPage: FC<PageProps> = ({ location, pageContext }) => {
  const { author } = pageContext.additionalContext;
  const articles = pageContext.group;

  return (
    <Layout>
      {/* <SEO pathname={location.pathname} title={author.name} description={author.bio} /> */}
      <Section narrow>
        {/* <AuthorHero author={author} /> */}
        {/* <AuthorArticles articles={articles} /> */}
      </Section>
    </Layout>
  );
};

export default ArticlesPage;
