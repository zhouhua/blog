import type { FC } from 'react';
import ArticlePair from '../articles/Articles.Pair';
import type { IArticle } from '../../types';

interface ArticlesNextProps {
  articles: IArticle[];
}

const ArticlesNext: FC<ArticlesNextProps> = ({ articles }) => {
  if (!articles) {
    return null;
  }
  return <ArticlePair articles={articles} gridLayout="tiles" reverse={false} />;
};

export default ArticlesNext;
