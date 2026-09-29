export type CalcExcelFailureReason
  = | 'column-not-found'
    | 'invalid-threshold'
    | 'missing-column'
    | 'not-exceeded';

export interface FindRowExceedingThresholdInput {
  sheetData: unknown[][];
  columns: string[];
  selectedColumn: string;
  threshold: string;
}

export type FindRowExceedingThresholdResult
  = | {
    ok: false;
    reason: CalcExcelFailureReason;
    cumulativeSum?: number;
  }
  | {
    ok: true;
    rowNumber: number;
    cumulativeSum: number;
    rowData: Record<string, unknown>;
  };

export function findRowExceedingThreshold({
  columns,
  selectedColumn,
  sheetData,
  threshold,
}: FindRowExceedingThresholdInput): FindRowExceedingThresholdResult {
  if (!selectedColumn) {
    return { ok: false, reason: 'missing-column' };
  }

  const thresholdValue = Number.parseFloat(threshold);
  if (Number.isNaN(thresholdValue)) {
    return { ok: false, reason: 'invalid-threshold' };
  }

  const columnIndex = columns.indexOf(selectedColumn);
  if (columnIndex === -1) {
    return { ok: false, reason: 'column-not-found' };
  }

  let cumulativeSum = 0;
  for (let i = 1; i < sheetData.length; i++) {
    const row = sheetData[i];
    if (!row) {
      continue;
    }

    const cellValue = Number.parseFloat(String(row[columnIndex] || 0));
    if (Number.isNaN(cellValue)) {
      continue;
    }

    cumulativeSum += cellValue;

    if (cumulativeSum > thresholdValue) {
      const rowData: Record<string, unknown> = {};
      columns.forEach((col, idx) => {
        rowData[col] = row[idx];
      });

      return {
        cumulativeSum,
        ok: true,
        rowData,
        rowNumber: i + 1,
      };
    }
  }

  return {
    cumulativeSum,
    ok: false,
    reason: 'not-exceeded',
  };
}
