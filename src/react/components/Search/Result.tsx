import type { Hit } from 'instantsearch.js';
import type { FC } from 'react';
import { cn } from '@lib/utils';
import useRecentList from '@react/hooks/useRecentList';
import { bindKey, unbindKey } from '@rwh/keystrokes';
import { once } from 'lodash-es';
import { useEffect, useRef, useState } from 'react';
import { Highlight, Snippet, useInfiniteHits, useStats } from 'react-instantsearch';
import scrollIntoView from 'scroll-into-view-if-needed';
import styles from './index.module.css';
import NoResult from './NoResult';
import Recent from './Recent';

const icons = {
  journal: <span className="iconify fa6-solid--pen-nib" />,
  photo: <span className="iconify fa6-solid--images" />,
  post: <span className="iconify fa6-solid--file-lines" />,
  tag: <span className="iconify fa6-solid--tag" />,
};

const Result: FC<{ hide: () => void }> = ({ hide }) => {
  const { isLastPage, items, showMore } = useInfiniteHits();
  const { nbHits, processingTimeMS, query } = useStats();
  const showHits = !!items.length && !!query;
  const noResult = !!query && !nbHits;
  const showRecent = !showHits && !noResult;
  const sentinelRef = useRef<HTMLLIElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const { addRecent } = useRecentList();

  useEffect(() => {
    if (sentinelRef.current !== null && rootRef.current !== null) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !isLastPage) {
              showMore();
            }
          });
        },
        { root: rootRef.current, rootMargin: '60px' },
      );
      observer.observe(sentinelRef.current);
      return () => observer.disconnect();
    }
    return () => undefined;
  }, [isLastPage, showMore]);

  function addHistory(hit: Hit) {
    let { layout, slug, title } = hit;
    if (layout === 'journal') {
      title = `随笔 🗓️ ${slug.split('#').pop()}`;
    }
    addRecent({
      query,
      slug,
      title,
    });
    hide();
  }
  const [selectIndex, setSelectIndex] = useState<number>(-1);
  const selectedDom = useRef<HTMLLIElement>(null);

  useEffect(() => {
    setSelectIndex(-1);
  }, [query]);

  useEffect(() => {
    if (selectedDom.current) {
      scrollIntoView(selectedDom.current, {
        behavior: 'smooth',
        block: 'nearest',
        scrollMode: 'if-needed',
      });
    }
  }, [selectIndex]);

  useEffect(() => {
    if (!items.length || !query) {
      return;
    }
    const upKeyHandler = {
      onPressed: () => {
        if (selectIndex > 0) {
          setSelectIndex(selectIndex - 1);
        }
        else {
          setSelectIndex(0);
        }
      },
    };
    const downKeyHandler = {
      onPressed: () => {
        if (selectIndex < items.length - 1) {
          setSelectIndex(selectIndex + 1);
        }
        else {
          setSelectIndex(items.length - 1);
        }
      },
    };
    const enterKeyHandler = {
      onPressed: () => {
        if (selectIndex < 0) {
          setSelectIndex(0);
          return;
        }
        if (selectIndex < items.length) {
          const hit = items[selectIndex];
          if (!hit) {
            return;
          }
          addHistory(hit);
          history.pushState(null, '', hit.slug as string);
          hide();
        }
      },
    };

    const upKey = 'ArrowUp';
    const downKey = 'ArrowDown';
    const enterKey = 'Enter';
    bindKey(upKey, upKeyHandler);
    bindKey(downKey, downKeyHandler);
    bindKey(enterKey, enterKeyHandler);
    return () => {
      unbindKey(upKey, upKeyHandler);
      unbindKey(downKey, downKeyHandler);
      unbindKey(enterKey, enterKeyHandler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length, selectIndex, setSelectIndex, query]);

  return (
    <>
      {showHits && (
        <div ref={rootRef} className="overflow-y-overlay max-h-[60vh]">
          <p className="px-6 pt-4 text-right text-[12px] text-palette-gray">
            搜索
            <span className="px-1 text-palette-secondary">{query}</span>
            共找到
            {' '}
            {nbHits}
            {' '}
            条结果，耗时
            {' '}
            {processingTimeMS}
            ms
          </p>
          <ul className="pb-6 ">
            {items.map((hit, index) => (
              <li
                key={hit.objectID}
                ref={(node) => {
                  if (selectIndex === index) {
                    selectedDom.current = node!;
                  }
                }}
                className={cn(
                  styles.resultItem,
                  'colorModeTransition relative mx-6 mt-2 items-center overflow-hidden rounded-lg bg-palette-bg p-4 sm:mx-2.5',
                  { [styles.selected!]: index === selectIndex },
                )}
                onMouseEnter={() => setSelectIndex(index)}
              >
                <div
                  className={cn(
                    styles.icon,
                    'colorModeTransition rounded border border-solid border-palette-gray',
                    'absolute left-4 top-1/2 h-6 w-6 shrink-0 -translate-y-1/2 text-center text-[14px]',
                    'flex items-center justify-center',
                  )}
                >
                  {icons[hit.layout as keyof typeof icons]}
                </div>
                {(hit.layout === 'post' || hit.layout === 'photo') && (
                  <a
                    className="block cursor-pointer px-10 sm:px-8"
                    href={hit.slug as string}
                    onClick={once(() => addHistory(hit))}
                  >
                    <h2
                      className={cn(
                        'mb-1 inline-block h-6 max-w-[90%] rounded-full bg-palette-card px-2 text-xs leading-6',
                        'colorModeTransition overflow-hidden overflow-ellipsis whitespace-nowrap text-palette-primary',
                      )}
                    >
                      { /** @ts-expect-error deps version */}
                      <Highlight attribute="title" className="max-w-full" hit={hit} />
                    </h2>
                    <p className="line-clamp-2 overflow-ellipsis whitespace-normal text-sm leading-6">
                      { /** @ts-expect-error deps version */}
                      <Snippet attribute="text" hit={hit} />
                    </p>
                  </a>
                )}
                {hit.layout === 'journal' && (
                  <div onClick={once(() => addHistory(hit))}>
                    <a
                      className="block cursor-pointer px-10 sm:px-8"
                      href={hit.slug as string}
                    >
                      <h2
                        className={cn(
                          'mb-1 inline-block h-6 max-w-[90%] rounded-full bg-palette-card px-2 text-xs leading-6',
                          'colorModeTransition overflow-hidden overflow-ellipsis whitespace-nowrap text-palette-primary',
                        )}
                      >
                        { /** @ts-expect-error deps version */}
                        <Highlight attribute="title" className="max-w-full" hit={hit} />
                      </h2>
                      <p className="line-clamp-2 overflow-ellipsis whitespace-normal text-sm leading-6">
                        { /** @ts-expect-error deps version */}
                        <Snippet attribute="text" hit={hit} />
                      </p>
                    </a>
                  </div>
                )}
                {hit.layout === 'tag' && (
                  <div onClick={once(() => addHistory(hit))}>
                    <a
                      className="block cursor-pointer px-10 sm:px-8"
                      href={hit.slug as string}
                    >
                      <h2
                        className={cn(
                          'mb-1 inline-block h-6 max-w-[90%] rounded-full bg-palette-card px-2 text-xs leading-6',
                          'colorModeTransition overflow-hidden overflow-ellipsis whitespace-nowrap text-palette-primary',
                        )}
                      >
                        { /** @ts-expect-error deps version */}
                        <Highlight attribute="title" className="max-w-full" hit={hit} />
                      </h2>
                    </a>
                  </div>
                )}
                <div className="absolute right-3 top-1/2 h-6 w-6 -translate-y-1/2 text-center">
                  <span className="iconify fa6-solid--angle-right" />
                </div>
              </li>
            ))}
            <li ref={sentinelRef} aria-hidden="true" />
          </ul>
        </div>
      )}
      {noResult && <NoResult />}
      {showRecent && <Recent hide={hide} />}
    </>
  );
};

export default Result;
