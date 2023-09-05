import type { FC } from 'react';
import React from 'react';
import { useStats } from 'react-instantsearch';

const NoResult: FC = () => {
  const { query, processingTimeMS } = useStats();
  return (
    <div className="px-6 py-16 text-center text-grey dark:text-dark-grey">
      没有关于<span className="px-1 text-secondary dark:text-dark-secondary">{query}</span>
      的搜索结果，耗时 {processingTimeMS}ms。
    </div>
  );
};
export default NoResult;
