import type { FC } from 'react';
import { useRef, useState, useEffect } from 'react';
import type { PageProps } from 'gatsby';
import Layout from '@components/Layout';
import Progress from '@components/Progress';
import Section from '@components/Section';
import { useScroll } from 'framer-motion';
import Comment from '@components/Comment';
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
  const { article, author, next } = pageContext;
  const [progress, setProgress] = useState<number>(0);
  const { scrollYProgress } = useScroll({
    target: contentSectionRef,
    offset: ['start 60%', 'end 40%']
  });
  useEffect(() => {
    scrollYProgress.on('change', e => {
      console.log(e);
      setProgress(e);
    });
  }, [scrollYProgress]);

  return (
    <Layout isDetailPage>
      <ArticleSEO article={article} author={author} location={location} />
      <ArticleHero article={article} author={author} />
      {!!article.frontmatter.hero && (
        <ArticleAside show={progress > 0 && progress < 1}>
          <Progress progress={progress} />
        </ArticleAside>
      )}
      <article className="relative" ref={contentSectionRef}>
        <ArticleContent article={article} />
      </article>
      <Comment />
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
