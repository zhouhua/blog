import type { ChangeEvent, FC, FormEvent } from 'react';
import clsx from 'clsx';
import { throttle } from 'lodash-es';
import { useRef, useState } from 'react';
import { useInstantSearch, useSearchBox } from 'react-instantsearch';

function beforeQuery(query: string, search: (value: string) => void) {
  search(query);
}
const throttledSearch = throttle(beforeQuery, 600);

const Header: FC<{ hide: () => void }> = ({ hide }) => {
  const { query, refine } = useSearchBox({
    queryHook: throttledSearch,
  });
  const { status } = useInstantSearch();
  const [inputValue, setInputValue] = useState(query);
  const inputRef = useRef<HTMLInputElement>(null);

  function setQuery(newQuery: string) {
    setInputValue(newQuery);
    refine(newQuery);
  }
  function onChange(event: ChangeEvent<HTMLInputElement>) {
    setQuery(event.currentTarget.value);
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
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
        'border-b-[1px] border-solid border-palette-gray',
        'relative flex flex-none items-center',
      )}
    >
      <div className="p-4 text-center">
        {status === 'stalled'
          ? (
              <div className="loading loading-ring loading-xs" />
            )
          : (
              <span className="iconify fa6-solid--magnifying-glass" />
            )}
      </div>
      <form noValidate action="" className="flex max-w-full grow-[2]" onSubmit={onSubmit}>
        <input
          ref={inputRef}
          autoFocus
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          className="h-14 max-w-full grow-[2] appearance-none bg-palette-card px-2"
          maxLength={512}
          placeholder="搜索文章"
          spellCheck={false}
          type="text"
          value={inputValue}
          onChange={onChange}
        />
      </form>
      <button
        className="p-4 text-center opacity-60 hover:opacity-100"
        type="button"
        onClick={hide}
      >
        <span className="iconify fa6-solid--xmark" />
      </button>
    </header>
  );
};

export default Header;
