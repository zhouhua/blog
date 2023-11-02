import { Link, navigate } from 'gatsby';
import type { FC } from 'react';
import { useEffect, useRef, useState } from 'react';
import type { Hit } from 'instantsearch.js';
import { once } from 'lodash';
import { Highlight, Snippet, useInfiniteHits, useStats } from 'react-instantsearch';
import clsx from 'clsx';
import { bindKey, unbindKey } from '@rwh/keystrokes';
import scrollIntoView from 'scroll-into-view-if-needed';
import { AnchorLink } from 'gatsby-plugin-anchor-links';
import { faAngleRight, faFileLines, faImages, faPenNib } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as styles from './index.module.css';
import NoResult from './NoResult';
import Recent from './Recent';
import useRecentList from './useRecentList';

const icons = { post: faFileLines, journal: faPenNib, photo: faImages };

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
      title = `随笔 🗓️ ${hit.slug.split('#').pop()}`;
    }
    addRecent({
      title,
      query,
      slug: hit.slug
    });
    window.gtag('search_hit', { query, uri: hit.slug, title });
    hide();
  }
  const [selectIndex, setSelectIndex] = useState<number>(-1);
  const selectedDom = useRef<HTMLLIElement>();

  useEffect(() => {
    setSelectIndex(-1);
  }, [query]);

  useEffect(() => {
    if (query) {
      window.gtag('search_query', { number: nbHits });
    }
  }, [query, nbHits]);

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
        if (selectIndex < 0) {
          setSelectIndex(0);
          return;
        }
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
        <div className="overflow-y-overlap max-h-[60vh]" ref={rootRef}>
          <p className="px-6 pt-4 text-right text-[12px] text-palette-gray">
            搜索<span className="px-1 text-palette-secondary">{query}</span>
            共找到 {nbHits} 条结果，耗时 {processingTimeMS}ms
          </p>
          <ul className="pb-6 ">
            {hits.map((hit, index) => (
              <li
                key={hit.objectID}
                className={clsx(
                  styles.resultItem,
                  'colorModeTransition relative mx-6 mt-2 items-center overflow-hidden rounded-lg bg-palette-bg p-4 sm:mx-2.5',
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
                    'colorModeTransition rounded border border-solid border-palette-gray',
                    'absolute left-4 top-1/2 h-6 w-6 shrink-0 -translate-y-1/2 text-center text-[14px]'
                  )}
                >
                  <FontAwesomeIcon icon={icons[hit.layout as 'post' | 'journal' | 'photo']} />
                </div>
                {(hit.layout === 'post' || hit.layout === 'photo') && (
                  <Link
                    to={hit.slug as string}
                    className="block cursor-pointer px-10 sm:px-8"
                    onClick={once(() => addHistory(hit))}
                  >
                    <h2
                      className={clsx(
                        'mb-1 inline-block h-6 max-w-[90%] rounded-full bg-palette-card px-2 text-xs leading-6',
                        'colorModeTransition overflow-hidden overflow-ellipsis whitespace-nowrap text-palette-primary'
                      )}
                    >
                      <Highlight className="max-w-full" attribute="title" hit={hit} />
                    </h2>
                    <p className="line-clamp-2 overflow-ellipsis whitespace-normal text-sm leading-6">
                      <Snippet attribute="excerpt" hit={hit} />
                    </p>
                  </Link>
                )}
                {hit.layout === 'journal' && (
                  <div onClick={once(() => addHistory(hit))}>
                    <AnchorLink
                      to={hit.slug as string}
                      className="block cursor-pointer px-10 sm:px-8"
                    >
                      <h2
                        className={clsx(
                          'mb-1 inline-block h-6 max-w-[90%] rounded-full bg-palette-card px-2 text-xs leading-6',
                          'colorModeTransition overflow-hidden overflow-ellipsis whitespace-nowrap text-palette-primary'
                        )}
                      >
                        随笔 🗓️ {(hit.slug as string).split('#').pop()}
                      </h2>
                      <p className="line-clamp-2 overflow-ellipsis whitespace-normal text-sm leading-6">
                        <Snippet attribute="excerpt" hit={hit} />
                      </p>
                    </AnchorLink>
                  </div>
                )}
                <div className="absolute right-3 top-1/2 h-6 w-6 -translate-y-1/2 text-center">
                  <FontAwesomeIcon icon={faAngleRight} />
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
