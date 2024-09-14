import type { FC } from 'react';
import { useMemo } from 'react';
import type { SlideImage, Slide } from 'yet-another-react-lightbox';
import Lightbox from 'yet-another-react-lightbox';
import Inline from 'yet-another-react-lightbox/plugins/inline';
import Captions from 'yet-another-react-lightbox/plugins/captions';
import Counter from 'yet-another-react-lightbox/plugins/counter';
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/captions.css';
import 'yet-another-react-lightbox/plugins/counter.css';
import 'yet-another-react-lightbox/plugins/thumbnails.css';
import Meta from '../../components/Photo/Meta';

const LightBoxSection: FC<{ photoPost: Queries.photo; }> = ({ photoPost }) => {
  const slides = useMemo<SlideImage[]>(
    () =>
      photoPost.list.map(({ description, picture }) => {
        const { PixelXDimension, PixelYDimension }
          = picture!.childImageSharp!.fields?.exif?.raw?.exif || {};
        return {
          type: 'image',
          src: picture!.childImageSharp!.gatsbyImageData.images.fallback!.src,
          description,
          title: ' ',
          width: PixelXDimension!,
          height: PixelYDimension!,
          imageFit: 'contain',
        };
      }),
    [photoPost],
  );

  return (
    <Lightbox
      inline={{
        style: {
          maxWidth: '100vw',
          minWidth: '360px',
          maxHeight: '90vh',
          aspectRatio: '4 / 3',
          margin: '60px auto',
        },
      }}
      counter={{
        style: {
          color: 'rgb(var(--color-secondary))',
          filter: 'unset',
        },
      }}
      styles={{
        container: {
          borderRadius: '8px',
          overflow: 'hidden',
          backgroundColor: 'unset',
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 10px 10px',
          backgroundImage: `linear-gradient(45deg, rgb(var(--color-primary) / 0.2) 25%, transparent 25%, transparent 75%,rgb(var(--color-primary) / 0.2) 75%), 
                linear-gradient(45deg,rgb(var(--color-primary) / 0.2) 25%, transparent 25%, transparent 75%, rgb(var(--color-primary) / 0.2) 75%)`,
          boxShadow: '0px 20px 40px rgba(0, 0, 0, 0.2)',
        },
        thumbnailsContainer: { background: 'none' },
        thumbnail: { background: 'rgb(var(--color-primary))' },
        captionsDescriptionContainer: {
          background: 'rgb(var(--color-card))',
          height: '56px',
          padding: '4px 16px',
          display: 'flex',
          alignItems: 'center',
          fontSize: '14px',
        },
        captionsTitle: {
          color: 'rgb(var(--color-secondary))',
        },
        captionsDescription: {
          color: 'rgb(var(--color-secondary))',
          maxWidth: '680px',
          WebkitLineClamp: 2,
          lineClamp: 2,
          width: '100%',
          margin: '0 auto',
          padding: '0 16px',
        },
        captionsTitleContainer: {
          background: 'rgb(var(--color-card))',
          height: '60px',
          paddingLeft: '80px',
        },
        slide: {
          padding: '60px 0 128px 0',
        },
        button: {
          color: 'rgb(var(--color-secondary))',
          filter: 'unset',
          opacity: 0.8,
        },
        navigationNext: {
          transform: 'scale(2)',
          transformOrigin: 'bottom right',
        },
        navigationPrev: {
          transform: 'scale(2)',
          transformOrigin: 'bottom left',
        },
      }}
      render={{
        slideFooter: ({ slide }) => (
          <Meta
            useInLightbox
            exif={
              photoPost.list[slides.findIndex(s => s.src === slide.src)]?.picture?.childImageSharp
                ?.fields?.exif || undefined
            }
          />
        ),
        thumbnail: ({ slide }) => {
          const { sources, fallback }
            = photoPost.list[slides.findIndex(s => s.src === slide.src)].picture!.childImageSharp!
              .gatsbyImageData.images;
          return (
            <div className="h-full w-full overflow-hidden">
              <picture>
                {sources?.map(source => (
                  <source
                    key={source.type}
                    type={source.type}
                    srcSet={source.srcSet}
                    sizes="180px"
                  />
                ))}
                <img src={fallback?.src} srcSet={fallback?.srcSet} sizes="180px" alt="" />
              </picture>
            </div>
          );
        },
      }}
      plugins={[Inline, Captions, Counter, Fullscreen, Thumbnails, Zoom]}
      slides={slides}
      thumbnails={{ imageFit: 'cover', vignette: false }}
      carousel={{ padding: 0, spacing: 0 }}
    />
  );
};

export default LightBoxSection;
