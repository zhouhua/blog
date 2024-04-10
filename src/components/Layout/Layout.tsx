import { useEffect, type FC, type PropsWithChildren, useState } from 'react';
import NavigationFooter from '@components/Navigation/Navigation.Footer';
import NavigationHeader from '@components/Navigation/Navigation.Header';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import useColorMode from '@hooks/useColorMode';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssVarsProvider, extendTheme } from '@mui/material-next/styles';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';
import 'dayjs/locale/en';
import TypesafeI18n, { useI18nContext } from '@i18n/i18n-react';
import type { Locales } from '@i18n/i18n-types';
import { detectLocale, navigatorDetector, queryStringDetector } from 'typesafe-i18n/detectors';
import { loadLocaleAsync } from '@i18n/i18n-util.async';
import ArticlesContextProvider from '../../sections/articles/Articles.List.Context';
import * as styles from './index.module.css';

dayjs.extend(relativeTime);
/**
 * <Layout /> needs to wrap every page as it provides styles, navigation,
 * and the main structure of each page. Within Layout we have the <Container />
 * which hides a lot of the mess we need to create our Desktop and Mobile experiences.
 */
const Layout: FC<PropsWithChildren & { isDetailPage?: boolean }> = ({
  children,
  isDetailPage = false,
}) => {
  const { locale, setLocale } = useI18nContext();
  useEffect(() => {
    console.log('layout locale', locale);
    if (locale === 'en') {
      dayjs.locale('en');
    } else {
      dayjs.locale('zh-cn');
    }
  }, [locale]);
  const [mode] = useColorMode();
  const [wasLoaded, setWasLoaded] = useState(false);
  const [detectedLocale, setDetectedLocale] = useState<Locales>();
  useEffect(() => {
    const preset: Locales = detectLocale(
      'zh',
      ['zh', 'en'],
      queryStringDetector,
      navigatorDetector,
    );
    console.log('detectLocale', preset);
    setDetectedLocale(preset);
    // setLocale(preset);
    loadLocaleAsync(preset).then(() => setWasLoaded(true));
  }, []);

  if (!wasLoaded) {
    return <div />;
  }
  return (
    <TypesafeI18n locale={detectedLocale!}>
      <ThemeProvider
        theme={createTheme({
          palette: {
            mode,
          },
        })}
      >
        <CssVarsProvider theme={extendTheme()}>
          <ArticlesContextProvider>
            <div
              className={clsx(
                'colorModeTransition overflow-overlay relative h-screen min-w-[360px] bg-palette-bg',
                'flex flex-col',
                { [styles.cardView]: isDetailPage },
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
                  duration: 0.4,
                }}
              >
                {children}
              </motion.main>
              <NavigationFooter />
            </div>
          </ArticlesContextProvider>
        </CssVarsProvider>
      </ThemeProvider>
    </TypesafeI18n>
  );
};

export default Layout;
