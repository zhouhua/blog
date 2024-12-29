import type { FC, ReactNode } from 'react';
import { cn } from '@lib/utils';
import { buttonVariants } from '@react/ui/button';
import { Dock, DockIcon } from '@react/ui/dock';
import { Separator } from '@react/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@react/ui/tooltip';
import { Fragment } from 'react';

interface DockerItem {
  name: string;
  icon: ReactNode;
  link: string;
}
const data: DockerItem[][] = [
  [
    {
      icon: <span className="size-4 iconify mdi--home-outline" />,
      link: '/',
      name: 'Home',
    },
    {
      icon: <span className="size-4 iconify mdi--journal-outline" />,
      link: '/blogs',
      name: 'Blog',
    },
  ],
  [
    {
      icon: <span className="size-4 iconify bi--noise-reduction" />,
      link: '/projects/gradient',
      name: 'SVG Noise Generator',
    },
    {
      icon: <span className="size-4 iconify mdi--blur" />,
      link: '/projects/blurry',
      name: 'Blurry Generator',
    },
    {
      icon: <span className="size-4 iconify ph--intersect-three-duotone" />,
      link: '/projects/animateBlurry',
      name: 'Animated Blurry',
    },
    {
      icon: <span className="size-4 iconify mdi--gradient" />,
      link: '/projects/collection/gradient',
      name: 'Gradient Collection',
    },
    {
      icon: <span className="size-4 iconify lucide-lab--grid-lines-offset" />,
      link: '/projects/collection/pattern',
      name: 'Pattern Collection',
    },
  ],
  [
    {
      icon: <span className="size-4 iconify carbon--user-avatar" />,
      link: '/about',
      name: 'About Me',
    },
    {
      icon: <span className="size-4 iconify ri--github-line" />,
      link: '',
      name: 'Github',
    },
    {
      icon: <span className="size-4 iconify simple-icons--kofi" />,
      link: '',
      name: 'Tip Me',
    },
  ],
];

const DockerWrap: FC = () => {
  return (
    <TooltipProvider>
      <Dock direction="middle" className="fixed bottom-16 left-1/2 -translate-x-1/2">
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
