import type { FC, MouseEvent } from 'react';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { bindKey, unbindKey } from '@rwh/keystrokes';
import clsx from 'clsx';
import algoliasearch from 'algoliasearch/lite';
import { Configure, InstantSearch } from 'react-instantsearch';
import * as styles from './index.module.css';
import Footer from './Footer';
import Header from './Header';
import Result from './Result';

const searchClient = algoliasearch(
  process.env.GATSBY_ALGOLIA_APP_ID!,
  process.env.GATSBY_ALGOLIA_SEARCH_KEY!
);

const Panel: FC<{ show: boolean; hide: () => void }> = ({ show, hide }) => {
  function makeClickOutside(e: MouseEvent<HTMLDivElement>) {
    e.stopPropagation();
  }
  useEffect(() => {
    const hotkeyHandler = {
      onPressed: hide
    };
    const hideKey = 'Escape';
    bindKey(hideKey, hotkeyHandler);
    return () => {
      unbindKey(hideKey, hotkeyHandler);
    };
  }, [hide]);
  useEffect(() => {
    if (show) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
  }, [show]);
  return (
    show &&
    createPortal(
      <div
        className={clsx(
          styles.mask,
          'fixed left-0 top-0 z-50 h-screen w-screen bg-dark-background/20 backdrop-blur dark:bg-background/20',
          'p-[10vh] text-secondary dark:text-dark-secondary sm:p-6'
        )}
        onClick={hide}
      >
        <div
          className="mx-auto flex min-h-0 w-full max-w-2xl flex-col rounded-lg bg-background dark:bg-dark-background"
          onClick={makeClickOutside}
        >
          <InstantSearch searchClient={searchClient} indexName="blog">
            <Configure
              attributesToRetrieve={['objectID', 'slug', 'title', 'excerpt', 'layout']}
              advancedSyntax
              synonyms
            />
            <Header hide={hide} />
            <Result hide={hide} />
            <Footer />
          </InstantSearch>
        </div>
      </div>,
      document.body
    )
  );
};

export default Panel;
