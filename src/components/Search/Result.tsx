import { Link, navigate } from 'gatsby';
import type { FC } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import type { Hit } from 'instantsearch.js';
import { once } from 'lodash';
import { Highlight, Snippet, useInfiniteHits, useStats } from 'react-instantsearch';
import clsx from 'clsx';
import { bindKey, unbindKey } from '@rwh/keystrokes';
import scrollIntoView from 'scroll-into-view-if-needed';
import { AnchorLink } from 'gatsby-plugin-anchor-links';
import * as styles from './index.module.css';
import NoResult from './NoResult';
import Recent from './Recent';
import useRecentList from './useRecentList';

const icons = { post: 'fa-file-lines', journal: 'fa-pen-nib' };

const Result: FC<{ hide: () => void }> = ({ hide }) => {
  const { hits, isLastPage, showMore } = useInfiniteHits();
  const { query, nbHits, processingTimeMS } = useStats();
  const showHits = !!hits.length && !!query;
  const noResult = !!query && !nbHits;
  const showRecent = !showHits && !noResult;
  const sentinelRef = useRef<HTMLLIElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const { addRecent } = useRecentList();

  useEffect(() => {
    if (sentinelRef.current !== null && rootRef.current !== null) {
      const observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting && !isLastPage) {
              showMore();
            }
          });
        },
        { root: rootRef.current, rootMargin: '60px' }
      );
      observer.observe(sentinelRef.current);
      return () => observer.disconnect();
    }
  }, [isLastPage, showMore, sentinelRef.current, rootRef.current]);

  function addHistory(hit: Hit) {
    let { title } = hit;
    if (hit.layout === 'journal') {
      title = `随笔 - ${hit.slug.split('#').pop()}`;
    }
    addRecent({
      title,
      query,
      slug: hit.slug
    });
    hide();
  }
  const [selectIndex, setSelectIndex] = useState<number>(-1);
  const selectedDom = useRef<HTMLLIElement>();
  useEffect(() => {
    if (selectedDom.current) {
      scrollIntoView(selectedDom.current, {
        scrollMode: 'if-needed',
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [selectedDom.current]);

  useEffect(() => {
    if (!hits.length || !query) {
      return;
    }
    const upKeyHandler = {
      onPressed: () => {
        if (selectIndex > 0) {
          setSelectIndex(selectIndex - 1);
        } else {
          setSelectIndex(0);
        }
      }
    };
    const downKeyHandler = {
      onPressed: () => {
        if (selectIndex < hits.length - 1) {
          setSelectIndex(selectIndex + 1);
        } else {
          setSelectIndex(hits.length - 1);
        }
      }
    };
    const enterKeyHandler = {
      onPressed: () => {
        if (selectIndex < hits.length) {
          const hit = hits[selectIndex];
          addHistory(hit);
          navigate(hit.slug as string);
          hide();
        }
      }
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
  }, [hits.length, selectIndex, setSelectIndex, query]);

  return (
    <>
      {showHits && (
        <div className="max-h-[60vh] overflow-y-auto" ref={rootRef}>
          <p className="px-6 pt-4 text-right text-[12px] text-grey dark:text-dark-grey">
            搜索<span className="px-1 text-secondary dark:text-dark-secondary">{query}</span>
            共找到 {nbHits} 条结果，耗时 {processingTimeMS}ms
          </p>
          <ul className="pb-6 ">
            {hits.map((hit, index) => (
              <li
                key={hit.objectID}
                className={clsx(
                  styles.resultItem,
                  'mx-6 mt-2 flex max-w-full items-center rounded-lg bg-card p-3 dark:bg-dark-card',
                  { [styles.selected]: index === selectIndex }
                )}
                onMouseEnter={() => setSelectIndex(index)}
                ref={node => {
                  if (selectIndex === index) {
                    selectedDom.current = node!;
                  }
                }}
              >
                <div
                  className={clsx(
                    styles.icon,
                    'rounded border border-solid border-grey/50 dark:border-dark-grey/50',
                    'mr-4 h-6 w-6 text-center text-[14px]'
                  )}
                >
                  <i className={clsx('fa-solid', icons[hit.layout as 'post' | 'journal'])} />
                </div>
                {hit.layout === 'post' && (
                  <Link
                    to={hit.slug as string}
                    className="block grow-[2] cursor-pointer"
                    onClick={once(() => addHistory(hit))}
                  >
                    <h2 className="mb-1 inline-block h-6 rounded-full bg-background px-2 text-[12px] leading-6 dark:bg-dark-background">
                      <Highlight attribute="title" hit={hit} />
                    </h2>
                    <p className="overflow-ellipsis text-[14px] leading-6">
                      <Snippet attribute="excerpt" hit={hit} />
                    </p>
                  </Link>
                )}
                {hit.layout === 'journal' && (
                  <div onClick={once(() => addHistory(hit))}>
                    <AnchorLink to={hit.slug as string} className="block grow-[2] cursor-pointer">
                      <h2 className="mb-1 inline-block h-6 rounded-full bg-background px-2 text-[12px] leading-6 dark:bg-dark-background">
                        随笔 - {(hit.slug as string).split('#').pop()}
                      </h2>
                      <p className="overflow-ellipsis text-[14px] leading-6">
                        <Snippet attribute="excerpt" hit={hit} />
                      </p>
                    </AnchorLink>
                  </div>
                )}
                <div className="ml-4 h-6 w-6">
                  <i className="fa-solid fa-angle-right" />
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
