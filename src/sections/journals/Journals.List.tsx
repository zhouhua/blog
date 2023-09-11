import dayjs from 'dayjs';
import type { FC } from 'react';
import { useMemo } from 'react';
import clsx from 'clsx';
import { useMount } from 'react-use';
import mediumZoom from 'medium-zoom';
import useColorMode from '@hooks/useColorMode';
import { Link } from 'gatsby';
import type { IArticle } from '../../types/index';
import * as articleStyles from '../../styles/article.module.css';
import * as styles from './index.module.css';

const JounalsList: FC<{ articles: IArticle[] }> = ({ articles }) => {
  const [colorMode] = useColorMode();
  const yearsList = useMemo(() => {
    const yearsSet = new Map<
      number,
      { content: string; date: string; wordCount: number; timeToRead: number; slug: string }[]
    >();
    articles.forEach(article => {
      const date = dayjs(article.frontmatter.date);
      const year = date.get('year');
      const dateString = date.format('MM-DD');
      if (!article.html) {
        return;
      }
      const value = {
        content: article.html,
        date: dateString,
        wordCount: article.wordCount!.words,
        timeToRead: article.timeToRead!,
        slug: article.fields.slug
      };
      if (yearsSet.has(year)) {
        const cache = yearsSet.get(year);
        cache?.push(value);
      } else {
        yearsSet.set(year, [value]);
      }
    });
    return yearsSet;
  }, [articles.length]);
  const orderedYears = useMemo(() => [...yearsList.keys()].sort((a, b) => b - a), [yearsList]);
  useMount(() => {
    mediumZoom('article picture img', {
      background: colorMode === 'dark' ? 'rgba(17,18,22,0.1)' : 'rgba(250,250,250,0.1)'
    });
  });
  return (
    <ul className="colorModeTransition text-primary dark:text-dark-primary">
      {orderedYears.map(year => (
        <li key={year} className="relative mb-20">
          <div
            id={`journals${year}`}
            className={clsx(
              'absolute -top-9 left-16 ml-3 sm:left-0 md:left-0 md:ml-1 lg:left-2',
              'font-monospace text-3xl font-semibold text-accent dark:text-dark-accent',
              'colorModeTransition'
            )}
          >
            {year}
          </div>
          <ul>
            {yearsList.get(year)?.map(({ content, date, wordCount, timeToRead, slug }) => (
              <li
                key={`${year}${date}`}
                id={`journal${year}-${date}`}
                className={clsx(
                  articleStyles.ArticleBody,
                  styles.note,
                  'relative z-10 flex flex-col justify-center',
                  'prose prose-stone max-w-none dark:prose-invert',
                  'prose-code:before:content-[unset] prose-code:after:content-[unset]',
                  'colorModeTransition'
                )}
              >
                <div className="absolute right-4 top-12 z-10 h-4 font-monospace text-sm text-grey dark:text-dark-grey sm:top-9">
                  共 {wordCount} 字，预计 {timeToRead} 分钟读完
                </div>
                <Link
                  to={slug.replace(/.*?#/, '/')}
                  className={clsx(
                    'absolute left-0 top-24 w-20 text-right font-monospace text-lg',
                    'sm:relative sm:top-0 sm:mb-4 sm:text-left md:-left-8 lg:-left-8',
                    'colorModeTransition',
                    styles.date
                  )}
                >
                  {date}
                </Link>
                <article
                  className={clsx(
                    'relative rounded-2xl bg-card px-10 pb-2 pt-12 dark:bg-card/10 sm:pt-8 md:px-8',
                    'colorModeTransition',
                    styles.noteContent
                  )}
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
};
export default JounalsList;
