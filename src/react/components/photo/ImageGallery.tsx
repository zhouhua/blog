import type { CustomPhotoType } from '@types';
import type { ComponentType, FC } from 'react';
import type { RenderImageProps } from 'react-photo-gallery';
import { cn } from '@lib/utils';
import { motion } from 'framer-motion';
import { useCallback } from 'react';
import Gallery from 'react-photo-gallery';
import { useMedia } from 'use-media';
import styles from './index.module.css';

const sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 500px';

const ImageGallery: FC<{ photos: CustomPhotoType[] }> = ({ photos }) => {
  const isNarrow = useMedia({ maxWidth: '640px' }, false);

  const renderImage = useCallback(
    ({
      margin,
      photo: { alt, count, height, slug, transformed: image, width },
    }: RenderImageProps<CustomPhotoType>) => {
      return (
        <a
          key={image.src}
          className={cn('relative cursor-pointer overflow-hidden', styles.cell)}
          href={`/photo/${slug}`}
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
            !!alt && isNarrow && (
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
          {!(alt && isNarrow) && (
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
    [isNarrow],
  );
  return (
    <div className={cn({ '-m-0.5': isNarrow, '-m-1': !isNarrow })}>
      <Gallery
        margin={isNarrow ? 4 : 8}
        photos={photos.map(item => ({
          ...item,
          sizes,
          src: item.transformed.src,
          srcSet: item.transformed.srcSet.attribute,
        }))}
        direction="row"
        renderImage={renderImage as unknown as ComponentType<RenderImageProps>}
        targetRowHeight={isNarrow ? 180 : 320}
      />
    </div>
  );
};
export default ImageGallery;
