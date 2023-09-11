import { Link, type HeadFC, type PageProps } from 'gatsby';
import { useMemo, type FC, Suspense } from 'react';
import Layout from '@components/Layout';
import SEO from '@components/SEO';
import Section from '@components/Section';
import clsx from 'clsx';
import useSiteMetadata from '@hooks/useSiteMetaData';
import { sampleSize } from 'lodash';
import ArticlesHero from '../sections/articles/Articles.Hero';
import * as styles from './index.module.css';
import type { IArticle } from '../types/index';
import ArticlePair from '../sections/articles/Articles.Pair';
import * as articleStyles from '../styles/article.module.css';

type PageContentType = {
  articleNumber: number;
  journalNumber: number;
  totalWordCount: number;
  featuredArticles: IArticle[];
  newestJournals: IArticle[];
};

const Index: FC<PageProps<object, PageContentType>> = ({
  location,
  pageContext: { articleNumber, journalNumber, totalWordCount, featuredArticles, newestJournals }
}) => {
  const { title } = useSiteMetadata();
  const randomPostsPairs = useMemo(() => {
    const sampledList = sampleSize(featuredArticles, 5);
    const pairs: [IArticle, IArticle][] = [];
    while (sampledList.length) {
      pairs.push(sampledList.splice(0, 2) as [IArticle, IArticle]);
    }
    return pairs;
  }, [featuredArticles]);
  return (
    <Layout>
      <SEO pathname={location.pathname} isBlogPost={false} title={title} />
      <ArticlesHero showLayout={false} />
      <Suspense>
        <Section narrow>
          <h3 className={clsx(styles.lineTitle, 'mt-20')}>精选文章</h3>
          {randomPostsPairs.map((ap, index) => {
            const isEven = index % 2 !== 0;
            return (
              <ArticlePair
                articles={ap}
                gridLayout="tiles"
                reverse={isEven}
                key={ap[0].id}
                showAllLink={index === randomPostsPairs.length - 1}
              />
            );
          })}
        </Section>
      </Suspense>
      <Section narrow>
        <h3 className={clsx(styles.lineTitle, 'mt-20')}>最新随笔</h3>
        <ul className="relative z-10 columns-2 gap-x-6 sm:columns-1">
          {newestJournals.map(journal => (
            <Link to={journal.fields.slug} key={journal.fields.slug}>
              <li
                className={clsx(
                  articleStyles.ArticleBody,
                  styles.journalCard,
                  'relative z-10 justify-center',
                  'prose prose-stone max-w-none dark:prose-invert',
                  'prose-code:before:content-[unset] prose-code:after:content-[unset]',
                  'colorModeTransition break-inside-avoid-column'
                )}
              >
                <article
                  className={clsx(
                    styles.fade,
                    'relative rounded-2xl bg-card px-10 pb-2 pt-12 dark:bg-card/10 sm:pt-8 md:px-8',
                    'colorModeTransition  max-h-[640px]  overflow-hidden'
                  )}
                  dangerouslySetInnerHTML={{ __html: journal.html! }}
                />
              </li>
            </Link>
          ))}
          <li
            className={clsx(
              'text-primary dark:text-dark-primary',
              'colorModeTransition break-inside-avoid-column'
            )}
          >
            <Link
              className={clsx(
                styles.journalCard,
                'flex h-32 w-full items-center justify-center rounded-2xl bg-card dark:bg-card/10',
                'colorModeTransition  max-h-[640px]  overflow-hidden'
              )}
              to="/journals"
            >
              查看更多随笔 <i className="fa-solid fa-angles-right ml-4" />
            </Link>
          </li>
        </ul>
      </Section>
      <Section narrow>
        <div className="relative z-10 py-20 text-right text-secondary dark:text-dark-secondary">
          这里收集了 {articleNumber} 篇文章和 {journalNumber} 篇小随笔，合计{' '}
          {(totalWordCount / 10000).toFixed(2)} 万字
        </div>
      </Section>
    </Layout>
  );
};

export default Index;

export const Head: HeadFC = () => <title>周骅的博客</title>;
