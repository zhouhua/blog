import React, { useEffect, useState } from 'react';
import throttle from 'lodash/throttle';
import clsx from 'clsx';
import { clamp } from '@utils';
import * as styles from './index.module.css';

export interface IProgress {
  contentHeight: number;
}

const Progress: React.FC<IProgress> = ({ contentHeight }) => {
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    const handleScroll = throttle(() => {
      const percentComplete = (window.scrollY / contentHeight) * 100;

      setProgress(clamp(+percentComplete.toFixed(2), -2, 104));
    }, 20);

    if (contentHeight) {
      window.addEventListener('scroll', handleScroll);
      window.addEventListener('resize', handleScroll);
      return () => {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleScroll);
      };
    }
  }, [contentHeight]);

  return (
    <div className="relative select-none outline-none" tabIndex={-1}>
      <div
        className={clsx(
          styles.Trackline,
          'colorModeTransition relative flex w-px flex-col overflow-hidden bg-track opacity-60 dark:bg-dark-track'
        )}
        aria-hidden="true"
      >
        <div
          className="colorModeTransition absolute -top-full left-0 h-full w-px bg-progress dark:bg-dark-progress"
          style={{ transform: `translateY(${progress}%)` }}
        />
      </div>
    </div>
  );
};

export default Progress;
