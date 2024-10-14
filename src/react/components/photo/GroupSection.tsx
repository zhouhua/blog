import type { PhotoImage } from '@types';
import type { FC } from 'react';
import { cn } from '@lib/utils';
import { useEffect, useState } from 'react';
import { useMedia } from 'use-media';
import styles from './index.module.css';
import LightBoxSection from './LightBoxSection';
import Meta from './Meta';

const PhotoGroupSection: FC<{ photoPosts: PhotoImage[] }> = ({ photoPosts }) => {
  const isNarrow = useMedia('(max-width: 1028px)', false);
  const [loaded, setLoaded] = useState<boolean>(false);
  useEffect(() => setLoaded(true), []);
  return (
    <section className="min-w-[360px] max-w-full px-20 sm:px-5 md:px-8 lg:px-8 xl:px-8">
      {loaded && !isNarrow && <LightBoxSection photoPosts={photoPosts} />}
      {loaded && isNarrow && photoPosts.map((photo) => {
        const exif = photo.exif;
        return (
          <div
            key={photo.transformed.src}
            className="mb-12"
          >
            <div
              className={cn('bg-palette-card relative px-4 pt-4', styles.photoCard, {
                'pb-[72px]': !!exif,
                'pb-4': !exif,
              })}
            >
              <img
                alt={photo.title}
                sizes={`(min-width: ${photo.width}px) ${photo.width}px, 100vw`}
                src={photo.transformed.src}
                srcSet={photo.transformed.srcSet.attribute}
              />
              {exif && <Meta exif={exif} />}
            </div>
            <p className="text-palette-primary mb-10 px-4 py-10">{photo.title}</p>
          </div>
        );
      })}
    </section>
  );
};

export default PhotoGroupSection;
