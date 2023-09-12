import { useState, type FC, type MouseEvent, useEffect } from 'react';
import { Link } from 'gatsby';
import clsx from 'clsx';
import useColorMode from '@hooks/useColorMode';
import Section from '@components/Section';
import Logo from '@components/Logo';
import useSiteMetadata from '@hooks/useSiteMetaData';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { faPenFancy, faMessage, faAddressCard } from '@fortawesome/free-solid-svg-icons';

import * as styles from './index.module.css';
import { SearchButton } from '../Search';

const iconMap: Record<string, IconDefinition> = {
  'pen-fancy': faPenFancy,
  'message': faMessage,
  'address-card': faAddressCard
};

const DarkModeToggle: FC = () => {
  const [colorMode, setColorMode] = useColorMode();
  const [isDark, setIsDark] = useState<boolean>(false);

  function toggleColorMode(event: MouseEvent) {
    event.preventDefault();
    const newColorMode: ColorMode = isDark ? 'light' : 'dark';
    setColorMode(newColorMode);
  }

  useEffect(() => {
    setIsDark(colorMode === 'dark');
  }, [colorMode]);

  return (
    <button
      type="button"
      className={styles.IconWrapper}
      onClick={toggleColorMode}
      data-a11y="false"
      aria-label={isDark ? '切换到浅色模式' : '切换到深色模式'}
      title={isDark ? '切换到浅色模式' : '切换到深色模式'}
    >
      <div
        className={clsx(
          styles.MoonOrSun,
          'relative h-6 w-6 border-solid',
          'border-[2px] border-primary dark:border-[4px] dark:border-dark-primary',
          'bg-primary dark:bg-dark-primary',
          'scale-100 dark:scale-[0.55]',
          'overflow-hidden dark:overflow-visible'
        )}
      />
      <div
        className={clsx(
          styles.MoonMask,
          'absolute -top-2 h-6 w-6 border-0 bg-background dark:bg-dark-background',
          '-right-px opacity-100 dark:opacity-0'
        )}
      />
    </button>
  );
};

const rootPath = '/';

const NavigationHeader: FC = () => {
  const { menu } = useSiteMetadata();

  const [colorMode] = useColorMode();
  const [fill, setFill] = useState<string>('#000');
  useEffect(() => {
    setFill(colorMode === 'dark' ? '#fff' : '#000');
  }, [colorMode]);

  return (
    <Section narrow>
      <div
        className={clsx(
          styles.NavContainer,
          'relative z-20 flex justify-between pt-[100px] sm:pt-[50px]'
        )}
      >
        <Link
          className={clsx(styles.LogoLink, 'relative flex items-center')}
          to={rootPath}
          data-a11y="false"
          title="导航回首页"
          aria-label="导航回首页"
        >
          <Logo fill={fill} />
          <div className="invisible absolute inline-block h-0 w-0 overflow-hidden opacity-0">
            导航回首页
          </div>
        </Link>
        <div
          className={clsx(
            styles.menu,
            'flex max-w-2xl grow-[2] justify-around px-10 sm:px-4 md:px-8'
          )}
        >
          {menu.map(({ name, path, icon }) => (
            <Link
              className="colorModeTransition px-4 py-2 text-primary underline-offset-4 hover:underline dark:text-dark-primary md:px-2"
              key={path}
              to={path}
            >
              <FontAwesomeIcon icon={iconMap[icon]!} className="mr-2 h-4 w-4 opacity-60" />
              {name}
            </Link>
          ))}
        </div>
        <div className="relative flex items-center sm:right-[-5px]">
          <SearchButton />
          <DarkModeToggle />
        </div>
      </div>
    </Section>
  );
};

export default NavigationHeader;
