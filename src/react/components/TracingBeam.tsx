import { cn } from '@lib/utils';
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

function TracingBeam({
  className,
}: {
  className?: string;
}) {
  const ref = useRef<HTMLElement>(document.querySelector('#ArticleContent'));
  const { scrollYProgress } = useScroll({
    container: { current: document.body },
    offset: ['start center', 'end end'],
    target: ref,
  });

  const [svgHeight, setSvgHeight] = useState(0);

  useEffect(() => {
    function getHeight() {
      setSvgHeight(window.innerHeight * 0.8);
    }
    getHeight();
    window.addEventListener('resize', getHeight);
    return () => {
      window.removeEventListener('resize', getHeight);
    };
  }, [setSvgHeight]);

  const y1 = useSpring(
    useTransform(scrollYProgress, [0, 0.9], [50, svgHeight]),
    {
      damping: 90,
      stiffness: 500,
    },
  );
  const y2 = useSpring(
    useTransform(scrollYProgress, [0, 1], [50, svgHeight - 100]),
    {
      damping: 90,
      stiffness: 500,
    },
  );
  const opacity = useSpring(
    useTransform((): number => {
      if (scrollYProgress.get() > 0.99 || scrollYProgress.get() < 0.02) {
        return 0;
      }
      else {
        return 1;
      }
    }),
  );
  return (
    <motion.div
      className={cn('fixed max-w-4xl mx-auto h-[80vh] top-[10vh] sm:hidden md:left-3 left-[calc((100vw-680px)/4-28px)]', className)}
      style={{
        opacity,
      }}
    >
      <div className="absolute left-0 top-0">
        <motion.div
          transition={{
            delay: 0.5,
            duration: 0.2,
          }}
          animate={{
            boxShadow:
              scrollYProgress.get() > 0
                ? 'none'
                : 'rgba(0, 0, 0, 0.24) 0px 3px 8px',
          }}
          className="ml-[27px] h-4 w-4 rounded-full border border-netural-200 shadow-sm flex items-center justify-center"
        >
          <motion.div
            transition={{
              delay: 0.5,
              duration: 0.2,
            }}
            animate={{
              backgroundColor:
                scrollYProgress.get() > 0 ? 'white' : 'var(--emerald-500)',
              borderColor:
                scrollYProgress.get() > 0 ? 'white' : 'var(--emerald-600)',
            }}
            className="h-2 w-2  rounded-full border border-neutral-300 bg-white"
          />
        </motion.div>
        <svg
          viewBox={`0 0 20 ${svgHeight}`}
          width="20"
          height={svgHeight} // Set the SVG height
          className=" ml-4 block"
          aria-hidden="true"
        >
          <motion.path
            d={`M 1 0V -36 l 18 24 V ${svgHeight * 0.8} l -18 24V ${svgHeight}`}
            fill="none"
            stroke="#9091A0"
            strokeOpacity="0.16"
            transition={{
              duration: 10,
            }}
          />
          <motion.path
            d={`M 1 0V -36 l 18 24 V ${svgHeight * 0.8} l -18 24V ${svgHeight}`}
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="1.25"
            className="motion-reduce:hidden"
            transition={{
              duration: 10,
            }}
          />
          <defs>
            <motion.linearGradient
              id="gradient"
              gradientUnits="userSpaceOnUse"
              x1="0"
              x2="0"
              y1={y1} // set y1 for gradient
              y2={y2} // set y2 for gradient
            >
              <stop stopColor="#18CCFC" stopOpacity="0" />
              <stop stopColor="#18CCFC" />
              <stop offset="0.325" stopColor="#6344F5" />
              <stop offset="1" stopColor="#AE48FF" stopOpacity="0" />
            </motion.linearGradient>
          </defs>
        </svg>
      </div>
    </motion.div>
  );
}

export default TracingBeam;
