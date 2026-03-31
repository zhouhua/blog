import type { FC } from 'react';
import { cn } from '@lib/utils';
import Kbd from '@react/components/Keyboard';
import useColorMode from '@react/hooks/useColorMode';
import useRecentList from '@react/hooks/useRecentList';
import {
  CornerDownLeft,
  Delete,
  MoveDown,
  MoveUp,
} from 'lucide-react';
import { useMemo } from 'react';
import { PoweredBy, useStats } from 'react-instantsearch';

const hotKeys = [
  {
    keys: [<CornerDownLeft key="enter" className="size-4" />],
    showIn: {
      always: false,
      recent: true,
      search: true,
    },
    text: '选择',
  },
  {
    keys: [<MoveUp key="up" className="size-4" />, <MoveDown key="down" className="size-4" />],
    showIn: {
      always: false,
      recent: true,
      search: true,
    },
    text: '切换',
  },
  {
    keys: [<Delete key="delete" className="size-4" />],
    showIn: {
      always: false,
      recent: true,
      search: false,
    },
    text: '删除',
  },
  {
    keys: ['Esc'],
    showIn: {
      always: true,
      recent: true,
      search: true,
    },
    text: '退出',
  },
];
const Footer: FC = () => {
  const [colorMode] = useColorMode();
  const { nbHits, query } = useStats();
  const { recentList } = useRecentList();
  const showSearchKey = !!nbHits && !!query;
  const showRecentKey = !query && !!recentList.length;

  const showMap = useMemo<boolean[]>(
    () =>
      hotKeys.map(
        ({ showIn }) =>
          showIn.always || (showIn.search && showSearchKey) || (showIn.recent && showRecentKey),
      ),
    [showRecentKey, showSearchKey],
  );

  return (
    <footer
      className={cn(
        'flex flex-row-reverse justify-between',
        'border-bgAlt border-t-[1px] border-solid px-6 py-4',
      )}
    >
      <PoweredBy
        classNames={{
          logo: 'h-[18px] mt-[3px] sm:h-3 md:h-4',
        }}
        theme={colorMode}
      />
      <div className="text-sm hidden sm:flex gap-4 md:gap-2">
        {hotKeys.map(
          ({ keys, text }, i) =>
            showMap[i] && (
              <div key={text} className="flex gap-1 items-center">
                {keys.map((key, index) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <Kbd key={index}>{key}</Kbd>
                ))}
                <span className="md:text-xs">{text}</span>
              </div>
            ),
        )}
      </div>
    </footer>
  );
};
export default Footer;
