import type { FC, ReactNode } from 'react';
import { cn } from '@lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@react/ui/card';
import { ScrollArea } from '@react/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@react/ui/select';
import { useMemo, useState } from 'react';

interface IPorps<T> {
  title: string;
  description?: string;
  renderItem: (item: T, index: number) => ReactNode;
  data: T[];
  filterFields?: ([string, Record<string, string>] | string)[];
  className?: string;
}

type Component<U = any> = FC<IPorps<U>>;

const List: Component = ({ className, data, description, filterFields, renderItem, title }) => {
  const [filter, setFilter] = useState<Record<string, string>>({});
  const filteredData = useMemo(() => {
    const keys = Object.keys(filter);
    if (keys.length === 0) {
      return data;
    }
    return data.filter((item) => {
      for (const key of keys) {
        if (filter[key] && filter[key] !== '-' && item[key] !== filter[key]) {
          return false;
        }
      }
      return true;
    });
  }, [data, filter]);
  return (
    <Card className={cn('bg-white/40', className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        {Boolean(filterFields?.length) && (
          <div className="mt-4 flex gap-4">
            {filterFields!.map((filter) => {
              const name = typeof filter === 'string' ? filter : filter[0];
              const options: Record<string, string> = typeof filter === 'string'
                ? data.reduce((map, item) => {
                  const value = item[name];
                  map[value] = value;
                  return map;
                }, {})
                : filter[1];
              return (
                <div className="flex-1" key={name}>
                  <div className="opacity-75 mb-1 text-xs">
                    选择
                    {name}
                    :
                  </div>
                  <Select onValueChange={value => setFilter(f => ({ ...f, [name]: value }))}>
                    <SelectTrigger className="p-1 h-7">
                      <SelectValue className="!text-xs" placeholder="全部" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(options).map(key => (
                        <SelectItem key={key} value={key} className="h-6">
                          {options[key]}
                        </SelectItem>
                      ))}
                      <SelectItem value="-" className="h-6">所有</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              );
            })}
          </div>
        )}
      </CardHeader>
      <CardContent className="p-2">
        <ScrollArea className="w-full h-60">
          <div className="flex flex-wrap gap-3.5 p-2">
            {filteredData.map((item, index) => renderItem(item, index))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
export default List;
