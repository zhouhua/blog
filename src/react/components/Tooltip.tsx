import type { FC, PropsWithChildren, ReactNode } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@react/ui/tooltip';

const TooltipWrap: FC<PropsWithChildren<{
  duration?: number;
  content: ReactNode;
  side?: 'bottom' | 'left' | 'right' | 'top';
}>> = ({ children, content, duration = 400, side = 'top' }) => {
  return (
    <TooltipProvider delayDuration={duration}>
      <Tooltip>
        <TooltipTrigger>
          {children}
        </TooltipTrigger>
        <TooltipContent side={side}>
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default TooltipWrap;
