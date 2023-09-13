import type { FC } from 'react';
import { useRef, useState, useEffect } from 'react';
import { throttle } from 'lodash';
import type { PageProps } from 'gatsby';
import Giscus from '@giscus/react';
import Layout from '@components/Layout';
import Progress from '@components/Progress';
import Section from '@components/Section';
import { debounce } from '@utils';
import useColorMode from '@hooks/useColorMode';
import ArticleAside from '../sections/article/Article.Aside';
import type { IArticle, IAuthor } from '../types/index';
import ArticleHero from '../sections/article/Article.Hero';
import ArticlesNext from '../sections/article/Article.Next';
import ArticleSEO from '../sections/article/Article.SEO';
import ArticleContent from '../sections/article/Article.Content';
import ArticleFooter from './article.footer.template';
import * as styles from './index.module.css';

const Article: FC<PageProps<object, { article: IArticle; author: IAuthor; next: IArticle[] }>> = ({
  pageContext,
  location
}) => {
  const contentSectionRef = useRef<HTMLDivElement>(null);
  const [hasCalculated, setHasCalculated] = useState<boolean>(false);
  const [contentHeight, setContentHeight] = useState<number>(0);
  const { article, author, next } = pageContext;
  const [colorMode] = useColorMode();

  useEffect(() => {
    const calculateBodySize = throttle(() => {
      const contentSection = contentSectionRef.current;
      if (!contentSection) {
        return;
      }

      /**
       * If we haven't checked the content's height before,
       * we want to add listeners to the content area's
       * imagery to recheck when it's loaded
       */
      if (!hasCalculated) {
        const debouncedCalculation = debounce(calculateBodySize);
        const $imgs = contentSection.querySelectorAll('img');

        $imgs.forEach($img => {
          // If the image hasn't finished loading then add a listener
          if (!$img.complete) {
            $img.onload = debouncedCalculation;
          }
        });

        // Prevent rerun of the listener attachment
        setHasCalculated(true);
      }

      // Set the height and offset of the content area
      setContentHeight(contentSection.getBoundingClientRect().height);
    }, 20);

    calculateBodySize();
    window.addEventListener('resize', calculateBodySize);

    return () => window.removeEventListener('resize', calculateBodySize);
  }, []);

  return (
    <Layout isDetailPage>
      <ArticleSEO article={article} author={author} location={location} />
      <ArticleHero article={article} author={author} />
      {!!article.frontmatter.hero && (
        <ArticleAside contentHeight={contentHeight}>
          <Progress contentHeight={contentHeight} />
        </ArticleAside>
      )}
      <article className="relative" ref={contentSectionRef}>
        <ArticleContent article={article} />
      </article>
      <Section
        narrow
        className="relative z-10 mb-32 mt-10 border-t border-solid border-horizontalRule pt-10 dark:border-dark-horizontalRule"
      >
        <Giscus
          repo="zhouhua/blog-comment"
          repoId="MDEwOlJlcG9zaXRvcnkxMjQwOTQzNzk="
          category="Announcements"
          categoryId="DIC_kwDOB2WHq84CZHl_"
          mapping="title"
          strict="0"
          reactionsEnabled="1"
          emitMetadata="0"
          inputPosition="top"
          theme={`${colorMode}_protanopia`}
          lang="zh-CN"
          loading="lazy"
        />
      </Section>
      <ArticleFooter />
      {(next || []).length > 0 && (
        <Section className="block" narrow>
          <h3 className={styles.lineTitle}>看看其他的文章</h3>
          <ArticlesNext articles={next} />
          <div className="mb-[65px]" />
        </Section>
      )}
    </Layout>
  );
};

export default Article;
