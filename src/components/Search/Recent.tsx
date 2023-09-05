import { Link, navigate } from 'gatsby';
import type { FC } from 'react';
import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import { bindKey, unbindKey } from '@rwh/keystrokes';
import Empty from './Empty';
import * as styles from './index.module.css';
import useRecentList from './useRecentList';

const Recent: FC<{ hide: () => void }> = ({ hide }) => {
  const { recentList, removeRecent, updateRecentList } = useRecentList();
  const [selectIndex, setSelectIndex] = useState<number>(-1);

  useEffect(() => {
    const upKeyHandler = {
      onPressed: () => {
        if (selectIndex > 0) {
          setSelectIndex(selectIndex - 1);
        } else {
          setSelectIndex(recentList.length - 1);
        }
      }
    };
    const downKeyHandler = {
      onPressed: () => {
        if (selectIndex < recentList.length - 1) {
          setSelectIndex(selectIndex + 1);
        } else {
          setSelectIndex(0);
        }
      }
    };
    const delKeyHandler = {
      onPressed: () => {
        if (selectIndex < recentList.length) {
          if (selectIndex === recentList.length - 1) {
            setSelectIndex(selectIndex - 1);
          }
          removeRecent(selectIndex);
        }
      }
    };
    const enterKeyHandler = {
      onPressed: () => {
        if (selectIndex < recentList.length) {
          const recent = recentList[selectIndex];
          const newList = [...recentList];
          newList.splice(selectIndex, 1);
          newList.unshift(recent);
          updateRecentList(newList);
          navigate(recent.slug);
          hide();
        }
      }
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
  }, [recentList.length, selectIndex, setSelectIndex, recentList]);

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
                className={clsx(
                  styles.recentItem,
                  'mx-6 mt-4 flex max-w-full items-center rounded-lg bg-card p-3 dark:bg-dark-card',
                  'flex justify-between ',
                  { [styles.selected]: index === selectIndex }
                )}
                onMouseEnter={() => setSelectIndex(index)}
              >
                <Link to={recent.slug} className="block h-6 text-ellipsis" onClick={() => hide()}>
                  <span
                    className={clsx(
                      'mr-4 inline-block h-6 rounded-full bg-background px-2 text-[12px] leading-6 dark:bg-dark-background',
                      styles.query
                    )}
                  >
                    <i className="fa-solid fa-hashtag mr-2 inline-block " />
                    {recent.query}
                  </span>
                  {recent.title}
                </Link>
                <div
                  className="ml-4 h-10 w-10 p-2 text-center leading-6 opacity-60 hover:opacity-100"
                  onClick={() => removeRecent(index)}
                >
                  <i className="fa-solid fa-times" />
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
