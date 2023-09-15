import { useState, type FC, useEffect } from 'react';
import dayjs from 'dayjs';
import clsx from 'clsx';
import Image from '@components/Image';
import { Link } from 'gatsby';
import type { VariantType } from 'react-tooltip';
import { Tooltip } from 'react-tooltip';
import useColorMode from '@hooks/useColorMode';
import { faHashtag } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
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
            'colorModeTransition text-palette-gray relative flex w-full justify-between text-lg'
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
              className="hover:text-palette-accent underline-offset-4 hover:underline"
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
                    'bg-palette-bgAlt text-palette-secondary rounded-full px-4 py-1',
                    'opacity-80 hover:opacity-100'
                  )}
                >
                  <FontAwesomeIcon
                    icon={faHashtag}
                    className="text-palette-accent mr-1 h-3.5 w-3.5 opacity-80"
                  />
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
            'relative z-[1] mx-auto my-0 w-full overflow-hidden text-center',
            'aspect-video sm:max-w-full md:max-w-full'
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
