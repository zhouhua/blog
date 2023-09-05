import React from 'react';
import { Link } from 'gatsby';
import clsx from 'clsx';
import dayjs from 'dayjs';
import Image from '@components/Image';
import type { IArticle } from '../../types';
import * as styles from './index.module.css';
import type { GridLayout } from './Articles.List.Context';

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

interface ArticlesPairProps {
  articles: IArticle[];
  gridLayout: GridLayout;
  reverse: boolean;
}

interface ArticlesPairItemProps {
  article: IArticle;
  narrow?: boolean;
  gridLayout: GridLayout;
}

const ListItem: React.FC<ArticlesPairItemProps> = ({ article, narrow, gridLayout }) => {
  if (!article) {
    return null;
  }

  const hasOverflow = narrow && article.frontmatter!.title!.length > 35;
  const imageSource = article.frontmatter.hero;

  return (
    <Link
      className={clsx(
        styles.ArticleLink,
        'relative left-0 top-0 z-[1] block h-full w-full rounded-[5px]'
      )}
      to={article.fields!.slug || '/'}
      data-a11y="false"
    >
      <div className={`${gridLayout === 'rows' ? styles.listItemRow : styles.listItemTile}`}>
        <div
          className={clsx(styles.ImageContainer, {
            [styles.narrow]: narrow
          })}
          style={{
            height: `${gridLayout === 'tiles' ? '280px' : '250px'}`,
            marginBottom: `${gridLayout === 'tiles' ? '30px' : '0'}`
          }}
        >
          <Image src={imageSource!} alt={`文章《${article.frontmatter.title}》的题图`} />
        </div>
        <div>
          <h2
            className={clsx(styles.Title, styles.limitToTwoLines)}
            style={{
              marginBottom: `${hasOverflow && gridLayout === 'tiles' ? '35px' : '10px'}`
            }}
          >
            {article.frontmatter?.title}
          </h2>
          <p
            className={clsx(
              styles.Excerpt,
              styles.limitToTwoLines,
              'mb-2.5 font-serif text-base text-grey dark:text-dark-grey',
              'colorModeTransition sm:mb-5 sm:max-w-full sm:px-5 sm:py-0'
            )}
            style={{
              display: `${hasOverflow && gridLayout === 'tiles' ? 'none' : 'box'}`,
              maxWidth: `${narrow ? '415px' : '515px'}`
            }}
          >
            {article.excerpt}
          </p>
          <div className="colorModeTransition text-base text-grey opacity-60 dark:text-dark-grey sm:max-w-full sm:px-5 sm:pb-[30px] sm:pt-0">
            {dayjs(article.frontmatter?.date).fromNow()} · {article.wordCount.words} 个字 ·{' '}
            {article.timeToRead} 分钟读完
          </div>
        </div>
      </div>
    </Link>
  );
};

const ArticlesPair: React.FC<ArticlesPairProps> = ({ articles, reverse, gridLayout }) => {
  if (!articles) {
    return null;
  }

  const hasOnlyOneArticle = articles.length === 1;

  return (
    <div
      className={clsx(`${gridLayout === 'tiles' ? styles.listTile : styles.listRow}`, {
        [styles.oneArticle]: hasOnlyOneArticle,
        [styles.reverse]: reverse
      })}
    >
      {articles.slice(0, 2).map((article, i) => (
        <ListItem
          gridLayout={gridLayout}
          article={article}
          key={article.fields.slug}
          narrow={i % 2 ? reverse : !reverse}
        />
      ))}
    </div>
  );
};

export default ArticlesPair;
