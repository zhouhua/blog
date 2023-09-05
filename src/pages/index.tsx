import type { HeadFC, PageProps } from 'gatsby';
import type { FC } from 'react';
import React from 'react';
import useArticlesData from '@hooks/useArticlesData';
import type { IArticle } from '../types/index';
import ArticlesList from '../templates/articles.template';

const Index: FC<PageProps<object, { articles: IArticle[] }>> = ({
  location,
  params,
  path,
  children,
  data,
  serverData,
  pageResources,
  uri
}) => {
  const articles = useArticlesData({ layout: 'post' });
  return (
    <ArticlesList
      pageContext={{ articles }}
      location={location}
      path={path}
      params={params}
      data={data}
      serverData={serverData}
      pageResources={pageResources}
      uri={uri}
    >
      {children}
    </ArticlesList>
  );
};

export default Index;

export const Head: HeadFC = () => <title>周骅的博客</title>;
