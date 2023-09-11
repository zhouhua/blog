import type { FC } from 'react';
import { useRef, useEffect, useState } from 'react';
import clsx from 'clsx';
import * as styles from './index.module.css';

const ImagePlaceholder: FC = props => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setDimensions(containerRef.current!.getBoundingClientRect());

    const handleResize = () => setDimensions(containerRef.current!.getBoundingClientRect());

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div
      className={clsx(
        styles.container,
        'flex h-full w-full items-center justify-center font-semibold',
        'text-[32px] sm:text-[28px]'
      )}
      ref={containerRef}
      {...props}
    >
      <div>
        {dimensions.width} x{dimensions.height}
      </div>
    </div>
  );
};

export default ImagePlaceholder;
