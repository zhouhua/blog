import clsx from 'clsx';
import type { FC, PropsWithChildren } from 'react';
import React from 'react';

const Section: FC<PropsWithChildren & { narrow: boolean; className?: string }> = ({
  narrow,
  children,
  className
}) => (
  <section
    className={clsx(
      'mx-auto my-0 w-full min-w-[480px] max-w-[1220px] px-10 py-0',
      {
        'sm:px-5': narrow
      },
      className
    )}
  >
    {children}
  </section>
);

export default Section;
