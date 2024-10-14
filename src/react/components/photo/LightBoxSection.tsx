import type { PhotoImage } from '@types';
import type { FC } from 'react';
import type { SlideImage } from 'yet-another-react-lightbox';
import { useMemo } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import Captions from 'yet-another-react-lightbox/plugins/captions';
import Counter from 'yet-another-react-lightbox/plugins/counter';
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen';
import Inline from 'yet-another-react-lightbox/plugins/inline';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Meta from './Meta';
import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/captions.css';
import 'yet-another-react-lightbox/plugins/counter.css';
import 'yet-another-react-lightbox/plugins/thumbnails.css';

const LightBoxSection: FC<{ photoPosts: PhotoImage[] }> = ({ photoPosts }) => {
  const slides = useMemo<SlideImage[]>(
    () =>
      photoPosts.map(({ height, title, transformed, width }) => {
        return {
          description: title,
          height,
          imageFit: 'contain',
          src: transformed.src,
          title: ' ',
          type: 'image',
          width,
        };
      }),
    [photoPosts],
  );

  return (
    <Lightbox
      carousel={{ padding: 0, spacing: 0 }}
      counter={{
        style: {
          color: 'rgb(var(--color-secondary))',
          filter: 'unset',
        },
      }}
      inline={{
        style: {
          aspectRatio: '4 / 3',
          margin: '60px auto',
          maxHeight: '90vh',
          maxWidth: '100vw',
          minWidth: '360px',
        },
      }}
      plugins={[Inline, Captions, Counter, Fullscreen, Thumbnails, Zoom]}
      render={{
        slideFooter: ({ slide }) => (
          <Meta
            useInLightbox
            exif={
              photoPosts[slides.findIndex(s => s.src === slide.src)]?.exif
            }
          />
        ),
        thumbnail: ({ slide }) => {
          const { transformed } = photoPosts[slides.findIndex(s => s.src === slide.src)]!;
          return (
            <div className="h-full w-full overflow-hidden">
              <img sizes="120px" src={transformed.src} srcSet={transformed.srcSet.attribute} />
            </div>
          );
        },
      }}
      slides={slides}
      styles={{
        button: {
          color: 'rgb(var(--color-secondary))',
          filter: 'unset',
          opacity: 0.8,
        },
        captionsDescription: {
          color: 'rgb(var(--color-secondary))',
          lineClamp: 2,
          margin: '0 auto',
          maxWidth: '680px',
          padding: '0 16px',
          WebkitLineClamp: 2,
          width: '100%',
        },
        captionsDescriptionContainer: {
          alignItems: 'center',
          background: 'rgb(var(--color-card))',
          display: 'flex',
          fontSize: '14px',
          height: '56px',
          padding: '4px 16px',
        },
        captionsTitle: {
          color: 'rgb(var(--color-secondary))',
        },
        captionsTitleContainer: {
          background: 'rgb(var(--color-card))',
          height: '60px',
          paddingLeft: '80px',
        },
        container: {
          backgroundColor: 'unset',
          backgroundImage: `linear-gradient(45deg, rgb(var(--color-primary) / 0.2) 25%, transparent 25%, transparent 75%,rgb(var(--color-primary) / 0.2) 75%), 
                linear-gradient(45deg,rgb(var(--color-primary) / 0.2) 25%, transparent 25%, transparent 75%, rgb(var(--color-primary) / 0.2) 75%)`,
          backgroundPosition: '0 0, 10px 10px',
          backgroundSize: '20px 20px',
          borderRadius: '8px',
          boxShadow: '0px 20px 40px rgba(0, 0, 0, 0.2)',
          overflow: 'hidden',
        },
        navigationNext: {
          transform: 'scale(2)',
          transformOrigin: 'bottom right',
        },
        navigationPrev: {
          transform: 'scale(2)',
          transformOrigin: 'bottom left',
        },
        slide: {
          padding: '60px 0 128px 0',
        },
        thumbnail: { background: 'rgb(var(--color-primary))' },
        thumbnailsContainer: { background: 'none' },
      }}
      thumbnails={{ imageFit: 'cover', vignette: false }}
    />
  );
};

export default LightBoxSection;
