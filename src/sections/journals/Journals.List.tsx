import dayjs from 'dayjs';
import type { FC } from 'react';
import { useMemo } from 'react';
import clsx from 'clsx';
import { useMount } from 'react-use';
import mediumZoom from 'medium-zoom';
import useColorMode from '@hooks/useColorMode';
import type { IArticle } from '../../types/index';
import * as articleStyles from '../../styles/article.module.css';
import * as styles from './index.module.css';

const JounalsList: FC<{ articles: IArticle[] }> = ({ articles }) => {
  const [colorMode] = useColorMode();
  const yearsList = useMemo(() => {
    const yearsSet = new Map<number, { content: string; date: string }[]>();
    articles.forEach(article => {
      const date = dayjs(article.frontmatter.date);
      const year = date.get('year');
      const dateString = date.format('MM-DD');
      if (!article.html) {
        return;
      }
      if (yearsSet.has(year)) {
        const cache = yearsSet.get(year);
        cache?.push({ content: article.html, date: dateString });
      } else {
        yearsSet.set(year, [{ content: article.html, date: dateString }]);
      }
    });
    return yearsSet;
  }, [articles.length]);
  const orderedYears = useMemo(() => [...yearsList.keys()].sort((a, b) => b - a), [yearsList]);
  useMount(() => {
    mediumZoom('article picture img', {
      background: colorMode === 'dark' ? '#111216' : '#fafafa'
    });
  });
  return (
    <ul className="colorModeTransition text-primary dark:text-dark-primary">
      {orderedYears.map(year => (
        <li key={year} className="relative mb-20">
          <div
            id={`${year}`}
            className={clsx(
              'absolute -top-9 left-16 ml-3 sm:left-0 md:left-0 md:ml-1 lg:left-2',
              'font-monospace text-3xl font-semibold text-accent dark:text-dark-accent',
              'colorModeTransition'
            )}
          >
            {year}
          </div>
          <ul>
            {yearsList.get(year)?.map(({ content, date }) => (
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
                <div
                  className={clsx(
                    'absolute left-0 top-24 w-20 text-right font-monospace text-lg',
                    'sm:relative sm:top-0 sm:mb-4 sm:text-left md:-left-8 lg:-left-8',
                    'colorModeTransition',
                    styles.date
                  )}
                >
                  {date}
                </div>
                <div
                  className={clsx(
                    'relative rounded-2xl bg-card px-10 pb-2 pt-9 dark:bg-card/10 md:px-8',
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
