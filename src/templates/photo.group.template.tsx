import { useMemo, type FC } from 'react';
import type { PageProps } from 'gatsby';
import SEO from '@components/SEO';
import Layout from '@components/Layout';
import Comment from '@components/Comment';
import Section from '@components/Section';
import type { PhotoProps } from 'react-photo-gallery';
import ImageGallery from '@components/Photo/ImageGallery';
import { shuffle, take } from 'lodash';
import type { CustomPhotoType, IAuthor } from '../types/index';
import ArticleHero from '../sections/article/Article.Hero';
import * as styles from './index.module.css';
import PhotoGroupSection from '../sections/photo/PhotoGroupSection';

const PhotosPage: FC<
  PageProps<
    object,
    { photoPost: Queries.photo; author: IAuthor; featuredList: PhotoProps<CustomPhotoType>[] }
  >
> = ({ location, pageContext }) => {
  const { photoPost, author, featuredList } = pageContext;
  const extraList = useMemo<PhotoProps<CustomPhotoType>[]>(
    () => take(shuffle(featuredList), 16),
    [featuredList]
  );

  return (
    <Layout>
      <SEO pathname={location.pathname} isBlogPost={false} title={`照片-${photoPost.title}`} />
      <ArticleHero photo={photoPost} author={author} />
      <PhotoGroupSection photoPost={photoPost} />
      <Comment />
      {extraList.length > 0 && (
        <Section className="block" narrow>
          <h3 className={styles.lineTitle}>看看更多照片</h3>
          <ImageGallery photos={extraList} />
          <div className="mb-[65px]" />
        </Section>
      )}
    </Layout>
  );
};

export default PhotosPage;
