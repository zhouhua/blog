import { Link, navigate } from 'gatsby';
import type { HeadFC, PageProps } from 'gatsby';
import type { FC } from 'react';
import { useEffect, useState } from 'react';
import Layout from '@components/Layout';
import SEO from '@components/SEO';
import Section from '@components/Section';
import clsx from 'clsx';
import useSiteMetadata from '@hooks/useSiteMetaData';
import { sampleSize } from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAnglesRight } from '@fortawesome/free-solid-svg-icons';
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
  const [randomPostsPairs, setPairList] = useState<[IArticle, IArticle][]>([]);
  useEffect(() => {
    const sampledList = sampleSize(featuredArticles, 5);
    const pairs: [IArticle, IArticle][] = [];
    while (sampledList.length) {
      pairs.push(sampledList.splice(0, 2) as [IArticle, IArticle]);
    }
    setPairList(pairs);
  }, [featuredArticles]);
  return (
    <Layout>
      <SEO pathname={location.pathname} isBlogPost={false} title={title} />
      <ArticlesHero showLayout={false} />
      <Section narrow>
        <h3 className={clsx(styles.lineTitle, 'mt-20')}>精选文章</h3>
        {randomPostsPairs.map((ap, index) => {
          const isEven = index % 2 !== 0;
          return (
            <ArticlePair
              articles={ap}
              gridLayout="tiles"
              reverse={isEven}
              key={ap[0].fields.slug}
              showAllLink={index === randomPostsPairs.length - 1}
            />
          );
        })}
      </Section>
      <Section narrow>
        <h3 className={clsx(styles.lineTitle, 'mt-20')}>最新随笔</h3>
        <ul className="relative z-10 columns-2 gap-x-6 sm:columns-1">
          {newestJournals.map(journal => (
            // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
            <li
              className={clsx(
                articleStyles.ArticleBody,
                styles.journalCard,
                'relative z-10 max-w-none justify-center',
                'colorModeTransition break-inside-avoid-column'
              )}
              key={journal.fields.slug}
              onClick={() => navigate(journal.fields.slug)}
            >
              <article
                className={clsx(
                  styles.fade,
                  'bg-palette-card relative rounded-2xl px-10 pb-2 pt-12 sm:pt-8 md:px-8',
                  'colorModeTransition  max-h-[640px]  overflow-hidden'
                )}
                dangerouslySetInnerHTML={{ __html: journal.html! }}
              />
            </li>
          ))}
          <li
            className={clsx('text-palette-primary colorModeTransition break-inside-avoid-column')}
          >
            <Link
              className={clsx(
                styles.journalCard,
                'bg-palette-card flex h-32 w-full items-center justify-center rounded-2xl',
                'colorModeTransition  max-h-[640px]  overflow-hidden'
              )}
              to="/journals"
            >
              查看更多随笔 <FontAwesomeIcon icon={faAnglesRight} className="ml-4" />
            </Link>
          </li>
        </ul>
      </Section>
      <Section narrow>
        <div className="text-palette-secondary relative z-10 py-20 text-right">
          这里收集了 {articleNumber} 篇文章和 {journalNumber} 篇小随笔，合计{' '}
          {(totalWordCount / 10000).toFixed(2)} 万字
        </div>
      </Section>
    </Layout>
  );
};

export default Index;

export const Head: HeadFC = () => <title>周骅的博客</title>;
