import type { FC } from 'react';
import clsx from 'clsx';
import * as styles from './index.module.css';

const Progress: FC<{ progress: number }> = ({ progress }) => {
  let offset = 0;
  if (progress > 0.95) {
    offset = 1;
  } else if (progress > 0.05) {
    offset = (progress - 0.05) / 0.9;
  }
  offset *= 100;
  return (
    <div className="relative select-none outline-none" tabIndex={-1}>
      <div
        className={clsx(
          styles.Trackline,
          'colorModeTransition bg-palette-secondary/50 relative flex w-px flex-col overflow-hidden opacity-60'
        )}
        aria-hidden="true"
      >
        <div
          className="colorModeTransition bg-palette-primary absolute -top-full left-0 h-full w-px"
          style={{ transform: `translateY(${offset}%)` }}
        />
      </div>
    </div>
  );
};

export default Progress;
