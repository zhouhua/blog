import type { FC } from 'react';
import { useContext, useEffect } from 'react';
import clsx from 'clsx';
import type { IArticle } from '../../types';
import { GridLayoutContext } from './Articles.List.Context';
import ArticlePair from './Articles.Pair';
import * as styles from './index.module.css';

/**
 * Tiles
 * [LONG], [SHORT]
 * [SHORT], [LONG]
 * [SHORT], [LONG]
 *
 * or ------------
 *
 * Rows
 * [LONG]
 * [LONG]
 * [LONG]
 */

interface ArticlesListProps {
  articles: IArticle[];
  alwaysShowAllDetails?: boolean;
}

const ArticlesList: FC<ArticlesListProps> = ({ articles, alwaysShowAllDetails }) => {
  const { gridLayout = 'tiles', hasSetGridLayout, getGridLayout } = useContext(GridLayoutContext);

  /**
   * We're taking the flat array of articles [{}, {}, {}...]
   * and turning it into an array of pairs of articles [[{}, {}], [{}, {}], [{}, {}]...]
   * This makes it simpler to create the grid we want
   */
  const articlePairs: [IArticle, IArticle][] = articles.reduce(
    (result: [IArticle, IArticle][], value, index, array) => {
      if (index % 2 === 0) {
        result.push(array.slice(index, index + 2) as [IArticle, IArticle]);
      }
      return result;
    },
    []
  );

  useEffect(() => {
    getGridLayout!();
  }, []);

  return (
    <div
      className={clsx(styles.ArticlesListContainer, { [styles.showDetails]: alwaysShowAllDetails })}
      style={{ opacity: hasSetGridLayout ? 1 : 0 }}
    >
      {articlePairs.map((ap, index) => {
        const isEven = index % 2 !== 0;

        return (
          <ArticlePair
            articles={ap}
            gridLayout={gridLayout}
            reverse={isEven}
            key={ap[0].fields.slug}
          />
        );
      })}
    </div>
  );
};

export default ArticlesList;
