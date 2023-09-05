import type { FC } from 'react';
import React, { useRef, useState } from 'react';
import { useInstantSearch, useSearchBox } from 'react-instantsearch';
import clsx from 'clsx';
import { throttle } from 'lodash';

function beforeQuery(query: string, search: (value: string) => void) {
  search(query);
}
const throttledSearch = throttle(beforeQuery, 400);

const Header: FC<{ hide: () => void }> = ({ hide }) => {
  const { query, refine } = useSearchBox({
    queryHook: throttledSearch
  });
  const { status } = useInstantSearch();
  const [inputValue, setInputValue] = useState(query);
  const inputRef = useRef<HTMLInputElement>(null);

  function setQuery(newQuery: string) {
    setInputValue(newQuery);
    refine(newQuery);
  }
  function onChange(event: React.ChangeEvent<HTMLInputElement>) {
    setQuery(event.currentTarget.value);
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (inputRef.current) {
      refine(inputValue);
      inputRef.current.blur();
    }
  }

  return (
    <header
      className={clsx(
        'border-b-[1px] border-solid border-horizontalRule dark:border-dark-horizontalRule',
        'relative flex flex-none items-center'
      )}
    >
      <div className="p-4 text-center">
        <i
          className={clsx('fa-solid  text-2xl', {
            'fa-magnifying-glass': status !== 'stalled',
            'fa-spinner fa-spin': status === 'stalled'
          })}
        />
      </div>
      <form action="" className="flex max-w-full grow-[2]" noValidate onSubmit={onSubmit}>
        <input
          ref={inputRef}
          className="h-14 max-w-full grow-[2] appearance-none bg-background px-2 dark:bg-dark-background"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          placeholder="搜索文章"
          spellCheck={false}
          maxLength={512}
          type="text"
          value={inputValue}
          onChange={onChange}
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
        />
      </form>
      <button className="p-4 text-center opacity-60 hover:opacity-100" onClick={hide} type="button">
        <i className="fa-solid fa-xmark text-2xl" />
      </button>
    </header>
  );
};

export default Header;
