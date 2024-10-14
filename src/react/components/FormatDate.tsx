import dayjs from '@lib/dayjs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@react/ui/tooltip';

function FormatDate({ time }: { time: Date | number }) {
  const date = dayjs(time);
  return (
    <TooltipProvider delayDuration={400}>
      <Tooltip>
        <TooltipTrigger>
          <span>{date.fromNow()}</span>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {date.format('YYYY-MM-DD HH:mm:ss')}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default FormatDate;
