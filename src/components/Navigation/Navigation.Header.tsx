import { useState, type FC, type MouseEvent, useEffect } from 'react';
import { Link } from 'gatsby';
import clsx from 'clsx';
import useColorMode from '@hooks/useColorMode';
import Section from '@components/Section';
import Logo from '@components/Logo';
import useSiteMetadata from '@hooks/useSiteMetaData';
import { Icon } from '@iconify/react';
import { StaticImage } from 'gatsby-plugin-image';
import { useMedia } from 'react-use';
import * as styles from './index.module.css';
import { SearchButton } from '../Search';
import MenuIcon from './MenuIcon';
import { motion } from 'framer-motion';

const iconMap: Record<string, string> = {
  'pen-fancy': 'fa6-solid:pen-fancy',
  'message': 'fa6-solid:message',
  'address-card': 'fa6-solid:address-card',
  'image': 'fa6-solid:image',
  'project': 'fa6-solid:code'
};

const animations = {
  open: { opacity: 1, y: 0, height: 'auto' },
  close: { opacity: 0, y: '-100%', height: 0 }
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
          'border-[2px] border-palette-primary dark:border-[4px]',
          'bg-palette-primary',
          'scale-100 dark:scale-[0.55]',
          'overflow-hidden dark:overflow-visible'
        )}
      />
      <div
        className={clsx(
          styles.MoonMask,
          'absolute -top-2 h-6 w-6 border-0 bg-palette-bg',
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
  const isNarrow = useMedia('(max-width: 480px)', false);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    setFill(colorMode === 'dark' ? '#fff' : '#000');
  }, [colorMode]);

  return (
    <Section narrow className="!sticky -top-16 z-[100] backdrop-blur-md sm:-top-10">
      <div
        className={clsx(
          styles.NavContainer,
          'relative z-20 flex items-center justify-between pt-16 sm:items-center sm:pt-10 md:items-center'
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
            'flex max-w-2xl grow-[2] justify-around px-10 sm:px-2 md:px-2 lg:px-2',
            { hidden: isNarrow }
          )}
        >
          {menu.map(({ name, path, icon }) => (
            <Link
              className={clsx(
                'colorModeTransition px-4 py-2 text-palette-primary underline-offset-4 hover:underline sm:px-2 md:px-2',
                'sm:flex sm:flex-col md:flex md:flex-col lg:flex lg:flex-col lg:py-0'
              )}
              key={path}
              to={path}
            >
              <Icon
                icon={iconMap[icon]!}
                inline
                className="mr-2 h-4 w-4 opacity-60 sm:mb-2 sm:mr-0 sm:h-5 sm:w-5 md:mb-2 md:mr-0 md:h-6 md:w-6 lg:mr-1"
              />
              <span className="sm:text-xs md:text-sm">{name}</span>
            </Link>
          ))}
        </div>
        <div className="relative flex items-center sm:right-[-5px]">
          <SearchButton />
          <DarkModeToggle />
          {isNarrow && (
            <div
              onClick={() => setIsOpen(!isOpen)}
              className="h-10 w-10 text-palette-primary opacity-50"
            >
              <MenuIcon isOpen={isOpen} />
            </div>
          )}
        </div>
      </div>
      {isNarrow && (
        <motion.div
          animate={isOpen ? 'open' : 'close'}
          variants={animations}
          transition={{ ease: 'easeInOut' }}
          className="flex flex-col items-center"
        >
          {menu.map(({ name, path, icon }) => (
            <Link
              className={clsx(
                'my-2 flex h-10 w-full items-center justify-center text-lg hover:bg-palette-bgRevert/10',
                'colorModeTransition rounded-lg text-palette-primary'
              )}
              key={path}
              to={path}
            >
              <Icon icon={iconMap[icon]!} inline className="mr-9 h-4 w-4 opacity-60" />
              <div className="w-14">{name}</div>
            </Link>
          ))}
        </motion.div>
      )}
    </Section>
  );
};

export default NavigationHeader;
