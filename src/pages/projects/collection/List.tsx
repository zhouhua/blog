import type { FC, ReactNode } from 'react';
import { cn } from '@lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@react/ui/card';
import { ScrollArea } from '@react/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@react/ui/select';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
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
        <CardTitle className="text-sm">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        {Boolean(filterFields?.length) && (
          <div className="mt-4 flex gap-4">
            {filterFields!.map((filter) => {
              const name = typeof filter === 'string' ? filter : filter[0];
              let options: Record<string, string>;
              if (typeof filter === 'string') {
                options = data.reduce((map, item) => {
                  const value = item[name];
                  map[value] = value;
                  return map;
                }, {});
              }
              else {
                options = filter[1];
              }
              return (
                <div className="flex-1" key={name}>
                  <div className="opacity-75 mb-1 text-xs">
                    {t('common.select')}
                    {name}
                    :
                  </div>
                  <Select onValueChange={value => setFilter(f => ({ ...f, [name]: value }))}>
                    <SelectTrigger className="p-1 h-7">
                      <SelectValue className="!text-xs" placeholder={t('common.all')} />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(options).map(key => (
                        <SelectItem key={key} value={key} className="h-6">
                          {options[key]}
                        </SelectItem>
                      ))}
                      <SelectItem value="-" className="h-6">{t('common.all')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              );
            })}
          </div>
        )}
      </CardHeader>
      <CardContent className="p-2">
        <ScrollArea className="w-full h-40">
          <div className="flex flex-wrap gap-3.5 p-2">
            {filteredData.map((item, index) => renderItem(item, index))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
export default List;
