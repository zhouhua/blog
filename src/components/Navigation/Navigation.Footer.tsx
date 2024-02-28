import type { FC } from 'react';
import Section from '@components/Section';
import useSiteMetadata from '@hooks/useSiteMetaData';

const Footer: FC = () => {
  const { title } = useSiteMetadata();
  const year = new Date().getFullYear();

  return (
    <Section narrow>
      <div className="colorModeTransition relative mx-auto mb-[50px] mt-[140px] border-[1px] border-solid border-palette-bgAlt sm:hidden md:mx-auto md:my-[60px]" />
      <div className="colorModeTransition relative flex items-center justify-between pb-20 text-palette-primary sm:pb-[50px] md:flex-col md:pb-[100px]">
        <div className="sm:mx-auto sm:mb-[100px] sm:mt-[120px] md:mb-20">
          Copyright © {year} {title}
        </div>
      </div>
    </Section>
  );
};

export default Footer;
