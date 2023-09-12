import type { FC } from 'react';
import { Link } from 'gatsby';
import clsx from 'clsx';
import dayjs from 'dayjs';
import Image from '@components/Image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAnglesRight } from '@fortawesome/free-solid-svg-icons';
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
  showAllLink?: boolean;
}

interface ArticlesPairItemProps {
  article: IArticle;
  narrow?: boolean;
  gridLayout: GridLayout;
}

const ListItem: FC<ArticlesPairItemProps> = ({ article, narrow, gridLayout }) => {
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
              display: `${hasOverflow && gridLayout === 'tiles' ? 'none' : 'box'}`
            }}
          >
            {article.excerpt}
          </p>
          <div className="colorModeTransition text-base text-grey opacity-60 dark:text-dark-grey sm:max-w-full sm:px-5 sm:pb-[30px] sm:pt-0">
            {dayjs(article.frontmatter?.date).fromNow()} · {article.wordCount!.words} 个字 ·{' '}
            {article.timeToRead} 分钟读完
          </div>
        </div>
      </div>
    </Link>
  );
};

const ArticlesPair: FC<ArticlesPairProps> = ({
  articles,
  reverse,
  gridLayout,
  showAllLink = false
}) => {
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
      {articles.length === 1 && showAllLink && (
        <Link
          className={clsx(
            styles.moreLink,
            'flex items-center justify-center text-primary dark:text-dark-primary',
            'border border-solid border-grey/50 dark:border-dark-grey/50',
            'sm:mb-20 sm:h-28 sm:border-0 sm:bg-card sm:dark:bg-dark-card'
          )}
          to="/articles"
        >
          查看所有文章
          <FontAwesomeIcon icon={faAnglesRight} className="ml-4" />
        </Link>
      )}
    </div>
  );
};

export default ArticlesPair;
