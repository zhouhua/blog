import type { FC } from 'react';
import { Link } from 'gatsby';
import clsx from 'clsx';
import Image from '@components/Image';
import type { IAuthor } from '../../types';
import * as styles from './index.module.css';

interface AuthorsProps {
  author: IAuthor;
}

const ArticleAuthors: FC<AuthorsProps> = ({ author }) => (
  <Link className={clsx(styles.AuthorLink, 'flex items-center')} to={author.authorsPage}>
    <div
      className={clsx(
        styles.AuthorAvatar,
        'colorModeTransition bg-palette-secondary overflow-hidden sm:hidden'
      )}
    >
      <Image className={styles.RoundedImage} src={author.avatar!} alt="作者头像" />
    </div>
    <strong>{author.name}</strong>
    <span>，&nbsp;</span>
  </Link>
);

export default ArticleAuthors;
