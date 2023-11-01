import { Link, navigate } from 'gatsby';
import type { HeadFC, PageProps } from 'gatsby';
import type { FC } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import Layout from '@components/Layout';
import SEO from '@components/SEO';
import Section from '@components/Section';
import clsx from 'clsx';
import useSiteMetadata from '@hooks/useSiteMetaData';
import { sampleSize, shuffle, take } from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAnglesRight } from '@fortawesome/free-solid-svg-icons';
import type { PhotoProps } from 'react-photo-gallery';
import ImageGallery from '@components/Photo/ImageGallery';
import { useMount } from 'react-use';
import { annotate } from 'rough-notation';
import ArticlesHero from '../sections/articles/Articles.Hero';
import * as styles from './index.module.css';
import type { CustomPhotoType, IArticle } from '../types/index';
import ArticlePair from '../sections/articles/Articles.Pair';
import * as articleStyles from '../styles/article.module.css';

type PageContentType = {
  articleNumber: number;
  journalNumber: number;
  totalWordCount: number;
  photoNumber: number;
  allPhotoCount: number;
  allFeaturedImage: PhotoProps<CustomPhotoType>[];
  featuredArticles: IArticle[];
  newestJournals: IArticle[];
};

const Index: FC<PageProps<object, PageContentType>> = ({
  location,
  pageContext: {
    totalWordCount,
    articleNumber,
    photoNumber,
    journalNumber,
    allPhotoCount,
    allFeaturedImage,
    featuredArticles,
    newestJournals
  }
}) => {
  const { title } = useSiteMetadata();
  const $notes = useRef<HTMLUListElement>(null);
  const [randomPostsPairs, setPairList] = useState<[IArticle, IArticle][]>([]);
  useEffect(() => {
    const sampledList = sampleSize(featuredArticles, 5);
    const pairs: [IArticle, IArticle][] = [];
    while (sampledList.length) {
      pairs.push(sampledList.splice(0, 2) as [IArticle, IArticle]);
    }
    setPairList(pairs);
  }, [featuredArticles]);
  const shuffledImageList = useMemo(() => take(shuffle(allFeaturedImage), 50), [allFeaturedImage]);
  useMount(() => {
    if ($notes.current) {
      const callouts = $notes.current.querySelectorAll<HTMLDivElement>('.callout');
      callouts.forEach(callout =>
        annotate(callout, {
          type: 'box',
          color: 'rgb(var(--color-bg-alt))',
          strokeWidth: 1,
          padding: 0
        }).show()
      );
      const blockquates = $notes.current.querySelectorAll<HTMLDivElement>('blockquote');
      blockquates.forEach(blockquote =>
        annotate(blockquote, {
          type: 'bracket',
          color: 'rgb(var(--color-bg-alt))',
          strokeWidth: 3,
          brackets: ['left'],
          padding: 2
        }).show()
      );
    }
  });
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
        <ul className="relative z-10 columns-2 gap-x-6 sm:columns-1" ref={$notes}>
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
                  'relative rounded-2xl bg-palette-card px-10 pb-2 pt-12 sm:pt-8 md:px-8',
                  'colorModeTransition  max-h-[640px]  overflow-hidden'
                )}
                dangerouslySetInnerHTML={{ __html: journal.html! }}
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
        <h3 className={clsx(styles.lineTitle, 'mt-20')}>精彩照片</h3>
      </Section>
      <section className="min-w-[360px] max-w-full px-20 sm:px-5 md:px-8 lg:px-8 xl:px-8">
        <ImageGallery
          key={shuffledImageList.map(item => item.slug).join()}
          photos={shuffledImageList}
        />
      </section>
      <Section narrow>
        <div className="relative z-10 py-24 text-center text-palette-secondary">
          这里收集了 {articleNumber} 篇文章、 {journalNumber} 篇小随笔和 {photoNumber}{' '}
          个照片集，合计 {(totalWordCount / 10000).toFixed(2)} 万字和 {allPhotoCount} 张照片
        </div>
      </Section>
    </Layout>
  );
};

export default Index;

export const Head: HeadFC = () => <title>周骅的博客</title>;
