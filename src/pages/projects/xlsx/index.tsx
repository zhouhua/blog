import Section from '@components/Section';
import { read, utils, writeFileXLSX } from 'xlsx';
import { ChangeEvent, FC, useCallback, useState } from 'react';

const { book_append_sheet, book_new, json_to_sheet, sheet_to_json } = utils;

const Index: FC = () => {
  const [progress, setProgress] = useState<number>(0);
  const upload = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) {
        return;
      }
      const data = await file.arrayBuffer();
      const workbook = read(data);
      const dataSource = sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
      console.log(dataSource);

      // const data = await file.arrayBuffer();
      // const workbook = read(data);
      // const dataSource = sheet_to_json(workbook.Sheets['all']);
      // const newWorkBook = book_new();

      // const split = [
      //   [0, 7],
      //   [8, 60],
      //   [61, 365],
      //   [366, Infinity]
      // ];
      // const names = ['0~7 group ', '8-60 group ', '61~365 group ', '>366 group '];
      // const indexes = [0, 0, 0, 0];
      // const tableMap: Record<string, any[]> = {};
      // [...names].reverse().forEach(name => {
      //   [3, 2, 1].forEach(group => {
      //     tableMap[name + group] = [];
      //   });
      // });
      // dataSource.forEach((row: any, progress: number) => {
      //   const value = +row['结清日距今天数'];
      //   const rangeIndex = split.findIndex(([min, max]) => value >= min && value <= max);
      //   const name = names[rangeIndex];
      //   const group = (indexes[rangeIndex] % 3) + 1;
      //   indexes[rangeIndex]++;
      //   const table = tableMap[name + group];
      //   table.push(row);
      //   Math.random() < 0.01 && console.log((progress / dataSource.length) * 100, '%');
      // });
      // let count = 0;
      // Object.entries(tableMap)
      //   .reverse()
      //   .forEach(([name, table]) => {
      //     const sheet = json_to_sheet(table);
      //     count += table.length;
      //     book_append_sheet(newWorkBook, sheet, name);
      //   });
      // console.log('count', count, dataSource.length);
      // writeFileXLSX(newWorkBook, 'export.xlsx');
    },
    [setProgress]
  );
  return (
    <Section narrow>
      <label htmlFor="file">选择文件</label>
      <input id="file" type="file" onChange={upload} />
    </Section>
  );
};

export default Index;
