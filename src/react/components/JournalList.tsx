import { cn } from '@lib/utils';
import styles from '@styles/article.module.css';
import DOMPurify from 'dompurify';
import { Virtuoso } from 'react-virtuoso';

export interface JournalItem {
  year: number;
  dateString: string;
  /** Full prose HTML from Astro content pipeline (same as single journal page). */
  html: string;
  timeToRead: number;
  wordCount: number;
}

type FlatItem = ({ type: 'card' } & JournalItem) | { type: 'year'; year: number };

interface Props {
  items: JournalItem[];
}

export default function JournalList({ items }: Props) {
  const scrollParent = typeof document === 'undefined' ? null : document.body;

  const flat: FlatItem[] = [];
  let lastYear: null | number = null;
  for (const item of items) {
    if (item.year !== lastYear) {
      flat.push({ type: 'year', year: item.year });
      lastYear = item.year;
    }
    flat.push({ type: 'card', ...item });
  }

  const renderItem = (item: FlatItem, index: number) =>
    (item.type === 'year'
      ? (
          <div
            className={cn(
              index === 0 ? 'mb-8' : 'mt-20 mb-8',
              'mx-auto flex max-w-[920px] items-center gap-5 px-2 sm:gap-3 sm:px-0',
              'after:bg-secondary/15 after:block after:h-px after:flex-1 after:content-[\'\']',
            )}
          >
            <h2
              className="colorModeTransition font-monospace text-[32px] font-semibold tracking-[0.08em] sm:text-[28px]"
              id={`journals${item.year}`}
            >
              {item.year}
            </h2>
          </div>
        )
      : (
          <div
            className={cn(
              'colorModeTransition',
              'border-secondary/10 bg-card mx-auto mb-16 w-full max-w-[820px] overflow-hidden rounded-[28px] border border-solid',
            )}
            id={`journal${item.year}-${item.dateString}`}
            style={{
              boxShadow: '0 24px 50px -24px rgba(15,23,42,0.34), 0 12px 24px -18px rgba(15,23,42,0.28)',
            }}
          >
            <div className="colorModeTransition border-secondary/10 flex flex-col items-end justify-between gap-6 border-b border-solid px-10 pt-7 pb-5 sm:flex-row sm:items-start sm:gap-3 sm:px-5 sm:pt-5 sm:pb-4 md:px-8">
              <a
                className="colorModeTransition font-monospace text-[26px] leading-none font-semibold tracking-[0.08em] no-underline"
                href={`/journal${item.year}-${item.dateString}`}
              >
                {item.dateString}
              </a>
              <div className="colorModeTransition font-monospace text-gray flex flex-wrap items-center justify-end gap-x-3 gap-y-1 pt-1 text-right text-[13px] tracking-[0.08em] uppercase sm:justify-start sm:pt-0 sm:text-left">
                <span>
                  {item.wordCount}
                  字
                </span>
                <span
                  aria-hidden="true"
                  className="colorModeTransition bg-secondary/35 inline-block h-1 w-1 rounded-full"
                />
                <span>
                  {item.timeToRead}
                  分钟读完
                </span>
              </div>
            </div>
            <article
              className={cn(styles.ArticleBody, 'colorModeTransition px-10 py-4!')}
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(item.html, {
                  ALLOWED_ATTR: ['href', 'class', 'src', 'alt', 'title', 'id', 'style'],
                  ALLOWED_TAGS: [
                    'p',
                    'br',
                    'strong',
                    'em',
                    'a',
                    'ul',
                    'ol',
                    'li',
                    'code',
                    'pre',
                    'h1',
                    'h2',
                    'h3',
                    'h4',
                    'h5',
                    'h6',
                    'blockquote',
                    'img',
                    'span',
                    'div',
                    'section',
                    'article',
                    'table',
                    'thead',
                    'tbody',
                    'tr',
                    'th',
                    'td',
                  ],
                }),
              }}
            />
          </div>
        ));

  return (
    <Virtuoso<FlatItem>
      {...(scrollParent ? { customScrollParent: scrollParent } : {})}
      data={flat}
      itemContent={(index, item) => renderItem(item, index)}
    />
  );
}
