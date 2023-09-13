import type { FC } from 'react';
import clsx from 'clsx';
import Section from '@components/Section';
import useSiteMetadata from '@hooks/useSiteMetaData';

const Footer: FC = () => {
  const { title } = useSiteMetadata();

  return (
    <>
      <div
        className={clsx(
          'pointer-events-none absolute bottom-0 left-0 z-0 h-[590px] w-full min-w-[360px]',
          'bg-gradient-to-b from-gradientFrom to-gradientTo dark:from-dark-gradientFrom dark:to-dark-gradientTo',
          'colorModeTransition'
        )}
      />
      <Section narrow>
        <div className="colorModeTransition relative mx-auto mb-[50px] mt-[140px] border-[1px] border-solid border-horizontalRule dark:border-dark-horizontalRule sm:hidden md:mx-auto md:my-[60px]" />
        <div className="colorModeTransition relative flex items-center justify-between pb-20 text-primary dark:text-dark-primary sm:pb-[50px] md:flex-col md:pb-[100px]">
          <div className="sm:mx-auto sm:mb-[100px] sm:mt-[120px] md:mb-20">
            ©2012 - 2023 {title}
          </div>
        </div>
      </Section>
    </>
  );
};

export default Footer;
