import type { FC } from 'react';
import React from 'react';
import clsx from 'clsx';
import InnerHTML from 'dangerously-set-html-content';
import mediumZoom from 'medium-zoom';
import { useMount } from 'react-use';
import useColorMode from '@hooks/useColorMode';
import type { IArticle } from '../../types/index';
import * as styles from '../../styles/article.module.css';

const ArticleContent: FC<{ article: IArticle }> = ({ article }) => {
  const [colorMode] = useColorMode();
  useMount(() => {
    mediumZoom('article picture img', {
      background: colorMode === 'dark' ? '#111216' : '#fafafa'
    });
  });
  return (
    <InnerHTML
      className={clsx(
        styles.ArticleBody,
        'relative z-10 flex flex-col justify-center',
        'prose prose-stone max-w-none dark:prose-invert',
        'prose-code:before:content-[unset] prose-code:after:content-[unset]'
      )}
      html={article.html || ''}
    />
  );
};
export default ArticleContent;
