import type { FC } from 'react';
import { cn } from '@lib/utils';
import useRecentList from '@react/hooks/useRecentList';
import { bindKey, unbindKey } from '@rwh/keystrokes';
import { useEffect, useState } from 'react';
import Empty from './Empty';
import styles from './index.module.css';

const Recent: FC<{ hide: () => void }> = ({ hide }) => {
  const { recentList, removeRecent, updateRecentList } = useRecentList();
  const [selectIndex, setSelectIndex] = useState<number>(-1);

  useEffect(() => {
    const upKeyHandler = {
      onPressed: () => {
        if (selectIndex > 0) {
          setSelectIndex(selectIndex - 1);
        }
        else {
          setSelectIndex(recentList.length - 1);
        }
      },
    };
    const downKeyHandler = {
      onPressed: () => {
        if (selectIndex < recentList.length - 1) {
          setSelectIndex(selectIndex + 1);
        }
        else {
          setSelectIndex(0);
        }
      },
    };
    const delKeyHandler = {
      onPressed: () => {
        if (selectIndex < recentList.length) {
          if (selectIndex === recentList.length - 1) {
            setSelectIndex(selectIndex - 1);
          }
          removeRecent(selectIndex);
        }
      },
    };
    const enterKeyHandler = {
      onPressed: () => {
        if (selectIndex < recentList.length) {
          const recent = recentList[selectIndex];
          if (!recent) {
            return;
          }
          const newList = [...recentList];
          newList.splice(selectIndex, 1);
          newList.unshift(recent);
          updateRecentList(newList);
          history.pushState(null, '', recent.slug);
          hide();
        }
      },
    };

    const upKey = 'ArrowUp';
    const downKey = 'ArrowDown';
    const delKey = 'Backspace';
    const enterKey = 'Enter';
    bindKey(upKey, upKeyHandler);
    bindKey(downKey, downKeyHandler);
    bindKey(delKey, delKeyHandler);
    bindKey(enterKey, enterKeyHandler);
    return () => {
      unbindKey(upKey, upKeyHandler);
      unbindKey(downKey, downKeyHandler);
      unbindKey(delKey, delKeyHandler);
      unbindKey(enterKey, enterKeyHandler);
    };
  }, [recentList.length, selectIndex, setSelectIndex, recentList, removeRecent, updateRecentList, hide]);

  return (
    <>
      {!recentList.length && <Empty />}
      {!!recentList.length && (
        <div>
          <ul className="pb-6 pt-4 text-[14px]">
            {recentList.map((recent, index) => (
              <li
                // eslint-disable-next-line react/no-array-index-key
                key={`${index}`}
                className={cn(
                  styles.recentItem,
                  'colorModeTransition mx-2.5 mt-4 flex h-16 max-w-full items-center justify-between rounded-lg bg-background',
                  { [styles.selected!]: index === selectIndex },
                )}
                onMouseEnter={() => setSelectIndex(index)}
              >
                <a
                  className="flex h-16 grow-2 items-center text-ellipsis p-3"
                  href={recent.slug}
                  onClick={() => hide()}
                >
                  <span
                    className={cn(
                      'colorModeTransition mr-4 h-6 rounded-full bg-card px-2 text-[12px] leading-6 inline-flex items-center justify-center gap-1',
                      'max-w-[45%] shrink-0 grow-0 overflow-hidden text-ellipsis whitespace-nowrap text-secondary',
                      styles.query,
                    )}
                  >
                    <span className="iconify heroicons--hashtag-solid" />
                    {recent.query}
                  </span>
                  <span className="line-clamp-2 text-ellipsis whitespace-normal text-sm leading-6">
                    {recent.title}
                  </span>
                </a>
                <div
                  className="ml-4 mr-3 h-10 w-10 cursor-pointer p-2 text-center leading-6 opacity-60 hover:opacity-100"
                  onClick={() => removeRecent(index)}
                >
                  <span className="iconify akar-icons--trash-can" />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
};
export default Recent;
