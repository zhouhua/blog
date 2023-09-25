import Meta from '@components/Photo/Meta';
import clsx from 'clsx';
import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { useMedia } from 'react-use';
import Image from '@components/Image';
import LightBoxSection from './LightBoxSection';
import * as styles from './index.module.css';

const PhotoGroupSection: FC<{ photoPost: Queries.photo }> = ({ photoPost }) => {
  const isNarrow = useMedia('(max-width: 1028px)', false);
  const [loaded, setLoaded] = useState<boolean>(false);
  useEffect(() => setLoaded(true), []);
  return (
    <section className="min-w-[360px] max-w-full px-20 sm:px-5 md:px-8 lg:px-8 xl:px-8">
      {loaded && !isNarrow && <LightBoxSection photoPost={photoPost} />}
      {loaded &&
        isNarrow &&
        photoPost.list.map(photo => {
          const exif = photo.picture?.childImageSharp?.fields?.exif || undefined;
          return (
            <div
              key={photo.picture?.childImageSharp?.gatsbyImageData.images.fallback?.src}
              className="mb-12"
            >
              <div
                className={clsx('bg-palette-card relative px-4 pt-4', styles.photoCard, {
                  'pb-[72px]': !!exif,
                  'pb-4': !exif
                })}
              >
                <Image src={photo.picture!} alt={photo.description} />
                <Meta exif={exif} />
              </div>
              <p className="text-palette-primary mb-10 px-4 py-10">{photo.description}</p>
            </div>
          );
        })}
    </section>
  );
};

export default PhotoGroupSection;
