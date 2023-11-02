import type { FC, MouseEvent } from 'react';
import { useEffect } from 'react';
import { bindKey, unbindKey } from '@rwh/keystrokes';
import clsx from 'clsx';
import algoliasearch from 'algoliasearch/lite';
import { Configure, InstantSearch } from 'react-instantsearch';
import { AnimatePresence, motion } from 'framer-motion';
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
      window.gtag('event', 'open_search_box');
    } else {
      document.body.classList.remove('no-scroll');
    }
  }, [show]);
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={clsx(
            styles.mask,
            'fixed left-0 top-0 z-50 h-screen w-screen min-w-[360px]  bg-palette-primary/10 backdrop-blur',
            'px-[10vw] py-[10vh] text-palette-secondary sm:px-[2vw] sm:py-[5vh] md:px-[5vw]'
          )}
          onClick={hide}
        >
          <motion.div
            initial={{ opacity: 0, y: 200 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -200 }}
            className="mx-auto flex min-h-0 w-full max-w-2xl flex-col rounded-lg bg-palette-card"
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Panel;
