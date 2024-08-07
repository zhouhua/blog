import clsx from 'clsx';
import type { FC, PropsWithChildren } from 'react';

const Section: FC<PropsWithChildren & { narrow: boolean; className?: string }> = ({
  narrow,
  children,
  className
}) => (
  <section
    className={clsx(
      'mx-auto my-0 w-full min-w-[360px] max-w-[1220px] px-10 py-0',
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
