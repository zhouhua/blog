import type { FC, HTMLAttributes, PropsWithChildren } from 'react';
import { cn } from '@lib/utils';

const Kbd: FC<PropsWithChildren<HTMLAttributes<HTMLElement>>> = ({
  children,
  className,
  ...props
}) => (
  <kbd
    className={cn(
      'colorModeTransition',
      'mx-0.5 my-0 inline-block h-6 min-w-[24px]',
      'border-palette-gray/80 rounded border border-b-2 border-solid',
      'text-palette-gray text-center font-monospace text-base',
      'inline-flex items-center justify-center',
      className,
    )}
    {...props}
  >
    {children}
  </kbd>
);
export default Kbd;
