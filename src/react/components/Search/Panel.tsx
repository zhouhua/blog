import type { FC } from 'react';
import { cn } from '@lib/utils';
import { bindKey, unbindKey } from '@rwh/keystrokes';
import { liteClient } from 'algoliasearch/lite';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useRef } from 'react';
import { Configure, InstantSearch } from 'react-instantsearch';
import { useClickAway } from 'react-use';
import Footer from './Footer';
import Header from './Header';
import styles from './index.module.css';
import Result from './Result';

const Panel: FC<{
  show: boolean;
  hide: () => void;
  appId: string;
  appKey: string;
}> = ({ appId, appKey, hide, show }) => {
  const searchClient = useMemo(() => liteClient(
    appId,
    appKey,
  ), [appId, appKey]);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const hotkeyHandler = {
      onPressed: hide,
    };
    const hideKey = 'Escape';
    bindKey(hideKey, hotkeyHandler);
    return () => {
      unbindKey(hideKey, hotkeyHandler);
    };
  }, [hide]);
  useClickAway(ref, hide);
  useEffect(() => {
    if (show) {
      document.body.classList.add('no-scroll');
      // window.gtag('event', 'open_search_box')
    }
    else {
      document.body.classList.remove('no-scroll');
    }
  }, [show]);
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          animate={{ opacity: 1 }}
          className={cn(
            styles.mask,
            'fixed left-0 top-0 z-50 h-screen w-screen min-w-[360px]  bg-palette-primary/10 backdrop-blur',
            'px-[10vw] py-[10vh] text-palette-secondary sm:px-[2vw] sm:py-[5vh] md:px-[5vw]',
          )}
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
        >
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto flex min-h-0 w-full max-w-2xl flex-col rounded-lg bg-palette-card"
            exit={{ opacity: 0, y: -200 }}
            initial={{ opacity: 0, y: 200 }}
            ref={ref}
          >
            <InstantSearch indexName="blog" searchClient={searchClient}>
              <Configure
                advancedSyntax
                synonyms
                attributesToRetrieve={['objectID', 'slug', 'title', 'layout']}
                attributesToSnippet={['text:50']}
                attributesToHighlight={['title']}
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
