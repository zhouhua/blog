import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

function HoverEffect() {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  useEffect(() => {
    const parent = ref.current?.closest('li');
    function mouseIn() {
      setHovered(true);
    }
    function mouseOut() {
      setHovered(false);
    }
    if (parent) {
      parent.addEventListener('mouseenter', mouseIn);
      parent.addEventListener('mouseleave', mouseOut);
      return () => {
        parent.removeEventListener('mouseenter', mouseIn);
        parent.removeEventListener('mouseleave', mouseOut);
      };
    }
    return undefined;
  }, [setHovered]);
  return (
    <>
      <div ref={ref} />
      <AnimatePresence mode="wait">
        {hovered && (
          <motion.div
            className="absolute inset-0 h-full w-full bg-neutral-200 dark:bg-slate-800/[0.8] block rounded-2xl"
            layoutId="hoverBackground"
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              transition: { duration: 0.4 },
            }}
            exit={{
              opacity: 0,
              transition: { delay: 0.2, duration: 0.4 },
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
export default HoverEffect;
