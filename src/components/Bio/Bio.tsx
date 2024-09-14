import type { FC } from 'react';
import clsx from 'clsx';
import Image from '@components/Image';
import type { IAuthor } from '../../types';
import * as styles from './index.module.css';

const Bio: FC<{ author: IAuthor; hideText?: boolean; }> = ({ author, hideText = false }) => (
  <div className={clsx('relative -left-2.5 flex items-center')}>
    <div className={clsx(styles.BioAvatar, styles.RoundedImage, 'relative block h-10 w-10')}>
      <div
        className={clsx(
          styles.BioAvatarInner,
          styles.RoundedImage,
          'mr-4 h-10 w-10 overflow-hidden',
        )}
      >
        <Image className={styles.RoundedImage} src={author.avatar} alt="作者头像" />
      </div>
    </div>
    {!hideText && (
      <p className={clsx(styles.BioText, 'colorModeTransition text-palette-gray text-sm')}>
        {author.bio}
      </p>
    )}
  </div>
);

export default Bio;
