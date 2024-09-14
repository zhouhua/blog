import Image from '@components/Image';
import { Icon } from '@iconify/react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { Link } from 'gatsby';
import type { ComponentType, FC } from 'react';
import { useCallback, useEffect, useState } from 'react';
import type { PhotoProps, RenderImageProps } from 'react-photo-gallery';
import Gallery from 'react-photo-gallery';
import { useMedia } from 'react-use';
import 'yet-another-react-lightbox/styles.css';
import * as styles from './index.module.css';
import type { CustomPhotoType } from '../../types/index';

const sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 500px';

const ImageGallery: FC<{ photos: PhotoProps<CustomPhotoType>[]; }> = ({ photos }) => {
  const isNarrow = useMedia('(max-width: 640px)', false);
  const [loaded, setLoaded] = useState<boolean>(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  const renderImage = useCallback(
    ({
      photo: { image, alt, width, height, count, slug },
      margin,
    }: RenderImageProps<CustomPhotoType>) => {
      image.gatsbyImageData.images.fallback!.sizes = sizes;
      image.gatsbyImageData.images.sources?.forEach(source => {
        source.sizes = sizes;
      });
      return (
        <Link
          key={image.gatsbyImageData.images.fallback?.src}
          style={{
            margin,
            width: `${width}px`,
            height: `${height}px`,
          }}
          to={slug}
          className={clsx('relative cursor-pointer overflow-hidden', styles.cell)}
        >
          <Image src={image} alt={alt!} className="h-full w-full" />
          {!!alt && loaded && isNarrow
            ? (
                <div
                  className={clsx(
                    { [styles.fullMask]: !!count, [styles.mask]: !count },
                    'absolute left-0 top-0 h-full w-full p-3 text-palette-bg',
                    'flex items-end',
                  )}
                >
                  <div className="relative w-full text-sm">
                    <span>{alt}</span>
                  </div>
                  {(count || 0) > 0 && (
                    <span className="absolute right-3 top-2">
                      {count}
                      <Icon icon="fa6-solid:image" className="ml-1" />
                    </span>
                  )}
                </div>
              )
            : (
                <motion.div
                  className={clsx(
                    { [styles.fullMask]: !!count, [styles.mask]: !count },
                    'absolute left-0 top-0 h-full w-full p-3 text-palette-bg',
                    'flex items-end pb-96 opacity-0',
                  )}
                  whileHover={{ opacity: 1, paddingBottom: '12px' }}
                >
                  <div className="relative w-full text-sm">
                    <span>{alt}</span>
                  </div>
                  {' '}
                  {(count || 0) > 0 && (
                    <span className="absolute right-3 top-2">
                      {count}
                      <Icon icon="fa6-solid:image" className="ml-3" />
                    </span>
                  )}
                </motion.div>
              )}
        </Link>
      );
    },
    [photos, loaded, isNarrow],
  );
  return loaded
    ? (
        <div className={clsx({ '-m-1': !isNarrow, '-m-0.5': isNarrow })}>
          <Gallery
            photos={photos}
            renderImage={renderImage}
            margin={isNarrow ? 4 : 8}
            targetRowHeight={isNarrow ? 180 : 320}
          />
        </div>
      )
    : null;
};
export default ImageGallery;
