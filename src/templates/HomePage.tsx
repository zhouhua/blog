import { Link, navigate } from 'gatsby';
import type { HeadFC, PageProps } from 'gatsby';
import type { FC } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import Layout from '@components/Layout';
import Seo from '@components/SEO';
import Section from '@components/Section';
import clsx from 'clsx';
import useSiteMetadata from '@hooks/useSiteMetaData';
import { sampleSize, shuffle, take } from 'lodash';
import type { PhotoProps } from 'react-photo-gallery';
import ImageGallery from '@components/Photo/ImageGallery';
import { useMount } from 'react-use';
import { annotate } from 'rough-notation';
import { Icon } from '@iconify/react';
import ArticlesHero from '../sections/articles/Articles.Hero';
import * as styles from './index.module.css';
import type { CustomPhotoType, IArticle } from '../types/index';
import ArticlePair from '../sections/articles/Articles.Pair';
import * as articleStyles from '../styles/article.module.css';

interface PageContentType {
  articleNumber: number;
  journalNumber: number;
  articleWordCount: number;
  journalWordCount: number;
  photoNumber: number;
  allPhotoCount: number;
  allFeaturedImage: PhotoProps<CustomPhotoType>[];
  featuredArticles: IArticle[];
  newestJournals: IArticle[];
}

const Index: FC<PageProps<object, PageContentType>> = ({
  location,
  pageContext: {
    articleWordCount,
    journalWordCount,
    articleNumber,
    photoNumber,
    journalNumber,
    allPhotoCount,
    allFeaturedImage,
    featuredArticles,
    newestJournals,
  },
}) => {
  const { title } = useSiteMetadata();
  const $notes = useRef<HTMLUListElement>(null);
  const [randomPostsPairs, setPairList] = useState<[IArticle, IArticle][]>([]);
  useEffect(() => {
    const sampledList = sampleSize(featuredArticles, 5);
    const pairs: [IArticle, IArticle][] = [];
    while (sampledList.length) {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      pairs.push(sampledList.splice(0, 2) as [IArticle, IArticle]);
    }
    setPairList(pairs);
  }, [featuredArticles]);
  const shuffledImageList = useMemo(() => take(shuffle(allFeaturedImage), 50), [allFeaturedImage]);
  useMount(() => {
    if ($notes.current) {
      const callouts = $notes.current.querySelectorAll<HTMLDivElement>('.callout');
      callouts.forEach(callout => {
        annotate(callout, {
          type: 'box',
          color: 'rgb(var(--color-bg-alt))',
          strokeWidth: 1,
          padding: 0,
        }).show();
      },
      );
      const blockquates = $notes.current.querySelectorAll<HTMLDivElement>('blockquote');
      blockquates.forEach(blockquote => {
        annotate(blockquote, {
          type: 'bracket',
          color: 'rgb(var(--color-bg-alt))',
          strokeWidth: 3,
          brackets: ['left'],
          padding: 2,
        }).show();
      },
      );
    }
  });
  return (
    <Layout>
      <Seo pathname={location.pathname} isBlogPost={false} title={title} />
      <ArticlesHero showLayout={false} />
      <Section narrow>
        <h3 className={clsx(styles.lineTitle, 'mt-20')}>精选文章</h3>
        {randomPostsPairs.map((ap, index) => {
          const isEven = index % 2 !== 0;
          return (
            <ArticlePair
              key={ap[0].fields.slug}
              articles={ap}
              gridLayout="tiles"
              reverse={isEven}
              showAllLink={index === randomPostsPairs.length - 1}
            />
          );
        })}
      </Section>
      <Section narrow>
        <h3 className={clsx(styles.lineTitle, 'mt-20')}>最新随笔</h3>
        <ul ref={$notes} className="relative z-10 columns-2 gap-x-6 sm:columns-1">
          {newestJournals.map(journal => (
            <li
              key={journal.fields.slug}
              className={clsx(
                articleStyles.ArticleBody,
                styles.journalCard,
                'relative z-10 max-w-none justify-center',
                'colorModeTransition break-inside-avoid-column',
              )}
              // eslint-disable-next-line @typescript-eslint/no-misused-promises
              onClick={() => navigate(journal.fields.slug)}
            >
              <article
                dangerouslySetInnerHTML={{ __html: journal.html! }}
                className={clsx(
                  styles.fade,
                  'relative rounded-2xl bg-palette-card px-10 pb-2 pt-12 sm:pt-8 md:px-8',
                  'colorModeTransition  max-h-[640px]  overflow-hidden',
                )}
              />
            </li>
          ))}
          <li
            className={clsx('colorModeTransition break-inside-avoid-column text-palette-primary')}
          >
            <Link
              className={clsx(
                styles.journalCard,
                'flex h-32 w-full items-center justify-center rounded-2xl bg-palette-card',
                'colorModeTransition  max-h-[640px]  overflow-hidden',
              )}
              to="/journals"
            >
              查看更多随笔
              <Icon icon="fa6-solid:angles-right" className="ml-4" />
            </Link>
          </li>
        </ul>
      </Section>
      <Section narrow>
        <h3 className={clsx(styles.lineTitle, 'mt-20')}>精彩照片</h3>
      </Section>
      <section className="min-w-[360px] max-w-full">
        <ImageGallery
          key={shuffledImageList.map(item => item.slug).join()}
          photos={shuffledImageList}
        />
      </section>
      <Section narrow className="flex justify-center">
        <div className="stats mt-24 bg-palette-card text-palette-secondary shadow sm:-mx-2 sm:mt-12 sm:text-center">
          <div className="stat border-palette-gray/20 px-8 py-5 sm:p-3">
            <div className="stat-figure ml-2 text-lg sm:hidden">
              <Icon icon="fa6-solid:pen-fancy" />
            </div>
            <div className="stat-title">收录文章</div>
            <div className="stat-value my-1">
              {articleNumber}
              {' '}
              篇
            </div>
            <div className="stat-desc">
              合计
              {(articleWordCount / 10000).toFixed(2)}
              {' '}
              万字
            </div>
          </div>
          <div className="stat border-palette-gray/20 px-8 py-5 sm:p-3">
            <div className="stat-figure ml-2 text-lg sm:hidden">
              <Icon icon="fa6-solid:message" />
            </div>
            <div className="stat-title">收录随笔</div>
            <div className="stat-value my-1">
              {journalNumber}
              {' '}
              篇
            </div>
            <div className="stat-desc">
              合计
              {(journalWordCount / 10000).toFixed(2)}
              {' '}
              万字
            </div>
          </div>
          <div className="stat border-palette-gray/20 px-8 py-5 sm:p-3">
            <div className="stat-figure ml-2 text-lg sm:hidden">
              <Icon icon="fa6-solid:image" />
            </div>
            <div className="stat-title">收录图集</div>
            <div className="stat-value my-1">
              {photoNumber}
              {' '}
              组
            </div>
            <div className="stat-desc">
              合计
              {allPhotoCount}
              {' '}
              张照片
            </div>
          </div>
        </div>
      </Section>
    </Layout>
  );
};

export default Index;

export const Head: HeadFC = () => <title>周骅的博客</title>;
