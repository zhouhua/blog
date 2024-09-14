import type { FC } from 'react';
import clsx from 'clsx';
import { Icon } from '@iconify/react';
import * as styles from './index.module.css';

const ProjectHeader: FC<{ title: string; description?: string; }> = ({ title, description }) => {
  return (
    <header className={clsx(styles.Header, 'relative z-10')}>
      <h1 className={styles.HeroHeading}>{title}</h1>
      {description && (
        <div className="leading-6 text-palette-secondary/80">
          <Icon icon="maki:information" className="mr-2" />
          {description}
        </div>
      )}
    </header>
  );
};

export default ProjectHeader;
