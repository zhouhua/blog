import { useLayoutEffect, type FC, type PropsWithChildren } from 'react';
import NavigationFooter from '@components/Navigation/Navigation.Footer';
import NavigationHeader from '@components/Navigation/Navigation.Header';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import useColorMode from '@hooks/useColorMode';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssVarsProvider, extendTheme } from '@mui/material-next/styles';
import * as styles from './index.module.css';
import ArticlesContextProvider from '../../sections/articles/Articles.List.Context';
/**
 * <Layout /> needs to wrap every page as it provides styles, navigation,
 * and the main structure of each page. Within Layout we have the <Container />
 * which hides a lot of the mess we need to create our Desktop and Mobile experiences.
 */
const Layout: FC<PropsWithChildren & { isDetailPage?: boolean }> = ({
  children,
  isDetailPage = false
}) => {
  const [mode] = useColorMode();
  return (
    <ThemeProvider
      theme={createTheme({
        palette: {
          mode
        }
      })}
    >
      <CssVarsProvider theme={extendTheme()}>
        <ArticlesContextProvider>
          <div
            className={clsx(
              'colorModeTransition overflow-overlay relative h-screen min-w-[360px] bg-palette-bg',
              'flex flex-col',
              { [styles.cardView]: isDetailPage }
            )}
            style={{ overflowY: 'scroll' }}
          >
            <NavigationHeader />
            <motion.main
              className="flex-grow"
              initial={{ opacity: 0, x: -200 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 200 }}
              transition={{
                type: 'tween',
                mass: 0.35,
                stiffness: 75,
                duration: 0.4
              }}
            >
              {children}
            </motion.main>
            <NavigationFooter />
          </div>
        </ArticlesContextProvider>
      </CssVarsProvider>
    </ThemeProvider>
  );
};

export default Layout;
