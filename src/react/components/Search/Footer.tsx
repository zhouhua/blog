import type { FC } from 'react';
import { cn } from '@lib/utils';
import Kbd from '@react/components/Keyboard';
import useColorMode from '@react/hooks/useColorMode';
import useRecentList from '@react/hooks/useRecentList';
import { useMemo } from 'react';
import { PoweredBy, useStats } from 'react-instantsearch';

const hotKeys = [
  {
    keys: [<span key="enter" className="iconify oui--return-key" />],
    showIn: {
      always: false,
      recent: true,
      search: true,
    },
    text: '选择',
  },
  {
    keys: [<span key="up" className="iconify fa6-solid--arrow-up" />, <span key="down" className="iconify fa6-solid--arrow-down" />],
    showIn: {
      always: false,
      recent: true,
      search: true,
    },
    text: '切换',
  },
  {
    keys: [<span key="delete" className="iconify fa6-solid--delete-left" />],
    showIn: {
      always: false,
      recent: true,
      search: false,
    },
    text: '删除',
  },
  {
    keys: [<span key="esc" className="iconify vaadin--esc-a" />],
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
        'border-bg-alt border-t border-solid px-6 py-4',
      )}
    >
      <PoweredBy
        classNames={{
          logo: 'h-3 mt-[3px] sm:h-4',
        }}
        theme={colorMode}
      />
      <div className="flex text-sm hidden gap-4 sm:gap-2">
        {hotKeys.map(
          ({ keys, text }, i) =>
            showMap[i] && (
              <div key={text} className="flex gap-1 items-center">
                {keys.map((key, index) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <Kbd key={index}>{key}</Kbd>
                ))}
                <span className="sm:text-xs">{text}</span>
              </div>
            ),
        )}
      </div>
    </footer>
  );
};
export default Footer;
