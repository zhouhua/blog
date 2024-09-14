import type { FC } from 'react';
import type { PageProps } from 'gatsby';
import Seo from '@components/SEO';
import Layout from '@components/Layout';
import useSiteMetadata from '@hooks/useSiteMetaData';
import type { PhotoProps } from 'react-photo-gallery';
import ImageGallery from '@components/Photo/ImageGallery';
import ArticlesHero from '../sections/articles/Articles.Hero';
import type { CustomPhotoType } from '../types/index';

const PhotosPage: FC<PageProps<object, { photos: PhotoProps<CustomPhotoType>[]; }>> = ({
  location,
  pageContext,
}) => {
  const { title } = useSiteMetadata();
  const { photos } = pageContext;
  return (
    <Layout>
      <Seo pathname={location.pathname} isBlogPost={false} title={title} />
      <ArticlesHero title={`${title} - 所有照片`} description="分享风景、故事与回忆" />
      <section className="min-w-[360px] max-w-full px-20 sm:px-5 md:px-8 lg:px-8 xl:px-8">
        <ImageGallery photos={photos} />
      </section>
    </Layout>
  );
};

export default PhotosPage;
