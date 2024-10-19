import dayjs from '@lib/dayjs';
import Tooltip from '@react/components/Tooltip';

function FormatDate({ time }: { time: Date | number }) {
  const date = dayjs(time);
  return (
    <Tooltip side="bottom" content={date.format('YYYY-MM-DD HH:mm:ss')}>{date.fromNow()}</Tooltip>
  );
}

export default FormatDate;
