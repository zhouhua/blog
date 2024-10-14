import type { CustomPhotoType } from '@types';
import type { ComponentType, FC } from 'react';
import type { RenderImageProps } from 'react-photo-gallery';
import { cn } from '@lib/utils';
import { motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import Gallery from 'react-photo-gallery';
import { useMedia } from 'use-media';
import styles from './index.module.css';

const sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 500px';

const ImageGallery: FC<{ photos: CustomPhotoType[] }> = ({ photos }) => {
  const isNarrow = useMedia({ maxWidth: '640px' }, false);
  const [loaded, setLoaded] = useState<boolean>(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  const renderImage = useCallback(
    ({
      margin,
      photo: { alt, count, height, slug, transformed: image, width },
    }: RenderImageProps<CustomPhotoType>) => {
      return (
        <a
          key={image.src}
          className={cn('relative cursor-pointer overflow-hidden', styles.cell)}
          href={`/photos/${slug}`}
          style={{
            height: `${height}px`,
            margin,
            width: `${width}px`,
          }}
        >
          <img
            alt={alt!}
            className="h-full w-full"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 500px"
            src={image.src}
            srcSet={image.srcSet.attribute}
          />
          {
            !!alt && loaded && isNarrow && (
              <div
                className={cn(
                  { [styles.fullMask!]: !!count, [styles.mask!]: !count },
                  'absolute left-0 top-0 h-full w-full p-3 text-palette-bg',
                  'flex items-end',
                )}
              >
                <div className="relative w-full text-sm">
                  <span>{alt}</span>
                </div>
                {(count || 0) > 0 && (
                  <span className="absolute right-3 top-2 flex items-center">
                    {count}
                    <span className="ml-1 iconify fa6-solid--image" />
                  </span>
                )}
              </div>
            )
          }
          {!(alt && loaded && isNarrow) && (
            <motion.div
              className={cn(
                { [styles.fullMask!]: !!count, [styles.mask!]: !count },
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
                <span className="absolute right-3 top-2 flex items-center">
                  {count}
                  <span className="ml-3 iconify fa6-solid--image" />
                </span>
              )}
            </motion.div>
          )}
        </a>
      );
    },
    [loaded, isNarrow],
  );
  return loaded && (
    <div className={cn({ '-m-0.5': isNarrow, '-m-1': !isNarrow })}>
      <Gallery
        margin={isNarrow ? 4 : 8}
        photos={photos.map(item => ({
          ...item,
          sizes,
          src: item.transformed.src,
          srcSet: item.transformed.srcSet.attribute,
        }))}
        renderImage={renderImage as unknown as ComponentType<RenderImageProps>}
        targetRowHeight={isNarrow ? 180 : 320}
      />
    </div>
  );
};
export default ImageGallery;
