import dayjs from 'dayjs';
import type { FC } from 'react';
import { useMemo, useRef } from 'react';
import clsx from 'clsx';
import { useMount } from 'react-use';
import mediumZoom from 'medium-zoom';
import useColorMode from '@hooks/useColorMode';
import { Link } from 'gatsby';
import { annotate } from 'rough-notation';
import type { IArticle } from '../../types/index';
import * as articleStyles from '../../styles/article.module.css';
import * as styles from './index.module.css';

const JounalsList: FC<{ articles: IArticle[]; }> = ({ articles }) => {
  const [colorMode] = useColorMode();
  const $notes = useRef<HTMLUListElement>(null);
  const yearsList = useMemo(() => {
    const yearsSet = new Map<
      number,
      { content: string; date: string; wordCount: number; timeToRead: number; slug: string; }[]
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
        slug: article.fields.slug,
      };
      if (yearsSet.has(year)) {
        const cache = yearsSet.get(year);
        cache?.push(value);
      }
      else {
        yearsSet.set(year, [value]);
      }
    });
    return yearsSet;
  }, [articles.length]);
  const orderedYears = useMemo(() => [...yearsList.keys()].sort((a, b) => b - a), [yearsList]);
  useMount(() => {
    if ($notes.current) {
      mediumZoom('article picture img', {
        background: colorMode === 'dark' ? 'rgba(17,18,22,0.1)' : 'rgba(250,250,250,0.1)',
      });
      const callouts = $notes.current.querySelectorAll<HTMLDivElement>('.callout');
      callouts.forEach(callout => {
        annotate(callout, {
          type: 'box',
          color: 'rgb(var(--color-bg-alt))',
          strokeWidth: 1,
          padding: 0,
        }).show();
      },
      );
      const blockquates = $notes.current.querySelectorAll<HTMLDivElement>('blockquote');
      console.log(blockquates);
      blockquates.forEach(blockquote => {
        annotate(blockquote, {
          type: 'bracket',
          color: 'rgb(var(--color-bg-alt))',
          strokeWidth: 3,
          brackets: ['left'],
          padding: 2,
        }).show();
      },
      );
    }
  });
  return (
    <ul ref={$notes} className="colorModeTransition text-palette-primary">
      {orderedYears.map(year => (
        <li key={year} className="relative mb-20">
          <div
            className={clsx(
              'absolute -top-9 left-16 ml-3 sm:left-0 md:left-0 md:ml-1 lg:left-2',
              'font-monospace text-3xl font-semibold text-palette-accent',
              'colorModeTransition',
            )}
            id={`journals${year}`}
          >
            {year}
          </div>
          <ul>
            {yearsList.get(year)?.map(({ content, date, wordCount, timeToRead, slug }) => (
              <li
                key={`${year}${date}`}
                className={clsx(
                  articleStyles.ArticleBody,
                  styles.note,
                  'relative z-10 flex max-w-none flex-col justify-center',
                  'colorModeTransition',
                )}
                id={`journal${year}-${date}`}
              >
                <div className="absolute right-4 top-12 z-10 h-4 font-monospace text-sm text-palette-gray sm:top-9">
                  共
                  {' '}
                  {wordCount}
                  {' '}
                  字，预计
                  {' '}
                  {timeToRead}
                  {' '}
                  分钟读完
                </div>
                <Link
                  className={clsx(
                    'absolute left-0 top-24 w-20 text-right font-monospace text-lg',
                    'sm:relative sm:top-0 sm:mb-4 sm:text-left md:-left-8 lg:-left-8',
                    'colorModeTransition',
                    styles.date,
                  )}
                  to={slug.replace(/.*?#/, '/')}
                >
                  {date}
                </Link>
                <article
                  dangerouslySetInnerHTML={{ __html: content }}
                  className={clsx(
                    'relative rounded-2xl bg-palette-card px-10 pb-2 pt-12 sm:px-4 sm:pt-8 md:px-8',
                    'colorModeTransition',
                    styles.noteContent,
                  )}
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
