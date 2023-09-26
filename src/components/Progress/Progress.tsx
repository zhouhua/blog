import type { FC } from 'react';
import clsx from 'clsx';
import * as styles from './index.module.css';

const Progress: FC<{ progress: number }> = ({ progress }) => (
  <div className="relative select-none outline-none" tabIndex={-1}>
    <div
      className={clsx(
        styles.Trackline,
        'colorModeTransition relative flex w-px flex-col overflow-hidden bg-palette-secondary/50 opacity-60'
      )}
      aria-hidden="true"
    >
      <div
        className="colorModeTransition absolute -top-full left-0 h-full w-px bg-palette-primary"
        style={{ transform: `translateY(${progress * 100}%)` }}
      />
    </div>
  </div>
);

export default Progress;
