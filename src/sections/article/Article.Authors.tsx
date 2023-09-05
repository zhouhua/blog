import type { FC } from 'react';
import React from 'react';
import { Link } from 'gatsby';
import clsx from 'clsx';
import Image from '@components/Image';
import type { IAuthor } from '../../types';
import * as styles from './index.module.css';

interface AuthorsProps {
  author: IAuthor;
}
/**
 * Novela supports multiple authors and therefore we need to ensure
 * we render the right UI when there are varying amount of authors.
 */
const ArticleAuthors: FC<AuthorsProps> = ({ author }) => (
  <Link className={clsx(styles.AuthorLink, 'flex items-center')} to={author.authorsPage}>
    <div
      className={clsx(
        styles.AuthorAvatar,
        'colorModeTransition overflow-hidden bg-grey dark:bg-dark-grey sm:hidden'
      )}
    >
      <Image className={styles.RoundedImage} src={author.avatar!} alt="作者头像" />
    </div>
    <strong>{author.name}</strong>
    <span className="sm:hidden">，&nbsp;</span>
  </Link>
);

export default ArticleAuthors;
