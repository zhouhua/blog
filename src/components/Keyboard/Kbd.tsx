import clsx from 'clsx';
import type { FC, PropsWithChildren, HTMLAttributes } from 'react';

const Kbd: FC<PropsWithChildren<HTMLAttributes<HTMLElement>>> = ({
  children,
  className,
  ...props
}) => (
  <kbd
    className={clsx(
      'colorModeTransition',
      'mx-0.5 my-0 inline-block h-6 min-w-[24px] p-0.5 pt-[3px] leading-4',
      'border-palette-gray/80 rounded border border-b-2 border-solid',
      'text-palette-gray text-center font-monospace text-base',
      className,
    )}
    {...props}
  >
    {children}
  </kbd>
);
export default Kbd;
