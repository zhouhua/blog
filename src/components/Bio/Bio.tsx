import React from 'react';
import { Link } from 'gatsby';
import clsx from 'clsx';
import Image from '@components/Image';
import type { IAuthor } from '../../types';
import * as styles from './index.module.css';

const Bio: React.FC<{ author: IAuthor }> = ({ author }) => (
  <div className="relative -left-2.5 flex items-center">
    <Link
      className={clsx(styles.BioAvatar, styles.RoundedImage, 'relative block h-10 w-10')}
      to={author.authorsPage}
      data-a11y="false"
      aria-label="Author's bio"
    >
      <div
        className={clsx(
          styles.BioAvatarInner,
          styles.RoundedImage,
          'mr-4 h-10 w-10 overflow-hidden'
        )}
      >
        <Image className={styles.RoundedImage} src={author.avatar!} alt="作者头像" />
      </div>
    </Link>
    <p
      className={clsx(styles.BioText, 'colorModeTransition text-sm text-grey dark:text-dark-grey')}
      dangerouslySetInnerHTML={{ __html: author.bio! }}
    />
  </div>
);

export default Bio;
