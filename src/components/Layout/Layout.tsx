import type { FC, PropsWithChildren } from 'react';
import NavigationFooter from '@components/Navigation/Navigation.Footer';
import NavigationHeader from '@components/Navigation/Navigation.Header';
import { Script } from 'gatsby';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import * as styles from './index.module.css';
import ArticlesContextProvider from '../../sections/articles/Articles.List.Context';
/**
 * <Layout /> needs to wrap every page as it provides styles, navigation,
 * and the main structure of each page. Within Layout we have the <Container />
 * which hides a lot of the mess we need to create our Desktop and Mobile experiences.
 */
const Layout: FC<PropsWithChildren> = ({ children }) => (
  <ArticlesContextProvider>
    <Script src="/fontawesome-free-6.4.2/js/fontawesome.min.js" />
    <Script src="/fontawesome-free-6.4.2/js/brands.min.js" />
    <Script src="/fontawesome-free-6.4.2/js/solid.min.js" />
    <div className="colorModeTransition relative min-h-screen min-w-[480px] overflow-x-auto bg-background dark:bg-dark-background">
      <NavigationHeader />
      <motion.main
        initial={{ opacity: 0, x: -200 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 200 }}
        transition={{
          type: 'spring',
          mass: 0.35,
          stiffness: 75,
          duration: 0.4
        }}
      >
        {children}
      </motion.main>
      <div className={clsx(styles.Gradient, 'colorModeTransition')} />
      <NavigationFooter />
    </div>
  </ArticlesContextProvider>
);

export default Layout;