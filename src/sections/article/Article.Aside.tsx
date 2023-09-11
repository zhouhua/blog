import type { FC, PropsWithChildren, ReactElement } from 'react';
import { useState, useRef, useEffect, Children, cloneElement } from 'react';
import throttle from 'lodash/throttle';
import clsx from 'clsx';
import { clamp } from '@utils';
import HandleOverlap from './Article.HandleOverlap';
import * as styles from './index.module.css';

interface AsideProps {
  contentHeight: number;
}

/**
 * Aside: the wonderful fixed positioned elements that are to the left
 * and the right of the written content on our articles. For example, the
 * progress bar and dark controls are within an Aside. The main responsibility
 * of this component is to show or hide its children if it's at the top or bottom
 * of the page!
 *
 * The left and right Asides!
 *
 * left Aside ----> |  content  | <--- right Aside
 *                  |  content  |
 *                  |  content  |
 *                  |  content  |
 *
 */
const Aside: FC<PropsWithChildren & AsideProps> = ({ contentHeight, children }) => {
  const progressRef = useRef<HTMLDivElement>(null);

  const [progress, setProgress] = useState<number>(0);
  const [imageOffset, setImageOffset] = useState<number>(0);
  const [shouldFixAside, setShouldFixAside] = useState<boolean>(false);

  const show = imageOffset && progress < 100;
  const childrenWithProps = Children.map(children, child =>
    cloneElement(child as ReactElement, { show })
  );

  useEffect(() => {
    const imageRect = document!.getElementById('ArticleImage__Hero')!.getBoundingClientRect();

    const imageOffsetFromTopOfWindow = imageRect.top + window.scrollY;
    setImageOffset(imageOffsetFromTopOfWindow);

    const handleScroll = throttle(() => {
      const el = progressRef.current!;
      const { top } = el.getBoundingClientRect();
      const height = el.offsetHeight;
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;

      const percentComplete = (window.scrollY / contentHeight) * 100;

      setProgress(clamp(+percentComplete.toFixed(2), 0, 105));

      if (top + window.scrollY < imageOffsetFromTopOfWindow) {
        return setShouldFixAside(false);
      }

      if (top + height / 2 <= windowHeight / 2) {
        return setShouldFixAside(true);
      }
    }, 20);

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [contentHeight]);

  return (
    <aside className={clsx(styles.AsideContainer, 'mx-auto my-0 flex')}>
      <div
        className={clsx(
          { 'fixed items-center': shouldFixAside, 'absolute items-start': !shouldFixAside },
          {
            'visible opacity-100': show,
            'invisible opacity-0': !show
          },
          'z-[3] flex h-screen translate-y-0'
        )}
        style={{
          transition: `opacity ${show ? '0.4' : '0.2'}s linear, visibility 0.4s linear`,
          top: shouldFixAside ? 0 : `${imageOffset}px`
        }}
      >
        <div ref={progressRef}>
          <HandleOverlap>{childrenWithProps}</HandleOverlap>
        </div>
      </div>
    </aside>
  );
};

export default Aside;
