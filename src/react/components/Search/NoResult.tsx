import type { FC } from 'react';
import { useStats } from 'react-instantsearch';

const NoResult: FC = () => {
  const { processingTimeMS, query } = useStats();
  return (
    <div className="text-gray px-6 py-16 text-center">
      没有关于
      <span className="text-secondary px-1.5">{query}</span>
      的搜索结果，耗时
      {' '}
      {processingTimeMS}
      ms。
    </div>
  );
};
export default NoResult;
