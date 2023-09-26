import { useRef, type FC } from 'react';
import clsx from 'clsx';
import InnerHTML from 'dangerously-set-html-content';
import mediumZoom from 'medium-zoom';
import { useMount } from 'react-use';
import useColorMode from '@hooks/useColorMode';
import type { IArticle } from '../../types/index';
import * as styles from '../../styles/article.module.css';

const limitOuterType = ['.article-columns', 'table', '.callout', 'blockquote', 'li', 'dd'];
const limitOuterSelector = limitOuterType.map(type => `.${styles.ArticleBody} ${type}`).join(',');

const ArticleContent: FC<{ article: IArticle }> = ({ article }) => {
  const [colorMode] = useColorMode();
  const $main = useRef<HTMLDivElement>(null);
  useMount(() => {
    mediumZoom('.gatsby-resp-image-wrapper picture img', {
      background: colorMode === 'dark' ? 'rgba(17,18,22,0.1)' : 'rgba(250,250,250,0.1)'
    });
    if (!$main.current) {
      return;
    }
    const picturesComtainers = $main.current.querySelectorAll<HTMLSpanElement>(
      '.gatsby-resp-image-wrapper'
    );
    picturesComtainers.forEach(item => {
      const limitOuter = item.closest(limitOuterSelector);
      console.log(limitOuter);
      if (limitOuter) {
        return;
      }
      const picture = item.querySelector('source');
      const width = picture?.getAttribute('srcSet')?.match(/ (\d+)w$/m)?.[1];
      const isWide = width && +width >= 1800;
      if (isWide) {
        item.parentElement?.classList.add(styles.fullImage);
        item.style.maxWidth = `${width}px`;
        item.querySelectorAll('source').forEach(source => source.setAttribute('sizes', '100vw'));
      }
    });
  });
  return (
    <div ref={$main}>
      <InnerHTML
        className={clsx(
          styles.ArticleBody,
          'relative z-10 flex max-w-none flex-col justify-center'
        )}
        html={article.html || ''}
      />
    </div>
  );
};
export default ArticleContent;
