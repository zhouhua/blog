import { useState, type FC, useEffect } from 'react';
import dayjs from 'dayjs';
import clsx from 'clsx';
import Image from '@components/Image';
import { Link } from 'gatsby';
import type { VariantType } from 'react-tooltip';
import { Tooltip } from 'react-tooltip';
import useColorMode from '@hooks/useColorMode';
import type { IArticle, IAuthor } from '../../types';
import ArticleAuthors from './Article.Authors';
import * as styles from './index.module.css';

interface ArticleHeroProps {
  article: IArticle;
  author: IAuthor;
}

const ArticleHero: FC<ArticleHeroProps> = ({ article, author }) => {
  const [colorMode] = useColorMode();
  const [tooltipTheme, setTooltipTheme] = useState<VariantType>('dark');
  useEffect(() => {
    setTooltipTheme(colorMode === 'dark' ? 'light' : 'dark');
  }, [colorMode]);
  return (
    <div className={styles.Hero}>
      <header className={clsx(styles.Header, 'relative z-10')}>
        <h1 className={styles.HeroHeading}>{article.frontmatter.title}</h1>
        <div
          className={clsx(
            styles.HeroSubtitle,
            'colorModeTransition relative flex w-full justify-between text-lg text-grey dark:text-dark-grey'
          )}
        >
          <div className="flex">
            <ArticleAuthors author={author} />
            <div>
              <span
                data-tooltip-content={dayjs(article.frontmatter.date).format('YYYY-MM-DD')}
                data-tooltip-id="date"
                data-tooltip-place="bottom"
                data-tooltip-delay-hide={1000}
                data-tooltip-delay-show={200}
                data-tooltip-variant={tooltipTheme}
              >
                {dayjs(article.frontmatter.date).fromNow()}
              </span>{' '}
              · {article.wordCount!.words} 个字 · {article.timeToRead} 分钟读完
            </div>
          </div>

          {article.frontmatter.layout === 'journal' && (
            <Link
              className="underline-offset-4 hover:text-accent hover:underline dark:hover:text-dark-accent"
              to="/journals"
            >
              更多随笔
            </Link>
          )}
        </div>
        {(article.frontmatter.tags?.length || 0) > 0 && (
          <ul className="mb-4 mt-8 flex flex-wrap">
            {article.frontmatter.tags!.map((tag, index) => (
              <li className="mb-4 mr-4 block" key={tag}>
                <Link
                  to={article.fields.tagSlugs![index]}
                  className={clsx(
                    'rounded-full bg-dark-card/10 px-4 py-1 text-secondary dark:bg-card/10 dark:text-dark-secondary',
                    'opacity-80 hover:opacity-100'
                  )}
                >
                  <i className="fa-solid fa-hashtag mr-1 h-3.5 w-3.5 text-accent opacity-80 dark:text-dark-accent" />
                  {tag}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </header>
      {article.frontmatter.hero && (
        <div
          className={clsx(
            styles.HeroImage,
            'relative z-[1] mx-auto my-0 w-full overflow-hidden',
            'sm sm:max-w-full'
          )}
          id="ArticleImage__Hero"
        >
          <Image
            src={article.frontmatter.hero!}
            alt={`文章《${article.frontmatter.title}》的题图`}
          />
        </div>
      )}
      <Tooltip id="date" />
    </div>
  );
};

export default ArticleHero;
