import React from 'react';
import type { FC } from 'react';
import type { PageProps } from 'gatsby';
import clsx from 'clsx';
import Section from '@components/Section';
import SEO from '@components/SEO';
import Layout from '@components/Layout';
import useSiteMetadata from '@hooks/useSiteMetaData';
import JounalsList from '../sections/journals/Journals.List';
import type { IArticle } from '../types/index';
import * as styles from './index.module.css';
import ArticlesHero from '../sections/articles/Articles.Hero';

const ArticlesPage: FC<PageProps<object, { articles: IArticle[]; tag?: string }>> = ({
  location,
  pageContext
}) => {
  const { title } = useSiteMetadata();
  return (
    <Layout>
      <SEO pathname={location.pathname} isBlogPost={false} title={title} />
      <ArticlesHero tag={pageContext.tag} />
      <Section narrow>
        <JounalsList articles={pageContext.articles} />
      </Section>
      <div className={clsx(styles.Gradient, 'colorModeTransition')} />
    </Layout>
  );
};

export default ArticlesPage;
