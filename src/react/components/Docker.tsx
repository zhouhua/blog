import type { FC, ReactNode } from 'react';
import { cn } from '@lib/utils';
import { buttonVariants } from '@react/ui/button';
import { Dock, DockIcon } from '@react/ui/dock';
import { Separator } from '@react/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@react/ui/tooltip';
import {
  BookMarked,
  CircleUserRound,
  Grid3X3,
  Home,
  Palette,
} from 'lucide-react';
import { Fragment } from 'react';
import { BsNoiseReduction } from 'react-icons/bs';
import { MdBlurOn, MdGradient } from 'react-icons/md';
import { PiIntersectThreeDuotone } from 'react-icons/pi';

interface DockerItem {
  name: string;
  icon: ReactNode;
  link: string;
}
const data: DockerItem[][] = [
  [
    {
      icon: <Home className="size-4" />,
      link: '/',
      name: 'Home',
    },
    {
      icon: <BookMarked className="size-4" />,
      link: '/blogs',
      name: 'Blog',
    },
  ],
  [
    {
      icon: <BsNoiseReduction className="size-4" />,
      link: '/projects/gradient',
      name: 'SVG Noise Generator',
    },
    {
      icon: <MdBlurOn className="size-4" />,
      link: '/projects/blurry',
      name: 'Blurry Generator',
    },
    {
      icon: <PiIntersectThreeDuotone className="size-4" />,
      link: '/projects/animate-blurry',
      name: 'Animated Blurry',
    },
    {
      icon: <MdGradient className="size-4" />,
      link: '/projects/collection/gradient',
      name: 'Gradient Collection',
    },
    {
      icon: <Grid3X3 className="size-4" />,
      link: '/projects/collection/pattern',
      name: 'Pattern Collection',
    },
    {
      icon: <Palette className="size-4" />,
      link: '/projects/collection/contrast',
      name: 'Clashing Colors Collection',
    },
  ],
  [
    {
      icon: <CircleUserRound className="size-4" />,
      link: '/about',
      name: 'About Me',
    },
  ],
];

const DockerWrap: FC = () => {
  return (
    <TooltipProvider>
      <Dock direction="middle" className="fixed bottom-16 left-1/2 -translate-x-1/2 z-50">
        {data.map((list, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <Fragment key={index}>
            {index !== 0 && <Separator orientation="vertical" className="h-full py-2" />}
            {
              list.map(item => (
                <DockIcon key={item.name}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a
                        href={item.link}
                        aria-label={item.name}
                        className={cn(
                          buttonVariants({ size: 'icon', variant: 'ghost' }),
                          'size-12 rounded-full',
                        )}
                      >
                        {item.icon}
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{item.name}</p>
                    </TooltipContent>
                  </Tooltip>
                </DockIcon>
              ))
            }
          </Fragment>
        ))}
      </Dock>
    </TooltipProvider>
  );
};
export default DockerWrap;
