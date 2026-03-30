import { cn } from '@lib/utils';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';

export interface JournalItem {
  year: number;
  dateString: string;
  excerpt: string;
  timeToRead: number;
  wordCount: number;
}

type FlatItem
  = | ({ type: 'card' } & JournalItem)
    | { type: 'year'; year: number };

interface Props {
  items: JournalItem[];
}

export default function JournalList({ items }: Props) {
  const parentRef = useRef<HTMLDivElement>(null);

  const flat: FlatItem[] = [];
  let lastYear: null | number = null;
  for (const item of items) {
    if (item.year !== lastYear) {
      flat.push({ type: 'year', year: item.year });
      lastYear = item.year;
    }
    flat.push({ type: 'card', ...item });
  }

  const virtualizer = useVirtualizer({
    count: flat.length,
    estimateSize: i => (flat[i]!.type === 'year' ? 80 : 300),
    getScrollElement: () => document.documentElement,
    measureElement: el => el.getBoundingClientRect().height,
    overscan: 5,
  });

  return (
    <div ref={parentRef}>
      <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
        {virtualizer.getVirtualItems().map((vItem) => {
          const item = flat[vItem.index]!;
          return (
            <div
              key={vItem.key}
              data-index={vItem.index}
              ref={virtualizer.measureElement}
              style={{
                position: 'absolute',
                top: 0,
                transform: `translateY(${vItem.start}px)`,
                width: '100%',
              }}
            >
              {item.type === 'year'
                ? (
                    <div
                      className={cn(
                        vItem.index === 0 ? 'mb-8' : 'mb-8 mt-20',
                        'mx-auto flex max-w-[920px] items-center gap-5 px-2 sm:gap-3 sm:px-0',
                        'after:block after:h-px after:flex-1 after:bg-secondary/15 after:content-[\'\']',
                      )}
                    >
                      <h2
                        className="colorModeTransition font-monospace text-[32px] font-semibold tracking-[0.08em] text-primary sm:text-[28px]"
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
                        'mx-auto w-full max-w-[920px] overflow-hidden rounded-[28px] border border-solid border-secondary/10 bg-card',
                      )}
                      id={`journal${item.year}-${item.dateString}`}
                      style={{
                        boxShadow: '0 24px 50px -24px rgba(15,23,42,0.34), 0 12px 24px -18px rgba(15,23,42,0.28)',
                      }}
                    >
                      <div className="colorModeTransition flex flex-row items-end justify-between gap-6 border-b border-solid border-secondary/10 px-10 pb-5 pt-7 sm:flex-col sm:items-start sm:gap-3 sm:px-5 sm:pb-4 sm:pt-5 md:px-8">
                        <a
                          className="colorModeTransition font-monospace text-[26px] font-semibold leading-none tracking-[0.08em] text-primary no-underline visited:text-primary"
                          href={`/journal${item.year}-${item.dateString}`}
                        >
                          {item.dateString}
                        </a>
                        <div className="colorModeTransition flex flex-wrap items-center justify-end gap-x-3 gap-y-1 pt-1 text-right font-monospace text-[13px] uppercase tracking-[0.08em] text-gray sm:justify-start sm:pt-0 sm:text-left">
                          <span>
                            {item.wordCount}
                            字
                          </span>
                          <span aria-hidden="true" className="colorModeTransition bg-secondary/35 inline-block h-1 w-1 rounded-full" />
                          <span>
                            {item.timeToRead}
                            分钟读完
                          </span>
                        </div>
                      </div>
                      <article className="colorModeTransition px-10 pb-8 pt-7 sm:px-5 sm:pb-5 sm:pt-5 md:px-8">
                        <p className="line-clamp-12 whitespace-pre-wrap text-primary leading-8">{item.excerpt}</p>
                      </article>
                    </div>
                  )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
