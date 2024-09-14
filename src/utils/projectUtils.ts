import { difference, isEqual, union, uniqWith } from 'lodash';
import { utils } from 'xlsx';
import type { Range, WorkSheet } from 'xlsx';

// eslint-disable-next-line @typescript-eslint/unbound-method
const { encode_cell, decode_range, decode_cell } = utils;

export function transferRange(ranges?: Range[]): Record<string, [number, number]> | undefined {
  if (!ranges) {
    return undefined;
  }
  const output: Record<string, [number, number]> = {};
  ranges.forEach(({ s, e }) => {
    const key = encode_cell(s);
    output[key] = [e.c - s.c + 1, e.r - s.r + 1];
  });
  return output;
}

export function transferData(sheet: WorkSheet): unknown[][] {
  if (!sheet['!ref']) {
    return [];
  }
  const { e } = decode_range(sheet['!ref']);
  const [cols, rows] = [e.c, e.r];
  const data: unknown[][] = [];
  for (let i = 0; i <= rows; i++) {
    const row: unknown[] = [];
    data.push(row);
    for (let j = 0; j <= cols; j++) {
      row.push('');
    }
  }
  if (sheet['!data']) {
    sheet['!data'].forEach((row, i) => {
      row.forEach((cell, j) => {
        data[i][j] = cell.v;
      });
    },
    );
  }
  else {
    Object.entries(sheet).forEach(([key, value]) => {
      if (key.startsWith('!')) {
        return;
      }
      const { c, r } = decode_cell(key);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      data[r][c] = value.v;
    });
  }
  return data;
}

export function getRowCount(sheet: WorkSheet): number {
  if (!sheet['!ref']) {
    return 0;
  }
  const { e } = decode_range(sheet['!ref']);
  return e.r;
}

export function getColCount(sheet: WorkSheet): number {
  if (!sheet['!ref']) {
    return 0;
  }
  const { e } = decode_range(sheet['!ref']);
  return e.c;
}

function sortGroup(group: (number[] | number)[]): number[][] {
  return group.map(g => (Array.isArray(g) ? Array.from(new Set(g)).sort((a, b) => a - b) : [g]));
}

export function splitByCol(data: unknown[][], group: (number[] | number)[]) {
  const newGroup = uniqWith(sortGroup(group), isEqual);
  const allAffectedCol = union(...newGroup);
  const result = newGroup.map(cols => {
    const removeCols = difference(allAffectedCol, cols);
    return data.map(row => row.filter((_, col) => !removeCols.includes(col)));
  });
  return result;
}
