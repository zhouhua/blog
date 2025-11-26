import type { RankingInfo } from '@tanstack/match-sorter-utils';
import type {
  ColumnDef,
  FilterFn,
} from '@tanstack/react-table';
import { cn } from '@lib/utils';
import FormatDate from '@react/components/FormatDate';
import { Button } from '@react/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@react/ui/card';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerTitle,
  DrawerTrigger,
} from '@react/ui/drawer';
import { Input } from '@react/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@react/ui/popover';
import { Toaster } from '@react/ui/sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@react/ui/table';
import { rankItem } from '@tanstack/match-sorter-utils';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useRequest } from 'ahooks';
import axios from 'axios';
import copy from 'copy-to-clipboard';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

declare module '@tanstack/react-table' {
  // add fuzzy filter to the filterFns
  interface FilterFns {
    fuzzy: FilterFn<unknown>;
  }
  interface FilterMeta {
    itemRank: RankingInfo;
  }
}

// Define a custom fuzzy filter function that will apply ranking info to rows (using match-sorter utils)
const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value);

  // Store the itemRank info
  addMeta({
    itemRank,
  });

  // Return if the item should be filtered in/out
  return itemRank.passed;
};

interface ILink {
  key: string;
  value: string;
  last_use: Date;
}

function ShortLink() {
  const { data = [], loading, refreshAsync } = useRequest<ILink[], never[]>(async () => {
    try {
      const res = await axios.get('/api/links');
      if (res.data.code === 0) {
        return res.data.list || [];
      }
      else {
        toast.error('获取短链列表失败！');
        return [];
      }
    }
    catch (e) {
      return [];
    }
  }, {});
  const [url, setUrl] = useState<string>('');
  const { loading: createLoading, runAsync } = useRequest(async () => {
    try {
      const res = await axios.post('/api/link', { value: url });
      if (res.data.code === 0) {
        copy(`${location.origin}/i/${res.data.key}`, {
          onCopy: () => {
            toast.success('创建成功，短链地址已复制到剪切板!');
          },
        });
        refreshAsync();
        setTimeout(() => setUrl(''), 1000);
        return res.data.list || [];
      }
      else {
        toast.error('创建短链失败！');
        return [];
      }
    }
    catch (e) {
      return [];
    }
  }, {
    manual: true,
    refreshDeps: [url],
  });
  const [globalFilter, setGlobalFilter] = useState<string>('');
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const deleteLink = async (key: string) => {
    try {
      const res = await axios.delete(`/api/link`, {
        data: {
          key,
        },
      });
      if (res.data.code === 0) {
        toast.success('删除成功！');
        refreshAsync();
        return;
      }
    }
    catch (e) {
    }
    toast.error('删除失败！');
  };
  const columns: ColumnDef<ILink>[] = [
    {
      accessorKey: 'key',
      cell: ({ getValue }) => {
        const key = getValue() as string;
        return (
          <div
            className="flex gap-1 items-center cursor-pointer"
            onClick={() => {
              const url = `${location.origin}/i/${key}`;
              copy(url, {
                onCopy: () => {
                  toast.info(`${url} 已复制到剪切板`);
                },
              });
            }}
          >
            {key}
            <span className="iconify oui--copy size-3.5" />
          </div>
        );
      },
      enableGlobalFilter: true,
      header: 'Key',
    },
    {
      accessorKey: 'value',
      cell: ({ getValue }) => {
        const url = getValue() as string;
        return <a href={url} className="text-accent hover:underline" target="_blank">{url}</a>;
      },
      enableGlobalFilter: true,
      header: 'URL',
    },
    {
      accessorKey: 'last_use',
      cell: ({ getValue }) => {
        const date = getValue() as Date;
        return (
          <div className="flex gap-1 items-center cursor-pointer">
            <FormatDate time={date} />
          </div>
        );
      },
      enableGlobalFilter: false,
      header: 'Date',
    },
    {
      cell: ({ row }) => {
        const key = row.original.key;

        return (
          <div className="flex gap-1">
            <Popover>
              <PopoverTrigger>
                <Button variant="link" className="text-gray">删除</Button>
              </PopoverTrigger>
              <PopoverContent className="p-6">
                <div className="mb-5">确认删除？</div>
                <div className="text-right">
                  <Button
                    variant="destructive"
                    size="sm"
                    className="text-xs h-6"
                    onClick={() => deleteLink(key)}
                  >
                    删除
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            <Button
              variant="link"
              className="text-gray"
              onClick={() => {
                const url = `${location.origin}/i/${key}`;
                window.open(url, '_blank');
              }}
            >
              跳转
            </Button>
          </div>
        );
      },
      enableGlobalFilter: false,
      header: 'Actions',
      id: 'actions',
    },
  ];
  const table = useReactTable({
    columns,
    data,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: 'fuzzy',
    onGlobalFilterChange: setGlobalFilter,
    state: {
      globalFilter,
    },
  });
  const { rows } = table.getRowModel();
  return (
    <Card>
      <Toaster position="top-right" />
      <CardHeader>
        <div className="flex items-center py-4">
          <Input
            placeholder="搜索……"
            value={globalFilter}
            onChange={event => table.setGlobalFilter(event.target.value)}
            className="max-w-sm focus-visible:ring-0"
          />
        </div>
      </CardHeader>
      <CardContent ref={tableContainerRef} className="max-h-[400px] overflow-auto relative">
        <Table>
          <TableHeader className="sticky">
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {!!rows?.length && !loading && (
              rows.map(row => (
                <TableRow
                  key={row.original.key}
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              )))}
            {!rows?.length && !loading && (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  没有数据
                </TableCell>
              </TableRow>
            )}
            {!rows?.length && loading && (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {/* <div className="loading loading-ring loading-md" /> */}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div />
      </CardContent>
      <CardFooter className="justify-center border-t p-4">
        <Drawer>
          <DrawerTrigger asChild>
            <Button size="sm" variant="ghost" className="gap-1">
              <span className="h-3.5 w-3.5 iconify mdi--plus-circle-outline" />
              添加短链
            </Button>
          </DrawerTrigger>
          <DrawerOverlay className="opacity-40!" />
          <DrawerContent>
            <DrawerHeader className="pt-6">
              <DrawerTitle>创建新的短链</DrawerTitle>
              <DrawerDescription>输入要转换的 url</DrawerDescription>
            </DrawerHeader>
            <div className="w-[80%] flex justify-center items-center mx-auto mt-10 mb-20">
              <label
                className="bg-gray/10 h-8 rounded-l-md px-2 leading-8 border border-input border-r-0"
              >
                URL:
              </label>
              <Input
                type="url"
                className="h-8 rounded-l-none rounded-r-md focus-visible:ring-0"
                value={url}
                onChange={e => setUrl(e.target.value)}
              />
            </div>
            <DrawerFooter className="flex gap-6 justify-center flex-row pb-10">
              <Button disabled={createLoading} onClick={runAsync}>
                <span className={cn('size-4', {
                  'iconify mdi--link-variant-plus': !createLoading,
                  'loading loading-ring loading-md': createLoading,
                })}
                />
                创建
              </Button>
              <DrawerClose>
                <Button variant="outline">
                  <span className="iconify mdi--cancel size-4" />
                  取消
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </CardFooter>
    </Card>
  );
}

export default ShortLink;
