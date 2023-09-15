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

import { StaticImage } from 'gatsby-plugin-image';
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
          'border-palette-primary border-[2px] dark:border-[4px]',
          'bg-palette-primary',
          'scale-100 dark:scale-[0.55]',
          'overflow-hidden dark:overflow-visible'
        )}
      />
      <div
        className={clsx(
          styles.MoonMask,
          'bg-palette-bg absolute -top-2 h-6 w-6 border-0',
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
          'relative z-20 flex items-end justify-between pt-16 sm:items-center sm:pt-10'
        )}
      >
        <Link
          className={clsx(styles.LogoLink, 'relative flex items-center')}
          to={rootPath}
          data-a11y="false"
          title="导航回首页"
          aria-label="导航回首页"
        >
          <Logo
            fill={fill}
            className={clsx(
              'absolute h-20 w-20 opacity-100 sm:hidden md:h-10 md:w-10',
              styles.logoSvg
            )}
          />
          <StaticImage
            src="../../images/logo.png"
            height={256}
            alt="logo"
            className={clsx(
              'h-20 w-20 opacity-0 sm:h-6 sm:w-6 sm:opacity-100 md:h-10 md:w-10',
              styles.logoPng
            )}
            layout="constrained"
            objectFit="contain"
          />
        </Link>
        <div
          className={clsx(
            styles.menu,
            'flex max-w-2xl grow-[2] justify-around px-10 sm:px-2 md:px-8'
          )}
        >
          {menu.map(({ name, path, icon }) => (
            <Link
              className={clsx(
                'colorModeTransition text-palette-primary px-4 py-2 underline-offset-4 hover:underline sm:px-2 md:px-2',
                'sm:flex sm:flex-col'
              )}
              key={path}
              to={path}
            >
              <FontAwesomeIcon
                icon={iconMap[icon]!}
                className="mr-2 h-4 w-4 opacity-60 sm:mb-2 sm:mr-0 sm:h-6 sm:w-6"
              />
              <span className="sm:text-xs">{name}</span>
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
